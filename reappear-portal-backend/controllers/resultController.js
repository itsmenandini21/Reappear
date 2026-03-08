import Result from '../models/result.js';
import ReappearRecord from '../models/reappearRecord.js';

// @desc    Get results for a specific student (For the Student Dashboard)
// @route   GET /api/results/:studentId
export const getStudentResults = async (req, res) => {
    try {
        // Fetches the results and populates the subject details (like code: 'IT-501')
        const results = await Result.find({ student: req.params.studentId })
            .populate('subject', 'code name credits sem');
            
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch results", error: error.message });
    }
};

// @desc    Admin uploads a result for a student
// @route   POST /api/results
export const addResult = async (req, res) => {
    try {
        const { studentId, subjectId, marksObtained, grade, remarks } = req.body;

        // 1. Create the official result card
        const newResult = await Result.create({
            student: studentId,
            subject: subjectId,
            marksObtained,
            grade,
            remarks
        });

        // 2. AUTOMATION: Find their pending reappear record and mark it as "cleared"
        await ReappearRecord.findOneAndUpdate(
            { student: studentId, subject: subjectId },
            { status: "cleared" }
        );

        res.status(201).json({ message: "Result published and backlog cleared!", result: newResult });
    } catch (error) {
        res.status(400).json({ message: "Failed to upload result", error: error.message });
    }
};