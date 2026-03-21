import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    department: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    subjectCode: { type: String, required: true },
    examDate: { type: Date, required: true },
    examTime: { type: String, required: true },
    roomAllocation: { type: String, required: true },
    // Changed this line to just store standard text instead of a link
    syllabus: { type: String, default: "" }, 
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' }
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);