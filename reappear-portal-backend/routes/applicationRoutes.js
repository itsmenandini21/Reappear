import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// POST: Submit a new Reappear Form
router.post('/apply', async (req, res) => {
    try {
        const newApp = new Application(req.body);
        const savedApp = await newApp.save();
        res.status(201).json({ message: "Application submitted successfully!", application: savedApp });
    } catch (error) {
        console.error("Form Submission Error:", error);
        res.status(500).json({ message: "Server error while submitting form." });
    }
});

// GET: Fetch all applications (YOUR FRIEND WILL USE THIS TOMORROW)
router.get('/', async (req, res) => {
    try {
        const apps = await Application.find().sort({ appliedAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching applications." });
    }
});

export default router;