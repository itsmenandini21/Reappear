import Pyq from '../models/pyq.js';
import ReappearRecord from '../models/reappearRecord.js';

export const getPyqs = async (req, res) => {
    try {
        const { semester, branch, search } = req.query;
        const studentId = req.user?._id; // User check for safety

        let query = {};
        // Convert to Number to avoid casting issues
        if (semester) query.semester = Number(semester);
        if (branch && branch !== 'All') query.branch = branch;

        // Fetch all PYQs based on filters
        let pyqs = await Pyq.find(query)
            .populate('subject')
            .sort({ year: -1 })
            .lean(); // lean() improves performance and makes it a JS object

        // Priority Logic: Reappear subjects top par
        if (!semester && (!branch || branch === 'All') && !search && studentId) {
            const studentReappears = await ReappearRecord.find({ 
                student: studentId, 
                status: { $in: ["pending", "in-progress"] } 
            }).select('subject');

            const reappearSubjectIds = studentReappears.map(r => r.subject?.toString());

            pyqs.sort((a, b) => {
                // Safety check for null subjects
                const isA = a.subject && reappearSubjectIds.includes(a.subject._id.toString()) ? 1 : 0;
                const isB = b.subject && reappearSubjectIds.includes(b.subject._id.toString()) ? 1 : 0;
                return isB - isA; 
            });
        }

        // Pass pure empty array to frontend so they can render a sleek Empty State
        if (pyqs.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(pyqs);
    } catch (error) {
        console.error("GET PYQs Error:", error);
        res.status(500).json({ message: "Error fetching PYQs", error: error.message });
    }
};

export const uploadPyq = async (req, res) => {
    try {
        console.log("== UPLOAD TRACE ==");
        console.log("Req Body:", req.body);
        console.log("Req File:", req.file);

        if (!req.file) {
            console.log("Error: No file detected!");
            return res.status(400).json({ message: "PDF missing" });
        }
        
        const { subjectId, semester, branch, year } = req.body;

        // Input validation
        if (!subjectId || !semester || !branch || !year) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const pdfUrl = `/uploads/${req.file.filename}`;

        const newPyq = await Pyq.create({ 
            subject: subjectId, 
            semester: Number(semester), // Convert to Number
            branch, 
            year: Number(year), // Convert to Number
            pdfUrl 
        });

        res.status(201).json(newPyq);
    } catch (error) {
        console.error("UPLOAD Error:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};