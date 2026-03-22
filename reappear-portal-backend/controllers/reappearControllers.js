import ReappearRecord from "../models/reappearRecord.js";
import Subject from "../models/subject.js"; 
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";
import Announcement from "../models/announcement.js"; // IMPORTED ANNOUNCEMENT
import mongoose from "mongoose";
// Note: 'User' import ki zaroorat nahi hai agar hum seedha req.user.id use kar rahe hain

export const getMyReappears = async (req, res) => {
  try {
    // 1. Token se User details nikalna
    // req.user humein protect middleware se milta hai
    const studentId = req.user._id || req.user.id;
    const rollNumber = req.user.rollNumber;

    if (!studentId && !rollNumber) {
      return res.status(401).json({ message: "Not authorized, user details missing" });
    }

    // 2. Dual Search: ID se dhoondo YA Roll Number se 
    // Isse aapka 500 error khatam ho jayega agar ID mismatch hui toh
    const reappears = await ReappearRecord.find({
      $or: [
        { student: studentId },
        { rollNumber: rollNumber }
      ]
    })
    .populate("subject") 
    .exec();

    // 2.5 Find all Active Academic Notices to see which subjects are currently open
    // Fetch all academic notices that have a subject linked.
    const activeNotices = await Announcement.find({ category: 'Academic', subject: { $exists: true, $ne: null } });
    
    // Create a fast lookup map: { subjectId: NoticeDocument }
    const noticeMap = {};
    activeNotices.forEach(notice => {
      noticeMap[notice.subject.toString()] = notice;
    });

    // 3. Grouping Logic (Safe approach)
    const groupedBySemester = reappears.reduce((acc, record) => {
      // Agar subject null hai (deleted subject), toh crash na ho
      if (!record.subject) return acc;

      const sem = record.subject.semester || "Other";
      
      if (!acc[sem]) {
        acc[sem] = [];
      }
      
      const subjectObjectIdStr = record.subject._id.toString();
      const linkedNotice = noticeMap[subjectObjectIdStr];

      acc[sem].push({
        id: record._id,
        name: record.subject.subjectName || "Unknown Subject",
        code: record.subject.subjectCode || "N/A",
        subjectObjectId: record.subject._id,
        status: record.status || "pending",
        hasApplied: record.feesPaid,
        hasActiveNotice: !!linkedNotice, // NEW FIELD: true/false if notice exists
        noticeDeadline: (linkedNotice && linkedNotice.deadline) ? new Date(linkedNotice.deadline).toLocaleDateString('en-GB') : null, // NEW FIELD
        credits: record.subject.credits || 0,
        semester: sem
      });

      return acc;
    }, {});

    res.status(200).json(groupedBySemester);

  } catch (error) {
    console.error("Error fetching reappears:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};

export const addReappear = async (req, res) => {
    try {
        const { rollNumber, subjectId } = req.body;

        if (!rollNumber || !subjectId) {
            return res.status(400).json({ message: "rollNumber and subjectId are required" });
        }

        const existingStudent = await User.findOne({ rollNumber });

        const newRecord = await ReappearRecord.create({
            rollNumber: rollNumber,
            student: existingStudent ? existingStudent._id : null, 
            subject: subjectId,
            status: "pending",
            feesPaid: false,
            attemptCount: 1
        });

        const recipientEmail = (existingStudent && existingStudent.email) ? existingStudent.email : `${rollNumber}@nitkkr.ac.in`;
        const studentName = (existingStudent && existingStudent.name) ? existingStudent.name : rollNumber;

        const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #4a90e2;">Action Required: Reappear Form Updates</h2>
                <p>Dear <b>${studentName}</b>,</p>
                <p>You have been marked for reappears in specific subjects by the Exam Cell.</p>
                <p>Please log in to your NIT KKR Reappear Portal to view your assigned subjects.</p>
                <br/>
                <a href="http://localhost:3000/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
                <br/><br/>
                <p>- Exam Cell, NIT Kurukshetra</p>
            </div>
        </div>`;
        
        await sendEmail(recipientEmail, "Action Required: Reappear Form Updates", emailHtml);

        res.status(201).json({ message: "Student added successfully", record: newRecord });
    } catch (error) {
        res.status(400).json({ message: "Failed to add record", error: error.message });
    }
};

// @desc    Admin updates status
// @route   PUT /api/reappear/update/:id
export const updateReappearStatus = async (req, res) => {
    try {
        const { status, feesPaid, roomAllocation, examDate } = req.body; 
        
        const updatedRecord = await ReappearRecord.findByIdAndUpdate(
            req.params.id, 
            { status, feesPaid, roomAllocation, examDate }, 
            { new: true }
        );
        
        if (!updatedRecord) return res.status(404).json({ message: "Record not found" });
        
        res.status(200).json({ message: "Record updated successfully", record: updatedRecord });
    } catch (error) {
        res.status(400).json({ message: "Failed to update record", error: error.message });
    }
};

// @desc    Check existing backlogs for a student by roll number
// @route   GET /api/reappear/check/:rollNumber
export const checkExistingBacklogs = async (req, res) => {
    try {
        const { rollNumber } = req.params;
        // Sirf pending ya in-progress wale records check karenge
        // Kyunki agar 'cleared' hai toh admin dobara add kar sakta hai
        const existingRecords = await ReappearRecord.find({ 
            rollNumber: rollNumber,
            status: { $in: ["pending", "in-progress"] }
        }).populate('subject', 'subjectCode'); // Sirf subjectCode populate karo fast response ke liye

        res.status(200).json(existingRecords);
    } catch (error) {
        console.error("Error checking existing backlogs:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// @desc    Admin fetches all reappears for Fee Tracker
// @route   GET /api/reappear/admin/fee-tracker
export const getFeeTrackerData = async (req, res) => {
    try {
        // Find both pending & in-progress
        const records = await ReappearRecord.find()
            .populate('student', 'name email rollNumber')
            .populate('subject', 'subjectName subjectCode department semester');
        
        res.status(200).json(records);
    } catch (error) {
        console.error("Error in fee tracker fetch:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// @desc    Admin sends an email dynamically to a student
// @route   POST /api/reappear/admin/send-email
export const sendAdminEmail = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        if (!email || !subject || !message) {
            return res.status(400).json({ message: "Please provide email, subject, and message" });
        }
        
        const htmlMessage = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #ff2600;">Urgent: Action Required</h2>
                <p style="font-size: 15px; color: #333; line-height: 1.5;">${message.replace(/\n/g, '<br/>')}</p>
                <br/>
                <p>Please log in to your NIT KKR Reappear Portal and complete the required actions to avoid penalties.</p>
                <a href="http://localhost:3000/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Login to Portal</a>
                <br/><br/>
                <p style="color: #888; font-size: 13px;">- Exam Cell, NIT Kurukshetra</p>
            </div>
        </div>`;
        
        await sendEmail(email, subject, htmlMessage);
        res.status(200).json({ message: "Email sent successfully to " + email });
    } catch (error) {
        console.error("Error sending admin email:", error);
        res.status(500).json({ message: "Failed to send email", error: error.message });
    }
};

// @desc    Admin fetches eligible students for a specific subject
// @route   GET /api/reappear/admin/eligible-students
export const getEligibleStudentsForResults = async (req, res) => {
    try {
        const { subjectCode } = req.query; 
        if (!subjectCode) return res.status(400).json({ message: "Subject Code is required" });

        // Retrieve all reappear records and populate subject and student fields
        const records = await ReappearRecord.find()
            .populate('subject', 'subjectCode')
            .populate('student', 'rollNumber');

        // Filter purely to the targeted subject code 
        const filtered = records.filter(r => r.subject && r.subject.subjectCode === subjectCode);
        
        // Extract roll numbers and prune any nullish definitions
        const rollNumbers = filtered.map(r => r.rollNumber).filter(Boolean);
        
        // Return absolutely unique Array of students so admins don't mark duplicates
        res.status(200).json([...new Set(rollNumbers)]);
    } catch (error) {
        console.error("Failed to fetch eligible students for results:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};