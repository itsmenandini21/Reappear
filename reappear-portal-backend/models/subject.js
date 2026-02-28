import mongoose from "mongoose";
const SubjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true },
  department: { type: String, required: true },
  credits: { type: Number, required: true },
  syllabusUrl: { type: String },
  currentFaculty: { 
    name: { type: String },
    cabin: { type: String }
  }
});

const Subject=mongoose.model("Subject",SubjectSchema);
export default Subject;