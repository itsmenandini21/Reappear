import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ReappearRecord from "../models/reappearRecord.js";
import Message from "../models/Message.js";
import OTPVerification from "../models/otp.js";
import sendEmail from "../utils/sendEmail.js";

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// SEND OTP
const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists with this email" });

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash the OTP securely
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Delete any existing OTP for this email to prevent spam conflicts
        await OTPVerification.deleteMany({ email });

        // Save new OTP with native 5-minute MongoDB TTL
        await OTPVerification.create({ email, otp: hashedOtp });

        // Send Email Payload
        const htmlMessage = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; text-align: center;">
                <h2 style="color: #ff2600;">NIT Kurukshetra Portal Verification</h2>
                <p>Use the following 6-digit OTP to verify your email address and complete your registration:</p>
                <div style="font-size: 32px; font-weight: bold; background: #fdf2f2; padding: 15px; border-radius: 8px; border: 1px dashed #ff2600; color: #ff2600; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            </div>
        </div>`;

        await sendEmail(email, "Your Verification OTP - NIT Kurukshetra", htmlMessage);
        
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

// VERIFY OTP & REGISTER
const verifyOtpAndRegister = async (req, res) => {
    const { email, otp, name, password, role, rollNumber, branch, currentSemester } = req.body;
    try {
        // Find latest OTP record
        const otpRecord = await OTPVerification.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord) return res.status(400).json({ message: "OTP has Expired or is Invalid" });

        // Compare inputted plain OTP against Bcrypt Hash
        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) return res.status(400).json({ message: "Incorrect OTP" });

        // OTP Verified -> Execute classic registration
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, password, role, rollNumber, branch, currentSemester });

        await ReappearRecord.updateMany(
            { rollNumber: user.rollNumber },
            { $set: { student: user._id } }
        );

        if (user) {
            await Message.create({
                sender: "Exam Cell Bot",
                receiver: user.name,
                content: `Hi ${user.name}, welcome to NIT Kurukshetra Portal! How can I help you today?`,
                chatType: 'admin'
            });

            if (rollNumber) {
                 await ReappearRecord.updateMany(
                     { rollNumber: rollNumber, student: null },
                     { $set: { student: user._id } }
                 );
            }

            // Clean up OTP Document
            await OTPVerification.deleteMany({ email });

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

// RESEND OTP
const resendOtp = async (req, res) => {
    return sendOtp(req, res); // Recycles full logic
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

export { sendOtp, verifyOtpAndRegister, resendOtp, loginUser, googleLogin };