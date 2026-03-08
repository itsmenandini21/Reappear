import Faculty from '../models/faculty.js';

// @desc    Get all faculty members (For Students to view)
// @route   GET /api/faculty
export const getFaculty = async (req, res) => {
    try {
        // Fetches all faculty from the database
        const faculty = await Faculty.find({});
        res.status(200).json(faculty);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch faculty data", error: error.message });
    }
};

// @desc    Add a new faculty member (For Admin)
// @route   POST /api/faculty
export const addFaculty = async (req, res) => {
    try {
        const newFaculty = await Faculty.create(req.body);
        res.status(201).json({ message: "Faculty added successfully", faculty: newFaculty });
    } catch (error) {
        res.status(400).json({ message: "Failed to add faculty", error: error.message });
    }
};

// @desc    Update faculty details (For Admin)
// @route   PUT /api/faculty/:id
export const updateFaculty = async (req, res) => {
    try {
        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFaculty) return res.status(404).json({ message: "Faculty not found" });
        
        res.status(200).json({ message: "Faculty updated", faculty: updatedFaculty });
    } catch (error) {
        res.status(400).json({ message: "Failed to update faculty", error: error.message });
    }
};

// @desc    Delete a faculty member (For Admin)
// @route   DELETE /api/faculty/:id
export const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) return res.status(404).json({ message: "Faculty not found" });
        
        res.status(200).json({ message: "Faculty removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete faculty", error: error.message });
    }
};