import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
    subject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject', 
        required: true 
    },
    semester: { type: Number, required: true },
    branch: { type: String, required: true },
    year: { type: Number, required: true },
    pdfUrl: { type: String, required: true },
    fileSize: { type: String }
}, { timestamps: true });

export default mongoose.model('Pyq', pyqSchema);