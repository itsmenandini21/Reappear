import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, 
    receiver: { type: String, required: true }, 
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    chatType: { type: String, enum: ['student', 'faculty', 'admin'], required: true }
});

export default mongoose.model('Message', messageSchema);