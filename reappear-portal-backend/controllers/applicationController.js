import Application from '../models/Application.js';
import User from '../models/user.js';
import ReappearRecord from '../models/reappearRecord.js';
import sendEmail from '../utils/sendEmail.js';

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

    // 4. Update ReappearRecord to mark fees as paid so the student can instantly see 'Applied' status
    if (reappearRecordId) {
      await ReappearRecord.findByIdAndUpdate(reappearRecordId, { feesPaid: true });
    }

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

// @desc    Report an issue from the portal (Footer Modal)
// @route   POST /api/applications/report-issue
export const reportIssue = async (req, res) => {
  try {
    const { issue } = req.body;
    
    if (!issue || issue.trim() === '') {
      return res.status(400).json({ message: "Issue description is required" });
    }

    const student = await User.findById(req.user._id).select('name email rollNumber branch');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
              <h2 style="color: #d9534f;">🚨 New Issue Report</h2>
              <p><strong>Student Name:</strong> ${student.name}</p>
              <p><strong>Roll Number:</strong> ${student.rollNumber || 'N/A'}</p>
              <p><strong>Branch:</strong> ${student.branch || 'N/A'}</p>
              <p><strong>Email:</strong> ${student.email}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
              <h3 style="color: #333;">Issue Description:</h3>
              <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #555; white-space: pre-wrap;">${issue}</p>
          </div>
      </div>
    `;

    // Send the email to the admin
    const emailSent = await sendEmail("admin.nitkkr@gmail.com", `Issue Report: ${student.name} (${student.rollNumber || 'Student'})`, htmlContent);

    if (emailSent) {
      res.status(200).json({ message: "Issue reported successfully" });
    } else {
      res.status(500).json({ message: "Failed to send email. Please try again later." });
    }
  } catch (error) {
    console.error("Report Issue Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};