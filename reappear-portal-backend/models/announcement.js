import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Urgent', 'Academic', 'Fees', 'General'], default: 'General' },
  content: { type: String, required: true },
  expiryDate: { type: Date },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;