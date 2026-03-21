import Result from '../models/result.js';
import ReappearRecord from '../models/reappearRecord.js';
import User from '../models/user.js';
import Subject from '../models/subject.js';
// @desc    Get results for a specific student (For the Student Dashboard)
// @route   GET /api/results/:studentId
export const getStudentResults = async (req, res) => {
    try {
        // Fetches the results and populates the correct subject schema properties
        const results = await Result.find({ student: req.params.studentId })
            .populate('subject', 'subjectCode subjectName credits semester department branch');
            
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

        // 2. AUTOMATION: If passing, completely delete the Reappear Record. If failing, update status.
        if (grade !== 'F' && grade !== 'Fail') {
            await ReappearRecord.findOneAndDelete({ student: studentId, subject: subjectId });
        } else {
            await ReappearRecord.findOneAndUpdate(
                { student: studentId, subject: subjectId },
                { status: "failed" }
            );
        }

        res.status(201).json({ message: "Result published and backlog cleared!", result: newResult });
    } catch (error) {
        res.status(400).json({ message: "Failed to upload result", error: error.message });
    }
};

// @desc    Admin uploads bulk results for a specific subject
// @route   POST /api/results/bulk
export const addBulkResults = async (req, res) => {
    try {
        const { subjectCode, totalMarks, evaluatedBy, results } = req.body;
        
        if (!subjectCode || !results || !Array.isArray(results)) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        const subjectDoc = await Subject.findOne({ subjectCode });
        if (!subjectDoc) return res.status(404).json({ message: "Subject exactly matching this code not found in Subjects Schema" });

        const rollNumbers = results.map(r => r.rollNumber);
        const students = await User.find({ rollNumber: { $in: rollNumbers } });
        const studentMap = {};
        students.forEach(s => studentMap[s.rollNumber] = s._id);

        let createdCount = 0;

        for (const r of results) {
            const studentId = studentMap[r.rollNumber];
            if (!studentId) continue;

            const grade = r.status === 'Pass' ? 'A' : 'F';

            // Create result logic
            await Result.create({
                student: studentId,
                subject: subjectDoc._id,
                evaluatedBy: evaluatedBy || null,
                marksObtained: r.marksObtained,
                totalMarks: totalMarks,
                grade: grade,
                remarks: r.status
            });

            // Completely destroy ReappearRecord if the student passes, otherwise keep it as 'failed'
            if (r.status.toLowerCase() === 'pass') {
                await ReappearRecord.findOneAndDelete({ student: studentId, subject: subjectDoc._id });
            } else {
                await ReappearRecord.findOneAndUpdate(
                    { student: studentId, subject: subjectDoc._id },
                    { status: 'failed' }
                );
            }
            createdCount++;
        }

        res.status(201).json({ message: `Successfully published ${createdCount} results direct to Database!` });
    } catch (error) {
        res.status(500).json({ message: "Failed to publish Bulk results", error: error.message });
    }
};