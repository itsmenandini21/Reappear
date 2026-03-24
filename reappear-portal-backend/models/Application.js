import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
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
  reappearRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReappearRecord'
  },
  transactionId: { 
    type: String, 
    required: true,
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  feePaid: { 
    type: Boolean, 
    default: true
  },

  receiptUrl: {
    type: String,default:''
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;