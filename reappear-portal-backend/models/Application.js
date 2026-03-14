import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  // Student jisne apply kiya
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Subject jiske liye reappear bhara gaya
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  // Reappear Record ID (Optional: Taaki pata chale kis specific record ke against apply hua h)
  reappearRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReappearRecord'
  },
  transactionId: { 
    type: String, 
    required: true,
    unique: true // Ek transaction ID do baar use nahi honi chahiye
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], // Sirf yehi states ho sakti hain
    default: 'pending' 
  },
  feePaid: { 
    type: Boolean, 
    default: true
  },
  // Agar aapko receipt ka URL save karna ho (Cloudinary/Multer)
  receiptUrl: {
    type: String,default:''
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;