import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    subject: { type: String, required: true }, 
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], default: 'M' }, // Helps the frontend pick the right avatar emoji
    cabin: { type: String, default: '' }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt dates
});

export default mongoose.model('Faculty', facultySchema);