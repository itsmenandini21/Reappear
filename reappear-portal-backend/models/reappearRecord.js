import mongoose from "mongoose";

const reappearRecordSchema = new mongoose.Schema({
    // Capitalized the refs to match standard Mongoose exports
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Made optional
    rollNumber: { type: String, required: true }, // Added rollNumber as steady string identifier
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    status: {
        type: String,
        enum: ["cleared", "pending", "in-progress"], // You used lowercase here, which is perfectly fine!
        default: "pending"
    },
    attemptCount: { type: Number, default: 1 },
    feesPaid: {
        type: Boolean,
        default: false // FIXED TYPO: deafault -> default
    },
    transactionID:{type:String, required:false}
}, { timestamps: true });

const ReappearRecord = mongoose.model("ReappearRecord", reappearRecordSchema);
export default ReappearRecord;