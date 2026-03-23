import ReappearRecord from '../models/reappearRecord.js';
import User from '../models/user.js';

// @desc    Get all peers who have common ACTIVE backlogs with current user
// @route   GET /api/peers
export const getPeers = async (req, res) => {
    try {
        const currentUserId = req.user._id || req.user.id;
        const currentUserRoll = req.user.rollNumber;

        // --- STEP 1: DATA SYNC (Very Important for your case) ---
        // Agar user ne delete karke naya account banaya hai, toh uske purane records 
        // ko uski nayi ID se link kar do taaki 'populate' kaam kare.
        await ReappearRecord.updateMany(
            { rollNumber: currentUserRoll, student: { $ne: currentUserId } },
            { $set: { student: currentUserId } }
        );

        // --- STEP 2: FIND CURRENT USER'S BACKLOGS ---
        const currentUserBacklogs = await ReappearRecord.find({
            student: currentUserId,
            status: { $in: ["pending", "in-progress"] }
        });

        const currentUserSubjectIds = currentUserBacklogs.map(record => record.subject.toString());

        if (currentUserSubjectIds.length === 0) {
            return res.status(200).json({ message: "No active backlogs found for you.", peers: [] });
        }

        // --- STEP 3: FIND PEERS ---
        const activeBacklogs = await ReappearRecord.find({ 
            subject: { $in: currentUserSubjectIds },
            rollNumber: { $ne: currentUserRoll }, // Khud ko exclude karo roll number se
            student: { $exists: true, $ne: null }, // Sirf unhe lo jinka account hai
            status: { $in: ["pending", "in-progress"] } 
        })
        .populate('student', 'name rollNumber branch currentSemester') 
        .populate('subject', 'subjectCode subjectName semester');

        // --- STEP 4: GROUPING LOGIC (With Safety Checks) ---
        const groupedPeers = {};

        activeBacklogs.forEach(record => {
            // Safety: Skip if student or subject data is broken
            if (!record.student || !record.student._id || !record.subject) return;

            const studentId = record.student._id.toString();

            if (!groupedPeers[studentId]) {
                groupedPeers[studentId] = {
                    id: studentId,
                    name: record.student.name || "Unknown Student",
                    rollNo: record.student.rollNumber,
                    branch: record.student.branch || "N/A",
                    semester: record.student.currentSemester || record.subject.semester || "N/A", 
                    profileImage: record.student.profileImage || "",
                    reappears: []
                };
            }

            // Duplicate subject check (Optional but good for clean UI)
            const isAlreadyAdded = groupedPeers[studentId].reappears.some(
                r => r.subject === record.subject.subjectCode
            );

            if (!isAlreadyAdded) {
                groupedPeers[studentId].reappears.push({
                    semester: record.subject.semester,
                    subject: record.subject.subjectCode,
                    subjectName: record.subject.subjectName
                });
            }
        });

        const formattedPeers = Object.values(groupedPeers);
        res.status(200).json(formattedPeers);

    } catch (error) {
        console.error("Error fetching peers:", error);
        res.status(500).json({ message: "Failed to fetch peers", error: error.message });
    }
};