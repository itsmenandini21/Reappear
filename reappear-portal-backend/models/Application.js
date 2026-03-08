import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    rollNo: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    
    // The subject they are applying for
    subjectName: { type: String, required: true },
    reappearSemester: { type: String, required: true },
    
    // Payment Proof
    transactionId: { type: String, required: true },
    feeAmount: { type: Number, required: true },
    
    // THIS IS FOR YOUR FRIEND'S ADMIN PANEL!
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    adminRemarks: { type: String, default: '' }, // Admin can leave notes like "Invalid Transaction ID"
    
    appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', applicationSchema);