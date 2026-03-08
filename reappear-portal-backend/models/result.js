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

export default mongoose.model('Result', resultSchema);