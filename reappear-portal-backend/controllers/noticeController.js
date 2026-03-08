import Notice from '../models/notice.js';

// @desc    Get all notices (For Students to view in the Announcement section)
// @route   GET /api/notices
export const getNotices = async (req, res) => {
    try {
        // Fetch all notices and sort them by newest first
        const notices = await Notice.find({}).sort({ createdAt: -1 });
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notices", error: error.message });
    }
};

// @desc    Create a new notice (For Admin)
// @route   POST /api/notices
export const createNotice = async (req, res) => {
    try {
        const { title, message } = req.body;
        const newNotice = await Notice.create({ title, message });
        res.status(201).json({ message: "Notice posted successfully", notice: newNotice });
    } catch (error) {
        res.status(400).json({ message: "Failed to post notice", error: error.message });
    }
};

// @desc    Delete a notice (For Admin)
// @route   DELETE /api/notices/:id
export const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) return res.status(404).json({ message: "Notice not found" });
        
        res.status(200).json({ message: "Notice removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete notice", error: error.message });
    }
};