import Application from '../models/Application.js';
import User from '../models/user.js';
import ReappearRecord from '../models/reappearRecord.js';
import sendEmail from '../utils/sendEmail.js';

const buildReceiptUrl = (req) => {
  if (!req.file) return '';
  return `/uploads/receipts/${req.file.filename}`;
};

const buildFeeRejectionEmail = ({ studentName, transactionId, subjectName }) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="color: #d9534f; margin-top: 0;">Reappear Fee Submission Needs Correction</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>
        We reviewed your reappear fee submission${subjectName ? ` for <strong>${subjectName}</strong>` : ''} and found an issue that needs to be corrected before it can be approved.
      </p>
      <p>
        Transaction ID: <strong>${transactionId || 'Not Provided'}</strong>
      </p>
      <p>
        Please log in to the portal, review the details you submitted, and submit the form again with the correct information or receipt.
      </p>
      <p>
        If the payment has already been made, you can reuse the correct details while resubmitting the form.
      </p>
      <p style="margin-bottom: 0;">Regards,<br/>Exam Cell, NIT Kurukshetra</p>
    </div>
  </div>
`;

// @desc    Submit new reappear application
// @route   POST /api/applications/apply
export const submitApplication = async (req, res) => {
  try {
    const { subjectId, transactionId, reappearRecordId } = req.body;
    const normalizedTransactionId = transactionId?.trim();
    const receiptUrl = buildReceiptUrl(req);

    if (!subjectId || !normalizedTransactionId) {
      return res.status(400).json({ message: "Subject and Transaction ID are required" });
    }

    // 1. Check if user exists (Optional but safe)
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Allow rejected applications to be resubmitted for the same student/record.
    const existingApplication = await Application.findOne({
      student: req.user._id,
      ...(reappearRecordId ? { reappearRecord: reappearRecordId } : { subject: subjectId })
    });

    // 3. Check if transaction ID is already used by a different active application
    const existingTxn = await Application.findOne({
      transactionId: normalizedTransactionId,
      status: { $ne: 'rejected' },
      ...(existingApplication ? { _id: { $ne: existingApplication._id } } : {})
    });
    if (existingTxn) {
      return res.status(400).json({ message: "This Transaction ID has already been submitted." });
    }

    let application;

    if (existingApplication && existingApplication.status === 'rejected') {
      existingApplication.subject = subjectId;
      existingApplication.reappearRecord = reappearRecordId || existingApplication.reappearRecord;
      existingApplication.transactionId = normalizedTransactionId;
      existingApplication.receiptUrl = receiptUrl || existingApplication.receiptUrl;
      existingApplication.status = 'pending';
      application = await existingApplication.save();
    } else if (existingApplication && existingApplication.status !== 'rejected') {
      return res.status(400).json({ message: "You have already submitted this form." });
    } else {
      application = await Application.create({
        student: req.user._id,
        subject: subjectId,
        reappearRecord: reappearRecordId,
        transactionId: normalizedTransactionId,
        receiptUrl,
        status: 'pending'
      });
    }

    // 4. Update ReappearRecord to mark fees as paid so the student can instantly see 'Applied' status
    if (reappearRecordId) {
      await ReappearRecord.findByIdAndUpdate(reappearRecordId, {
        feesPaid: true,
        transactionID: normalizedTransactionId
      });
    }

    res.status(201).json({ message: "Application submitted successfully!", data: application });
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

// @desc    Admin gets all fee tracker submissions
// @route   GET /api/applications/admin/fee-tracker
export const getFeeTrackerApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name rollNumber email branch currentSemester')
      .populate('subject', 'subjectName subjectCode semester')
      .sort({ createdAt: -1 });

    const pending = [];
    const approved = [];
    const rejected = [];

    applications.forEach((application) => {
      const mapped = {
        id: application._id,
        status: application.status,
        transactionId: application.transactionId,
        receiptUrl: application.receiptUrl || '',
        submittedAt: application.createdAt,
        updatedAt: application.updatedAt,
        student: {
          id: application.student?._id || null,
          name: application.student?.name || 'Unknown Student',
          rollNumber: application.student?.rollNumber || 'N/A',
          email: application.student?.email || '',
          branch: application.student?.branch || '',
          currentSemester: application.student?.currentSemester || ''
        },
        subject: {
          id: application.subject?._id || null,
          name: application.subject?.subjectName || 'Unknown Subject',
          code: application.subject?.subjectCode || 'N/A',
          semester: application.subject?.semester || ''
        }
      };

      if (application.status === 'approved') approved.push(mapped);
      else if (application.status === 'rejected') rejected.push(mapped);
      else pending.push(mapped);
    });

    res.status(200).json({ pending, approved, rejected });
  } catch (error) {
    console.error("Fee Tracker Fetch Error:", error);
    res.status(500).json({ message: "Server error fetching fee tracker submissions" });
  }
};

// @desc    Admin updates fee tracker submission status
// @route   PATCH /api/applications/admin/fee-tracker/:id
export const updateFeeTrackerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Only approved or rejected statuses are allowed" });
    }

    const application = await Application.findById(id)
      .populate('student', 'name email')
      .populate('subject', 'subjectName');

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    if (application.reappearRecord) {
      await ReappearRecord.findByIdAndUpdate(application.reappearRecord, {
        feesPaid: status === 'approved',
        transactionID: status === 'approved' ? application.transactionId : ''
      });
    }

    if (status === 'rejected' && application.student?.email) {
      const htmlContent = buildFeeRejectionEmail({
        studentName: application.student.name || 'Student',
        transactionId: application.transactionId,
        subjectName: application.subject?.subjectName || ''
      });

      await sendEmail(
        application.student.email,
        "Reappear Fee Form Needs Correction",
        htmlContent
      );
    }

    res.status(200).json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error("Fee Tracker Update Error:", error);
    res.status(500).json({ message: "Server error updating fee tracker status", error: error.message });
  }
};
