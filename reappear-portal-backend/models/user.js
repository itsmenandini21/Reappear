import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  rollNumber: { type: String, unique: true, required: true },
    department: { type: String },
  branch: { type: String },
  currentSemester: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        if (typeof next === 'function') return next();
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        if (typeof next === 'function') next();
    } catch (error) {
        if (typeof next === 'function') next(error);
        else throw error;
    }
});

const User=mongoose.model("User",UserSchema);

export default User;