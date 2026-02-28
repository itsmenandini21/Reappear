import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  rollNumber: { type: String, unique: true, sparse: true },
  branch: { type: String },
  currentSemester: { type: Number },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User=mongoose.model("User",UserSchema);
export default User;