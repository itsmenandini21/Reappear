import mongoose from 'mongoose';
const facultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    phoneNumber: { type: String, required: true }, // Frontend se match karne ke liye 'phoneNumber'
    email: { type: String, required: true, unique: true },
    gender:{type:String,required:true,default:'M'},
    // Isko simplified rakhte hain: Sirf IDs ka ek flat array
    // Mongoose automatically 'Subject' model se details utha lega
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject' 
    }]
}, { timestamps: true });
export default mongoose.model('Faculty', facultySchema);