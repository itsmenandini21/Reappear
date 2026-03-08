import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
    subjectCode: { 
        type: String, 
        required: true 
    },
    year: { 
        type: Number, 
        required: true 
    },
    pdfUrl: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model('Pyq', pyqSchema);