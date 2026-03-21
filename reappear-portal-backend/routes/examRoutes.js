import express from 'express';
import Exam from '../models/exam.js';
import Result from '../models/result.js';
import Subject from '../models/subject.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to format date nicely for frontend (e.g. "20 March 2026")
const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import ReappearRecord from '../models/reappearRecord.js';

// GET: Fetch all upcoming exams & past dynamic results for Student Dashboard
// Note: Frontend hits `/api/exams` without token logic originally, so protect is optional fallback for public viewing, but strict if they want grades.
router.get('/', async (req, res) => {
    try {
        let userId = null;

        // 1. Manually extract the user from the Bearer token (since 'protect' will block admins if misconfigured)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                // If not admin, set userId to filter. Admins see everything.
                if (user && user.role !== 'admin') {
                    userId = decoded.id;
                }
            } catch (err) {
                console.log("Token extraction failed in exams GET:", err.message);
            }
        }

        // 2. Fetch ALL exams sorted chronologically
        const allExams = await Exam.find().sort({ examDate: 1 });
        
        // 3. If it's a student, fetch their specific allowed subjects
        let allowedSubjects = new Set();
        if (userId) {
            // Find records mapping this student, populate the 'subject' to get the subjectCode
            const records = await ReappearRecord.find({ student: userId }).populate('subject');
            records.forEach(record => {
                if (record.subject && record.subject.subjectCode) {
                    allowedSubjects.add(record.subject.subjectCode);
                }
            });
        }

        const now = new Date();
        const formattedUpcoming = [];
        const formattedResults = [];

        for (let i = 0; i < allExams.length; i++) {
            const exam = allExams[i];

            // 4. FILTER: If a user isn't logged in, or they aren't assigned to this subject, skip it.
            // (Unless it's an admin bypass, but this route is primarily meant for the student dashboard display)
            if (userId && !allowedSubjects.has(exam.subjectCode)) {
                continue;
            }

            const examDate = new Date(exam.examDate);
            
            // Format base exam details
            const baseExam = {
                id: exam._id || i,
                examName: `${exam.semester} Sem - ${exam.department.substring(0, 3)}`,
                subject: exam.subjectCode,
                faculty: "TBA",
                date: formatDate(exam.examDate),
                time: exam.examTime,
                room: exam.roomAllocation || "TBA",
                syllabus: exam.syllabus || "Syllabus has not been released.",
                marks: "Evaluation in progress. The official result will be updated shortly.",
                total: "Pending"
            };

            // If exam is strictly in the past, it moves to Results
            if (examDate < now || exam.status === 'completed') {
                formattedResults.push(baseExam);
            } else {
                formattedUpcoming.push(baseExam);
            }
        }

        res.json({
            upcoming: formattedUpcoming,
            results: formattedResults 
        });
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: "Server Error while fetching exams." });
    }
});

// GET: Fetch all raw exams strictly for admin consumption
router.get('/all', protect, async (req, res) => {
    try {
        const exams = await Exam.find().sort({ examDate: -1 });
        res.json(exams);
    } catch (error) {
        console.error("Error fetching admin exams:", error);
        res.status(500).json({ message: "Server Error while fetching all exams." });
    }
});

// POST: Admin schedules a new exam
router.post('/', async (req, res) => {
    try {
        const { dept, sem, subject, date, time, room, syllabus } = req.body;

        // Backend validation
        if (!dept || !sem || !subject || !date || !time || !room) {
            return res.status(400).json({ message: "Please fill all required exam details." });
        }

        // Map frontend payload to mongoose schema
        const newExam = new Exam({
            department: dept,
            semester: sem,
            subjectCode: subject,
            examDate: new Date(date),
            examTime: time,
            roomAllocation: room,
            syllabus: syllabus || "",
            status: "upcoming"
        });

        await newExam.save();
        res.status(201).json({ message: 'Exam Scheduled Successfully!', exam: newExam });
    } catch (error) {
        console.error("Error scheduling exam:", error);
        res.status(500).json({ message: "Failed to schedule exam. Please try again." });
    }
});

// DELETE: Admin removes an exam
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExam = await Exam.findByIdAndDelete(id);
        
        if (!deletedExam) {
            return res.status(404).json({ message: "Exam not found." });
        }

        res.json({ message: "Exam removed successfully." });
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ message: "Server Error while deleting exam." });
    }
});

// PUT: Admin updates an existing exam
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dept, sem, subject, date, time, room, syllabus } = req.body;

        if (!dept || !sem || !subject || !date || !time || !room) {
            return res.status(400).json({ message: "Please fill all required exam details." });
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            id,
            {
                department: dept,
                semester: sem,
                subjectCode: subject,
                examDate: new Date(date),
                examTime: time,
                roomAllocation: room,
                syllabus: syllabus || "",
            },
            { new: true, runValidators: true }
        );

        if (!updatedExam) {
            return res.status(404).json({ message: "Exam not found." });
        }

        res.json({ message: "Exam Updated Successfully!", exam: updatedExam });
    } catch (error) {
        console.error("Error updating exam:", error);
        res.status(500).json({ message: "Server Error while updating exam." });
    }
});

export default router;
