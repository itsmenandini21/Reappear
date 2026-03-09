import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  subjectCode: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  subjectName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  semester: { 
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  department: { 
    type: String, 
    required: true,
    index: true 
  },
  credits: { 
    type: Number, 
    required: true,
    default: 3 
  },
  syllabusUrl: { 
    type: String,
    default: "" 
  }
}, { 
  timestamps: true 
});
const Subject =mongoose.model("Subject", SubjectSchema);
export default Subject;