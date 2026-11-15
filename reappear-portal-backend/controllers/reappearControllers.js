import mongoose from "mongoose";
import ReappearRecord from "../models/reappearRecord.js";
import Subject from "../models/subject.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";
import Announcement from "../models/announcement.js";

const PORTAL_LOGIN_URL = "https://reappear.vercel.app/login";
const ACTIVE_STATUSES = ["pending", "in-progress"];

// Escape user/DB values before putting them inside email HTML.
const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${d}/${m}/${date.getFullYear()}`;
};

const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const buildBacklogEmail = (studentName, subjects) => {
    const subjectListHtml = subjects
        .map((sub) => `<li><strong>${escapeHtml(sub.subjectName)} (${escapeHtml(sub.subjectCode)})</strong></li>`)
        .join("");
    const heading = subjects.length === 1
        ? "You have been marked for reappear in the following subject:"
        : "You have been marked for reappears in the following subjects:";

    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
            <h2 style="color: #4a90e2;">Action Required: Reappear Form Updates</h2>
            <p>Dear <b>${escapeHtml(studentName)}</b>,</p>
            <p>${heading}</p>
            <ul style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                ${subjectListHtml}
            </ul>
            <p>Please log in to your NIT KKR Reappear Portal to view your assigned subjects and complete the required forms.</p>
            <br/>
            <a href="${PORTAL_LOGIN_URL}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
            <br/><br/>
            <p>- Exam Cell, NIT Kurukshetra</p>
        </div>
    </div>`;
};

// Fire-and-forget: the admin's request should not wait for (or fail because of) email delivery.
const notifyStudent = (student, rollNumber, subjects) => {
    const recipientEmail = student?.email || `${rollNumber}@nitkkr.ac.in`;
    const studentName = student?.name || rollNumber;

    return sendEmail(recipientEmail, "Action Required: Reappear Form Updates", buildBacklogEmail(studentName, subjects))
        .catch((error) => console.error(`Failed to send backlog email to ${recipientEmail}:`, error));
};

// GET /api/reappear/my-reappears
export const getMyReappears = async (req, res) => {
    try {
        const studentId = req.user._id || req.user.id;
        const rollNumber = req.user.rollNumber;

        if (!studentId && !rollNumber) {
            return res.status(401).json({ message: "Not authorized, user details missing" });
        }

        const reappears = await ReappearRecord.find({
            $or: [{ student: studentId }, { rollNumber }]
        }).populate("subject");

        // Only notices whose deadline has not passed yet. If a subject has several,
        // keep the one with the nearest deadline (sorted ascending, first one wins).
        const activeNotices = await Announcement.find({
            category: { $in: ["Academic", "Fees"] },
            subject: { $exists: true, $ne: null },
            deadline: { $gte: startOfToday() }
        }).sort({ deadline: 1 });

        const noticeMap = {};
        activeNotices.forEach((notice) => {
            const key = notice.subject.toString();
            if (!noticeMap[key]) noticeMap[key] = notice;
        });

        const groupedBySemester = reappears.reduce((acc, record) => {
            if (!record.subject) return acc;

            const sem = record.subject.semester || "Other";
            if (!acc[sem]) acc[sem] = [];

            const linkedNotice = noticeMap[record.subject._id.toString()];

            acc[sem].push({
                id: record._id,
                name: record.subject.subjectName || "Unknown Subject",
                code: record.subject.subjectCode || "N/A",
                subjectObjectId: record.subject._id,
                status: record.status || "pending",
                hasApplied: record.feesPaid,
                hasActiveNotice: Boolean(linkedNotice),
                noticeDeadline: linkedNotice ? formatDate(new Date(linkedNotice.deadline)) : null,
                credits: record.subject.credits || 0,
                semester: sem
            });

            return acc;
        }, {});

        res.status(200).json(groupedBySemester);
    } catch (error) {
        console.error("Error fetching reappears:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// POST /api/reappear/add-bulk   body: { assignments: [{ rollNumber, subjectId }] }
export const addBulkReappears = async (req, res) => {
    try {
        const { assignments } = req.body;

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ message: "assignments array is required" });
        }

        // 1. Clean input: trim, drop incomplete/invalid entries, remove duplicates inside the payload.
        const seen = new Set();
        const cleaned = [];
        for (const assignment of assignments) {
            const rollNumber = String(assignment?.rollNumber ?? "").trim();
            const subjectId = String(assignment?.subjectId ?? "").trim();
            if (!rollNumber || !mongoose.isValidObjectId(subjectId)) continue;

            const key = `${rollNumber}|${subjectId}`;
            if (seen.has(key)) continue;
            seen.add(key);
            cleaned.push({ rollNumber, subjectId });
        }

        if (cleaned.length === 0) {
            return res.status(400).json({ message: "No valid assignments provided" });
        }

        // 2. Validate every subject exists, in one query, BEFORE writing anything.
        const subjectIds = [...new Set(cleaned.map((a) => a.subjectId))];
        const subjects = await Subject.find({ _id: { $in: subjectIds } });
        const subjectById = new Map(subjects.map((s) => [s._id.toString(), s]));
        const missing = subjectIds.filter((id) => !subjectById.has(id));
        if (missing.length > 0) {
            return res.status(400).json({ message: "Some subjects do not exist", missingSubjectIds: missing });
        }

        // 3. Skip backlogs the student already has active (pending / in-progress).
        const rollNumbers = [...new Set(cleaned.map((a) => a.rollNumber))];
        const existing = await ReappearRecord.find({
            rollNumber: { $in: rollNumbers },
            subject: { $in: subjectIds },
            status: { $in: ACTIVE_STATUSES }
        }).select("rollNumber subject");
        const existingKeys = new Set(existing.map((r) => `${r.rollNumber}|${r.subject.toString()}`));

        const toCreate = cleaned.filter((a) => !existingKeys.has(`${a.rollNumber}|${a.subjectId}`));
        const skipped = cleaned.length - toCreate.length;

        if (toCreate.length === 0) {
            return res.status(200).json({
                message: "All selected backlogs are already assigned. Nothing new was added.",
                records: [],
                skipped
            });
        }

        // 4. Link to registered users (one query), then insert all records at once.
        const users = await User.find({ rollNumber: { $in: rollNumbers } }).select("name email rollNumber");
        const userByRoll = new Map(users.map((u) => [u.rollNumber, u]));

        const records = await ReappearRecord.insertMany(
            toCreate.map(({ rollNumber, subjectId }) => ({
                rollNumber,
                student: userByRoll.get(rollNumber)?._id ?? null,
                subject: subjectId,
                status: "pending",
                feesPaid: false,
                attemptCount: 1
            }))
        );

        // 5. One email per student listing all of their newly added subjects.
        const subjectsByRoll = {};
        toCreate.forEach(({ rollNumber, subjectId }) => {
            (subjectsByRoll[rollNumber] ||= []).push(subjectById.get(subjectId));
        });
        Object.entries(subjectsByRoll).forEach(([rollNumber, subs]) => {
            notifyStudent(userByRoll.get(rollNumber), rollNumber, subs);
        });

        const studentCount = Object.keys(subjectsByRoll).length;
        res.status(201).json({
            message: `Successfully assigned ${records.length} backlogs to ${studentCount} students` +
                (skipped ? ` (${skipped} already assigned, skipped)` : ""),
            records,
            skipped
        });
    } catch (error) {
        console.error("Failed to add bulk reappears:", error);
        res.status(500).json({ message: "Failed to add records", error: error.message });
    }
};

