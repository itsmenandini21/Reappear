import ReappearRecord from "../models/reappearRecord.js";
import Subject from "../models/subject.js"; 
// Note: 'User' import ki zaroorat nahi hai agar hum seedha req.user.id use kar rahe hain

export const getMyReappears = async (req, res) => {
  try {
    // 1. Token se aayi hui Student ID pakadna
    // req.user.id humein protect middleware se mil jati hai
    const studentId = req.user.id; 

    if (!studentId) {
      return res.status(401).json({ message: "Not authorized, student ID missing" });
    }

    // 2. Direct Query: ReappearRecord mein 'student' field (ObjectId) search karna
    const reappears = await ReappearRecord.find({ student: studentId })
      .populate("subject") // Subject details (Name, Code, Semester) uthane ke liye
      .exec();

    // 3. Grouping Logic
    const groupedBySemester = reappears.reduce((acc, record) => {
      // Safety Check: Agar subject populate nahi hua (null), toh skip karein
      if (!record.subject) return acc;

      const sem = record.subject.semester || "Other";
      
      if (!acc[sem]) {
        acc[sem] = [];
      }
      
      acc[sem].push({
        id: record._id, // Reappear Record ki ID
        name: record.subject.subjectName,
        code: record.subject.subjectCode,
        status: record.status,
        credits: record.subject.credits,
        semester: sem
      });

      return acc;
    }, {});

    // 4. Send Response
    res.status(200).json(groupedBySemester);

  } catch (error) {
    console.error("Error fetching reappears:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};