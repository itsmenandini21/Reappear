import Pyq from '../models/pyq.js';

// @desc    Get all PYQs (For Students)
// @route   GET /api/pyq
export const getPyqs = async (req, res) => {
    try {
        const pyqs = await Pyq.find({}).sort({ year: -1 }); // Newest first
        res.status(200).json(pyqs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch PYQs", error: error.message });
    }
};

// @desc    Admin uploads a new PYQ
// @route   POST /api/pyq/upload
export const uploadPyq = async (req, res) => {
    try {
        // req.file is automatically created by Multer!
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a PDF file" });
        }

        const { subjectCode, year } = req.body;
        
        // Create the URL that the frontend will use to download the PDF
        const pdfUrl = `/uploads/${req.file.filename}`; 

        const newPyq = await Pyq.create({ subjectCode, year, pdfUrl });
        res.status(201).json({ message: "PYQ uploaded successfully", pyq: newPyq });
    } catch (error) {
        res.status(400).json({ message: "Failed to upload PYQ", error: error.message });
    }
};