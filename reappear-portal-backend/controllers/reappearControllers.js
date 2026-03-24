import ReappearRecord from "../models/reappearRecord.js";
import Subject from "../models/subject.js"; 
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";
import Announcement from "../models/announcement.js"; 


export const getMyReappears = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const rollNumber = req.user.rollNumber;

    if (!studentId && !rollNumber) {
      return res.status(401).json({ message: "Not authorized, user details missing" });
    }

    
    const reappears = await ReappearRecord.find({
      $or: [
        { student: studentId },
        { rollNumber: rollNumber }
      ]
    })
    .populate("subject") 
    .exec();
    const activeNotices = await Announcement.find({ category: 'Academic', subject: { $exists: true, $ne: null } });
    const noticeMap = {};
    activeNotices.forEach(notice => {
      noticeMap[notice.subject.toString()] = notice;
    });

    const groupedBySemester = reappears.reduce((acc, record) => {
      if (!record.subject) return acc;

      const sem = record.subject.semester || "Other";
      
      if (!acc[sem]) {
        acc[sem] = [];
      }
      
      const subjectObjectIdStr = record.subject._id.toString();
      const linkedNotice = noticeMap[subjectObjectIdStr];
      
      const actualDeadlineDate = record.lastDate ? new Date(record.lastDate) : (linkedNotice ? new Date(linkedNotice.deadline) : null);
      
      let _hasActiveNotice = false;
      let _formattedDeadline = null;
      
      if (actualDeadlineDate) {
           const today = new Date();
           today.setHours(0, 0, 0, 0); 
           if (actualDeadlineDate >= today) {
                _hasActiveNotice = true;
                const d = actualDeadlineDate.getDate().toString().padStart(2, '0');
                const m = (actualDeadlineDate.getMonth()+1).toString().padStart(2, '0');
                const y = actualDeadlineDate.getFullYear();
                _formattedDeadline = `${d}/${m}/${y}`;
           }
      }

      acc[sem].push({
        id: record._id,
        name: record.subject.subjectName || "Unknown Subject",
        code: record.subject.subjectCode || "N/A",
        subjectObjectId: record.subject._id,
        status: record.status || "pending",
        hasApplied: record.feesPaid,
        hasActiveNotice: _hasActiveNotice, 
        credits: record.subject.credits || 0,
        semester: sem
      });

      return acc;
    }, {});

    res.status(200).json(groupedBySemester);

  } catch (error) {
    console.error("Error fetching reappears:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};

export const addBulkReappears = async (req, res) => {
    try {
        const { assignments } = req.body;

        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ message: "assignments array is required" });
        }

        const results = [];
        const emailPromises = [];
        const studentGroups = {};

        for (const assignment of assignments) {
            const { rollNumber, subjectId } = assignment;

            if (!rollNumber || !subjectId) {
                continue; 
            }

            const existingStudent = await User.findOne({ rollNumber });

            const newRecord = await ReappearRecord.create({
                rollNumber: rollNumber,
                student: existingStudent ? existingStudent._id : null,
                subject: subjectId,
                status: "pending",
                feesPaid: false,
                attemptCount: 1
            });

            results.push(newRecord);
            if (!studentGroups[rollNumber]) {
                studentGroups[rollNumber] = {
                    student: existingStudent,
                    subjects: []
                };
            }
            studentGroups[rollNumber].subjects.push(subjectId);
        }
        for (const [rollNumber, data] of Object.entries(studentGroups)) {
            const recipientEmail = (data.student && data.student.email) ? data.student.email : `${rollNumber}@nitkkr.ac.in`;
            const studentName = (data.student && data.student.name) ? data.student.name : rollNumber;
            const subjects = await Subject.find({ _id: { $in: data.subjects } });

            const subjectListHtml = subjects.map(sub =>
                `<li><strong>${sub.subjectName} (${sub.subjectCode})</strong></li>`
            ).join('');

            const emailHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                    <h2 style="color: #4a90e2;">Action Required: Reappear Form Updates</h2>
                    <p>Dear <b>${studentName}</b>,</p>
                    <p>You have been marked for reappears in the following subjects:</p>
                    <ul style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        ${subjectListHtml}
                    </ul>
                    <p>Please log in to your NIT KKR Reappear Portal to view your assigned subjects and complete the required forms.</p>
                    <br/>
                    <a href="https://reappear.vercel.app/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
                    <br/><br/>
                    <p>- Exam Cell, NIT Kurukshetra</p>
                </div>
            </div>`;

            emailPromises.push(
                sendEmail(recipientEmail, "Action Required: Reappear Form Updates", emailHtml)
                    .catch(error => console.error(`Failed to send email to ${recipientEmail}:`, error))
            );
        }

        Promise.all(emailPromises).catch(error => {
            console.error('Bulk email sending failed:', error);
        });

        res.status(201).json({
            message: `Successfully assigned ${results.length} backlogs to ${Object.keys(studentGroups).length} students`,
            records: results
        });
    } catch (error) {
        res.status(400).json({ message: "Failed to add records", error: error.message });
    }
};

export const addReappear = async (req, res) => {
    try {
        const { rollNumber, subjectId, lastDate } = req.body;

        if (!rollNumber || !subjectId) {
            return res.status(400).json({ message: "rollNumber and subjectId are required" });
        }

        const existingStudent = await User.findOne({ rollNumber });

        const newRecord = await ReappearRecord.create({
            rollNumber: rollNumber,
            student: existingStudent ? existingStudent._id : null,
            subject: subjectId,
            status: "pending",
            feesPaid: false,
            attemptCount: 1
        });

        const recipientEmail = (existingStudent && existingStudent.email) ? existingStudent.email : `${rollNumber}@nitkkr.ac.in`;
        const studentName = (existingStudent && existingStudent.name) ? existingStudent.name : rollNumber;
        const subject = await Subject.findById(subjectId);

        const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #4a90e2;">Action Required: Reappear Form Updates</h2>
                <p>Dear <b>${studentName}</b>,</p>
                <p>You have been marked for reappears in the following subject:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <strong>${subject?.subjectName || 'Subject'} (${subject?.subjectCode || subjectId})</strong>
                </div>
                <p>Please log in to your NIT KKR Reappear Portal to view your assigned subjects and complete the required forms.</p>
                <br/>
                <a href="https://reappear.vercel.app/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
                <br/><br/>
                <p>- Exam Cell, NIT Kurukshetra</p>
            </div>
        </div>`;

        sendEmail(recipientEmail, "Action Required: Reappear Form Updates", emailHtml).catch(error => {
            console.error('Failed to send email notification:', error);
        });

        res.status(201).json({ message: "Student added successfully", record: newRecord });
    } catch (error) {
        res.status(400).json({ message: "Failed to add record", error: error.message });
    }
};
//  GET /api/reappear/check/:rollNumber
export const checkExistingBacklogs = async (req, res) => {
    try {
        const { rollNumber } = req.params;
        const existingRecords = await ReappearRecord.find({ 
            rollNumber: rollNumber,
            status: { $in: ["pending", "in-progress"] }
        }).populate('subject', 'subjectCode');

        res.status(200).json(existingRecords);
    } catch (error) {
        console.error("Error checking existing backlogs:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



//POST /api/reappear/admin/send-email
export const sendAdminEmail = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        if (!email || !subject || !message) {
            return res.status(400).json({ message: "Please provide email, subject, and message" });
        }
        
        const htmlMessage = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #ff2600;">Urgent: Action Required</h2>
                <p style="font-size: 15px; color: #333; line-height: 1.5;">${message.replace(/\n/g, '<br/>')}</p>
                <br/>
                <p>Please log in to your NIT KKR Reappear Portal and complete the required actions to avoid penalties.</p>
                <a href="http://localhost:3000/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Login to Portal</a>
                <br/><br/>
                <p style="color: #888; font-size: 13px;">- Exam Cell, NIT Kurukshetra</p>
            </div>
        </div>`;
        
        await sendEmail(email, subject, htmlMessage);
        res.status(200).json({ message: "Email sent successfully to " + email });
    } catch (error) {
        console.error("Error sending admin email:", error);
        res.status(500).json({ message: "Failed to send email", error: error.message });
    }
};

// GET /api/reappear/admin/eligible-students
export const getEligibleStudentsForResults = async (req, res) => {
    try {
        const { subjectCode } = req.query; 
        if (!subjectCode) return res.status(400).json({ message: "Subject Code is required" });

        // Retrieve all reappear records and populate subject and student fields
        const records = await ReappearRecord.find()
            .populate('subject', 'subjectCode')
            .populate('student', 'rollNumber');

        // Filter purely to the targeted subject code 
        const filtered = records.filter(r => r.subject && r.subject.subjectCode === subjectCode);
        
        // Extract roll numbers and prune any nullish definitions
        const rollNumbers = filtered.map(r => r.rollNumber).filter(Boolean);
        
        // Return absolutely unique Array of students so admins don't mark duplicates
        res.status(200).json([...new Set(rollNumbers)]);
    } catch (error) {
        console.error("Failed to fetch eligible students for results:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};