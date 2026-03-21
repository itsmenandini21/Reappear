import ReappearRecord from "../models/reappearRecord.js";
import Subject from "../models/subject.js"; 
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";
import mongoose from "mongoose";
// Note: 'User' import ki zaroorat nahi hai agar hum seedha req.user.id use kar rahe hain

export const getMyReappears = async (req, res) => {
  try {
    // 1. Token se User details nikalna
    // req.user humein protect middleware se milta hai
    const studentId = req.user._id || req.user.id;
    const rollNumber = req.user.rollNumber;

    if (!studentId && !rollNumber) {
      return res.status(401).json({ message: "Not authorized, user details missing" });
    }

    // 2. Dual Search: ID se dhoondo YA Roll Number se 
    // Isse aapka 500 error khatam ho jayega agar ID mismatch hui toh
    const reappears = await ReappearRecord.find({
      $or: [
        { student: studentId },
        { rollNumber: rollNumber }
      ]
    })
    .populate("subject") 
    .exec();

    // 3. Grouping Logic (Safe approach)
    const groupedBySemester = reappears.reduce((acc, record) => {
      // Agar subject null hai (deleted subject), toh crash na ho
      if (!record.subject) return acc;

      const sem = record.subject.semester || "Other";
      
      if (!acc[sem]) {
        acc[sem] = [];
      }
      
      acc[sem].push({
        id: record._id,
        name: record.subject.subjectName || "Unknown Subject",
        code: record.subject.subjectCode || "N/A",
        status: record.status || "pending",
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

export const addReappear = async (req, res) => {
    try {
        const { rollNumber, subjectId } = req.body;

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

        const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #4a90e2;">Action Required: Reappear Form Updates</h2>
                <p>Dear <b>${studentName}</b>,</p>
                <p>You have been marked for reappears in specific subjects by the Exam Cell.</p>
                <p>Please log in to your NIT KKR Reappear Portal to view your assigned subjects.</p>
                <br/>
                <a href="http://localhost:3000/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
                <br/><br/>
                <p>- Exam Cell, NIT Kurukshetra</p>
            </div>
        </div>`;
        
        await sendEmail(recipientEmail, "Action Required: Reappear Form Updates", emailHtml);

        res.status(201).json({ message: "Student added successfully", record: newRecord });
    } catch (error) {
        res.status(400).json({ message: "Failed to add record", error: error.message });
    }
};

// @desc    Admin updates status
// @route   PUT /api/reappear/update/:id
export const updateReappearStatus = async (req, res) => {
    try {
        const { status, feesPaid, roomAllocation, examDate } = req.body; 
        
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

// @desc    Check existing backlogs for a student by roll number
// @route   GET /api/reappear/check/:rollNumber
export const checkExistingBacklogs = async (req, res) => {
    try {
        const { rollNumber } = req.params;
        // Sirf pending ya in-progress wale records check karenge
        // Kyunki agar 'cleared' hai toh admin dobara add kar sakta hai
        const existingRecords = await ReappearRecord.find({ 
            rollNumber: rollNumber,
            status: { $in: ["pending", "in-progress"] }
        }).populate('subject', 'subjectCode'); // Sirf subjectCode populate karo fast response ke liye

        res.status(200).json(existingRecords);
    } catch (error) {
        console.error("Error checking existing backlogs:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};