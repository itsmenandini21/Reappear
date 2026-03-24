import express from 'express';
import Exam from '../models/exam.js';
import Result from '../models/result.js';
import Subject from '../models/subject.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import ReappearRecord from '../models/reappearRecord.js';


router.get('/', async (req, res) => {
    try {
        let userId = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user && user.role !== 'admin') {
                    userId = decoded.id;
                }
            } catch (err) {
                console.log("Token extraction failed in exams GET:", err.message);
            }
        }

        const allExams = await Exam.find().sort({ examDate: 1 });
        
        let allowedSubjects = new Set();
        if (userId) {
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

            
            if (userId && !allowedSubjects.has(exam.subjectCode)) {
                continue;
            }

            const examDate = new Date(exam.examDate);
            
           
            const baseExam = {
                id: exam._id || i,
                examName: `${exam.semester} Sem - ${exam.department.substring(0, 3)}`,
                subject: exam.subjectCode,
                faculty: "TBA",
                examType: exam.examType || "End-Sem",
                examComponent: exam.examComponent || "Theory",
                date: formatDate(exam.examDate),
                time: exam.examTime,
                room: exam.roomAllocation || "TBA",
                syllabus: exam.syllabus || "Syllabus has not been released.",
                marks: "Evaluation in progress. The official result will be updated shortly.",
                total: "Pending"
            };

            
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
router.get('/all', protect, async (req, res) => {
    try {
        const exams = await Exam.find().sort({ examDate: -1 });
        res.json(exams);
    } catch (error) {
        console.error("Error fetching admin exams:", error);
        res.status(500).json({ message: "Server Error while fetching all exams." });
    }
});
router.post('/', async (req, res) => {
    try {
        const { dept, branch, sem, subject, date, time, room, examType, component, syllabus } = req.body;

        if (!dept || !branch || !sem || !subject || !date || !time || !room || !examType || !component) {
            return res.status(400).json({ message: "Please fill all required exam details, including Type and Component." });
        }

        // Prevent duplicate exam scheduling for the same subject, type, and component
        const existingExam = await Exam.findOne({ 
            subjectCode: subject, 
            examType: examType,
            examComponent: component 
        });
        
        if (existingExam) {
            return res.status(400).json({ message: `A ${examType} (${component}) exam has already been scheduled for this subject.` });
        }

        const newExam = new Exam({
            department: dept,
            branch: branch,
            semester: sem,
            subjectCode: subject,
            examDate: new Date(date),
            examTime: time,
            examType: examType,
            examComponent: component,
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

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dept, branch, sem, subject, date, time, room, examType, component, syllabus } = req.body;

        if (!dept || !branch || !sem || !subject || !date || !time || !room || !examType || !component) {
            return res.status(400).json({ message: "Please fill all required exam details, including Type and Component." });
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            id,
            {
                department: dept,
                branch: branch,
                semester: sem,
                subjectCode: subject,
                examDate: new Date(date),
                examTime: time,
                examType: examType,
                examComponent: component,
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