// POST /api/reappear/add   body: { rollNumber, subjectId }
export const addReappear = async (req, res) => {
    try {
        const rollNumber = String(req.body?.rollNumber ?? "").trim();
        const subjectId = String(req.body?.subjectId ?? "").trim();

        if (!rollNumber || !subjectId) {
            return res.status(400).json({ message: "rollNumber and subjectId are required" });
        }
        if (!mongoose.isValidObjectId(subjectId)) {
            return res.status(400).json({ message: "Invalid subjectId" });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const alreadyAssigned = await ReappearRecord.exists({
            rollNumber,
            subject: subjectId,
            status: { $in: ACTIVE_STATUSES }
        });
        if (alreadyAssigned) {
            return res.status(409).json({ message: "This backlog is already assigned to the student" });
        }

        const existingStudent = await User.findOne({ rollNumber }).select("name email");

        const newRecord = await ReappearRecord.create({
            rollNumber,
            student: existingStudent?._id ?? null,
            subject: subjectId,
            status: "pending",
            feesPaid: false,
            attemptCount: 1
        });

        notifyStudent(existingStudent, rollNumber, [subject]);

        res.status(201).json({ message: "Student added successfully", record: newRecord });
    } catch (error) {
        console.error("Failed to add reappear:", error);
        res.status(500).json({ message: "Failed to add record", error: error.message });
    }
};

// GET /api/reappear/check/:rollNumber
export const checkExistingBacklogs = async (req, res) => {
    try {
        const rollNumber = String(req.params.rollNumber ?? "").trim();
        const existingRecords = await ReappearRecord.find({
            rollNumber,
            status: { $in: ACTIVE_STATUSES }
        }).populate("subject", "subjectCode");

        res.status(200).json(existingRecords);
    } catch (error) {
        console.error("Error checking existing backlogs:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// GET /api/reappear/admin/eligible-students?subjectCode=XXX
export const getEligibleStudentsForResults = async (req, res) => {
    try {
        const subjectCode = String(req.query.subjectCode ?? "").trim().toUpperCase();
        if (!subjectCode) return res.status(400).json({ message: "Subject Code is required" });

        const subject = await Subject.findOne({ subjectCode }).select("_id");
        if (!subject) return res.status(200).json([]);

        // Unique roll numbers straight from the database (no full-collection scan).
        const rollNumbers = await ReappearRecord.distinct("rollNumber", { subject: subject._id });

        res.status(200).json(rollNumbers.filter(Boolean));
    } catch (error) {
        console.error("Failed to fetch eligible students for results:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
