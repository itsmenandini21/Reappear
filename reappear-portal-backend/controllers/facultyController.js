import Faculty from '../models/faculty.js';
import Subject from '../models/subject.js';

//GET /api/faculty
export const getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find({}).populate('subjects');
        res.status(200).json(faculty);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch faculty data", error: error.message });
    }
};


// POST /api/faculty
export const addFaculty = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ email });
        if (existingFaculty) {
            return res.status(400).json({ message: "Faculty with this email already exists" });
        }

        const newFaculty = await Faculty.create(req.body);
        res.status(201).json({ message: "Faculty added successfully", faculty: newFaculty });
    } catch (error) {
        res.status(400).json({ message: "Failed to add faculty", error: error.message });
    }
};

export const updateFaculty = async (req, res) => {
    try {
        const { name, department, phoneNumber, email, subjects } = req.body;
        const updatedFaculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            { name, department, phoneNumber, email, subjects },
            { new: true }
        );
        res.status(200).json(updatedFaculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//  DELETE /api/faculty/:id
export const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) return res.status(404).json({ message: "Faculty not found" });
        
        res.status(200).json({ message: "Faculty removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete faculty", error: error.message });
    }
};


//GET /api/faculty/subject?subjectCode=X
export const getFacultyBySubject = async (req, res) => {
    try {
        const { subjectCode } = req.query;
        if (!subjectCode) return res.status(400).json({ message: "Subject code is required" });

        const subjectDoc = await Subject.findOne({ subjectCode });
        if (!subjectDoc) return res.status(404).json({ message: "Subject not found in Database" });

        const facultyList = await Faculty.find({ subjects: subjectDoc._id });
        res.status(200).json(facultyList);
    } catch (error) {
        console.error("Failed to query mapped Faculty:", error);
        res.status(500).json({ message: "Error fetching mapped evaluators", error: error.message });
    }
};