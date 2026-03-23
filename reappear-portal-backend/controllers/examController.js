import Exam from '../models/exam.js';
import Result from '../models/result.js'; 

export const scheduleExam = async (req, res) => {
    try {
        // Look for 'syllabus' instead of 'syllabusLink'
        const { dept, branch, sem, subject, date, time, room, examType, component, syllabus } = req.body;

        const newExam = await Exam.create({
            department: dept,
            branch: branch,
            semester: sem,
            subjectCode: subject,
            examDate: date,
            examTime: time,
            examType: examType || 'End-Sem',
            examComponent: component || 'Theory',
            roomAllocation: room,
            syllabus: syllabus || "" // Saves the typed text
        });

        res.status(201).json({ message: "Exam scheduled successfully", exam: newExam });
    } catch (error) {
        res.status(400).json({ message: "Failed to schedule exam", error: error.message });
    }
};

export const getStudentExamsAndResults = async (req, res) => {
    try {
        const upcomingExams = await Exam.find({ status: 'upcoming' }).sort({ examDate: 1 });
        
        const formattedUpcoming = upcomingExams.map(exam => ({
            id: exam._id,
            examName: 'Reappear Exam', 
            subject: exam.subjectCode,
            faculty: 'Exam Cell', 
            examType: exam.examType || 'End-Sem',
            examComponent: exam.examComponent || 'Theory',
            date: new Date(exam.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: exam.examTime,
            room: exam.roomAllocation,
            // If text exists, show it. Otherwise, show the default warning.
            syllabus: exam.syllabus ? exam.syllabus : 'Syllabus has not been released.'
        }));

        const studentResults = await Result.find({}).populate('subject', 'name');
        
        const formattedResults = studentResults.map(result => ({
            id: result._id,
            examName: 'Reappear Result', 
            subject: result.subject ? result.subject.name : 'Unknown Subject',
            faculty: 'Exam Cell',
            marks: result.marksObtained,
            total: result.totalMarks || 100
        }));

        res.status(200).json({
            upcoming: formattedUpcoming,
            results: formattedResults
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch student dashboard data", error: error.message });
    }
};