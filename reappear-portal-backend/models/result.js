import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject', 
        required: true 
    },
    evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: false
    },
    marksObtained: { 
        type: Number, 
        required: true 
    },
    totalMarks: { 
        type: Number, 
        default: 100 
    },
    grade: { 
        type: String, 
        required: true 
    },
    remarks: { 
        type: String, 
        default: 'Pass' 
    }
}, { timestamps: true });
resultSchema.index({ student: 1, subject: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);