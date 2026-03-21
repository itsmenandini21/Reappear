import Result from '../models/result.js';
import Subject from '../models/subject.js';
import Faculty from '../models/faculty.js';

// @desc    Get fail rate estimation for a subject and optionally a specific professor
// @route   GET /api/estimator/fail-rate/:subjectId?professorId=...
export const getFailRateEstimation = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { professorId } = req.query;

        // Query base: all results for this subject
        const query = { subject: subjectId };
        
        // If a specific professor is selected, filter by evaluatedBy
        if (professorId) {
            query.evaluatedBy = professorId;
        }

        const stats = await Result.aggregate([
            { $match: query }, // Filter by subject (and optionally professor)
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    failedStudents: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$grade", "F"] },
                                        { $eq: ["$remarks", "Fail"] }
                                    ]
                                },
                                1, // count as fail
                                0 // else
                            ]
                        }
                    }
                }
            }
        ]);

        if (!stats || stats.length === 0) {
            return res.status(200).json({
                message: "No historical data available for estimation yet.",
                totalStudents: 0,
                failedStudents: 0,
                failRate: 0,
                difficulty: "Unknown"
            });
        }

        const data = stats[0];
        const failRate = data.totalStudents > 0 
            ? ((data.failedStudents / data.totalStudents) * 100).toFixed(2)
            : 0;

        let difficulty = "Unknown";
        if (failRate >= 50) difficulty = "Extreme (High Risk)";
        else if (failRate >= 30) difficulty = "Hard";
        else if (failRate >= 15) difficulty = "Moderate";
        else difficulty = "Easy";

        return res.status(200).json({
            totalStudents: data.totalStudents,
            failedStudents: data.failedStudents,
            failRate: parseFloat(failRate),
            difficulty
        });

    } catch (error) {
        console.error("Estimator error:", error);
        res.status(500).json({ message: "Failed to estimate fail rate", error: error.message });
    }
};

// @desc    Get all subjects and faculties to populate the estimator dropdowns
// @route   GET /api/estimator/options
export const getEstimatorOptions = async (req, res) => {
    try {
        const subjects = await Subject.find({}).select('subjectCode subjectName _id');
        const faculties = await Faculty.find({}).select('name department _id').populate('subjects', 'subjectName');
        
        res.status(200).json({
            subjects,
            faculties
        });
    } catch (error) {
        console.error("Failed to fetch estimator options", error);
        res.status(500).json({ message: "Failed to load options", error: error.message });
    }
};
