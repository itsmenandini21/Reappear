import Application from '../models/Application.js';
import User from '../models/user.js';

// @desc    Submit new reappear application
// @route   POST /api/applications/apply
export const submitApplication = async (req, res) => {
  try {
    const { subjectId, transactionId, reappearRecordId, receiptUrl } = req.body;

    // 1. Check if user exists (Optional but safe)
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Check if transaction ID is already used
    const existingTxn = await Application.findOne({ transactionId });
    if (existingTxn) {
      return res.status(400).json({ message: "This Transaction ID has already been submitted." });
    }

    // 3. Create Application
    const newApplication = new Application({
      student: req.user._id, // Auth middleware se mil rahi ID
      subject: subjectId,
      reappearRecord: reappearRecordId,
      transactionId,
      receiptUrl,
      status: 'pending'
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully!", data: newApplication });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get logged-in student profile for pre-filling
// @route   GET /api/applications/student-info
export const getStudentInfo = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select('-password');
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student data" });
  }
};