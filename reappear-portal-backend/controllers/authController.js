import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // <-- The crucial .js extension!

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// REGISTER
const registerUser = async (req, res) => {
    const { name, email, password, role, rollNumber, branch, currentSemester } = req.body;
    try {
        const userExists = await User.findOne({ email });
console.log("USER EXISTS CHECK:", userExists); // add this
if (userExists) {
    return res.status(400).json({ message: "User already exists" });
}
        
        // Wrapped arguments in an object {} for Mongoose
        const user = await User.create({
            name, email, password, role, rollNumber, branch, currentSemester
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                token: generateToken(user._id)
            });
        }
    }
    catch (error) {
        console.log("REGISTER ERROR >>>", error.message);
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

export { registerUser, loginUser };