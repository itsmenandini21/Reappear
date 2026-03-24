import mongoose from "mongoose";

const reappearRecordSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
    rollNumber: { type: String, required: true }, 
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    status: {
        type: String,
        enum: ["cleared", "pending", "in-progress"],
        default: "pending"
    },
    attemptCount: { type: Number, default: 1 },
    feesPaid: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

const ReappearRecord = mongoose.model("ReappearRecord", reappearRecordSchema);
export default ReappearRecord;