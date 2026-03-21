import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ReappearRecord from "../models/reappearRecord.js";
import Message from "../models/Message.js";

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// REGISTER
const registerUser = async (req, res) => {
    const { name, email, password, role, rollNumber, branch, currentSemester } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, password, role, rollNumber, branch, currentSemester });
        // User milne ya banane ke baad:
await ReappearRecord.updateMany(
    { rollNumber: user.rollNumber },
    { $set: { student: user._id } }
);

        if (user) {
            // --- NEW: Message Schema mein pehli entry generate karna ---
            await Message.create({
                sender: "Exam Cell Bot",
                receiver: user.name,
                content: `Hi ${user.name}, welcome to NIT Kurukshetra Portal! How can I help you today?`,
                chatType: 'admin'
            });

            // Existing retroactive linking logic...
            if (rollNumber) {
                 await ReappearRecord.updateMany(
                     { rollNumber: rollNumber, student: null },
                     { $set: { student: user._id } }
                 );
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                branch: user.branch,
                currentSemester: user.currentSemester,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// LOGIN
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                branch: user.branch,
                currentSemester: user.currentSemester,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        }
        else {
            return res.status(400).json({ message: "Incorrect email or password" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GOOGLE LOGIN
const googleLogin = async (req, res) => {
    try {
        const { access_token } = req.body;
        if (!access_token) {
            return res.status(400).json({ message: "No Google token provided" });
        }

        // Fetch user profile from Google
        const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        
        if (!googleResponse.ok) {
            return res.status(400).json({ message: "Failed to verify Google Token" });
        }
        
        const payload = await googleResponse.json();
        
        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google user data" });
        }

        let user = await User.findOne({ email: payload.email });

        if (!user) {
            return res.status(404).json({ message: "Account not found! Please register normally first to provide your Roll Number and Academic Details." });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            rollNumber: user.rollNumber,
            branch: user.branch,
            currentSemester: user.currentSemester,
            profileImage: user.profileImage,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("Google verify error:", error);
        res.status(500).json({ message: "Internal Server Error / Invalid Google Token" });
    }
};

export { registerUser, loginUser, googleLogin };