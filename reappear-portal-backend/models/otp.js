import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes (300 seconds) TTL index
  },
});

const OTPVerification = mongoose.model("OTPVerification", otpSchema);
export default OTPVerification;
