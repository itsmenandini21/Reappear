import ReappearRecord from '../models/reappearRecord.js';

// @desc    Get all peers who have ACTIVE backlogs
// @route   GET /api/peers
export const getPeers = async (req, res) => {
    try {
        // Feature 4 Logic: Fetches students who are 'pending' or 'in-progress'
        const activeBacklogs = await ReappearRecord.find({ 
            status: { $in: ["pending", "in-progress"] } 
        })
        .populate('student', 'name rollNumber branch') 
        .populate('subject', 'code name');             

        res.status(200).json(activeBacklogs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch peers", error: error.message });
    }
};

// @desc    Admin adds a student to a reappear subject
// @route   POST /api/peers/add
export const addReappear = async (req, res) => {
    try {
        const { studentId, subjectId } = req.body;
        // Using your advanced schema defaults!
        const newRecord = await ReappearRecord.create({
            student: studentId,
            subject: subjectId,
            status: "pending",
            feesPaid: false,
            attemptCount: 1
        });
        res.status(201).json({ message: "Student added to Reappear successfully", record: newRecord });
    } catch (error) {
        res.status(400).json({ message: "Failed to add reappear record", error: error.message });
    }
};

// @desc    Admin updates status to 'cleared' (Removes them from Peers page)
// @route   PUT /api/peers/update/:id
export const updateReappearStatus = async (req, res) => {
    try {
        const { status, feesPaid, roomAllocation, examDate } = req.body; 
        
        // Updates the record with any of the amazing fields you added
        const updatedRecord = await ReappearRecord.findByIdAndUpdate(
            req.params.id, 
            { status, feesPaid, roomAllocation, examDate }, 
            { new: true }
        );
        
        if (!updatedRecord) return res.status(404).json({ message: "Record not found" });
        
        res.status(200).json({ message: "Record updated successfully", record: updatedRecord });
    } catch (error) {
        res.status(400).json({ message: "Failed to update record", error: error.message });
    }
};