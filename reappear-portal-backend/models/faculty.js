import mongoose from 'mongoose';
const facultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    phoneNumber: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    gender:{type:String,required:true,default:'M'},
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject' 
    }]
}, { timestamps: true });
export default mongoose.model('Faculty', facultySchema);