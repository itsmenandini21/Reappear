import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    postedBy: { 
        type: String, 
        default: 'Exam Cell' // Automatically tags it as an official Exam Cell notice
    }
}, { 
    timestamps: true // This will automatically create 'createdAt' and 'updatedAt' fields
});

export default mongoose.model('Notice', noticeSchema);