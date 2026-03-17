"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import './exams.css';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ScheduleExams = () => {
  // 1. Changed syllabusLink to syllabus
  const [examData, setExamData] = useState({ dept: '', sem: '', subject: '', date: '', time: '', room: '', syllabus: '' });
  const [hasSyllabus, setHasSyllabus] = useState(false);
  const [scheduledExams, setScheduledExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [subjects,setSubjects]=useState([]);

  const fetchScheduledExams = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/exams');
      setScheduledExams(response.data.upcoming || []);
    } catch (error) {
      console.error("Failed to fetch exams", error);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchScheduledExams();
  }, []);

  useEffect(()=>{
    fetchSubjects();
  },[])

  const fetchSubjects=async ()=>{
    try{
      const res=await api.get("/subjects");
      setSubjects(res.data);
    }
     catch(error){
      console.log(error.message);
     }

  }

  const removeExam = async (id) => {
    if (!window.confirm("Are you sure you want to remove this exam?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/exams/${id}`);
      toast.success("Exam removed successfully.");
      fetchScheduledExams();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to remove exam.");
    }
  };
  const availableSubjects = subjects.filter(sub => sub.department == examData.dept && sub.semester == examData.sem);

  const handleExamChange = (e) => setExamData({ ...examData, [e.target.name]: e.target.value });

  const submitExamSchedule = async (e) => {
    e.preventDefault();
    if (!examData.subject || !examData.date || !examData.time || !examData.room) {
      return toast.error("Please fill all required exam details.");
    }
    
    toast.promise(
      axios.post('http://localhost:5001/api/exams', examData),
      {
        loading: 'Scheduling exam in database...',
        success: (response) => {
          // Reset form to empty 'syllabus'
          setExamData({ dept: '', sem: '', subject: '', date: '', time: '', room: '', syllabus: '' });
          setHasSyllabus(false);
          fetchScheduledExams();
          return response.data.message || 'Exam Scheduled Successfully!';
        },
        error: (err) => {
          return err.response?.data?.message || 'Failed to schedule exam. Please try again.';
        }
      }
    );
  };

  return (
    <motion.div 
      className="ex-main-container"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <Toaster position="top-center" />
      <motion.div variants={itemVariants} className="ex-header">
        <h1>Schedule Exams</h1>
        <p>Set dates, times, and syllabus details for upcoming reappear exams.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="ex-card">
        <form onSubmit={submitExamSchedule}>
          <h3 className="ex-section-title">1. Select Subject</h3>
          <div className="ex-form-row-3">
            <div className="ex-input-group">
              <label>Department</label>
              <select name="dept" value={examData.dept} onChange={handleExamChange} required>
                <option value="">Select Dept</option>
                <option value="Computer Applications">Computer Applications</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
            <div className="ex-input-group">
              <label>Semester</label>
              <select name="sem" value={examData.sem} onChange={handleExamChange} disabled={!examData.dept} required>
                <option value="">Select Sem</option>
                <option value="1">1st Sem</option>
                <option value="3">3rd Sem</option>
                <option value="5">5th Sem</option>
              </select>
            </div>
            <div className="ex-input-group">
              <label>Subject</label>
              <select name="subject" value={examData.subject} onChange={handleExamChange} disabled={!examData.sem} required>
                <option value="">Select Subject</option>
                {availableSubjects.map(sub => <option key={sub.subjectCode} value={sub.subjectCode}>{sub.subjectCode} - {sub.subjectName}</option>)}
              </select>
            </div>
          </div>

          <h3 className="ex-section-title ex-mt">2. Exam Details</h3>
          <div className="ex-form-row-3">
            <div className="ex-input-group">
              <label>Exam Date</label>
              <input type="date" name="date" value={examData.date} onChange={handleExamChange} required />
            </div>
            <div className="ex-input-group">
              <label>Exam Time</label>
              <input type="time" name="time" value={examData.time} onChange={handleExamChange} required />
            </div>
            <div className="ex-input-group">
              <label>Exam Centre (Room No.)</label>
              <input type="text" name="room" placeholder="e.g. Room 101" value={examData.room} onChange={handleExamChange} required />
            </div>
          </div>

          <div className="ex-syllabus-section">
            <label className="ex-checkbox-label">
              <input type="checkbox" checked={hasSyllabus} onChange={(e) => setHasSyllabus(e.target.checked)} />
              Syllabus is available for this exam
            </label>
            
            {hasSyllabus ? (
              <div className="ex-input-group ex-mt-small">
                <label>Manual Syllabus Entry</label>
                {/* 2. Changed input to a textarea for multi-line typing */}
                <textarea 
                  name="syllabus" 
                  rows="4" 
                  placeholder="Type the chapters, topics, or instructions here... e.g. Unit 1: OS Basics, Unit 2: Process Scheduling..." 
                  value={examData.syllabus} 
                  onChange={handleExamChange} 
                  required 
                />
              </div>
            ) : (
              <div className="ex-warning-box">
                <span className="ex-icon">ℹ️</span>
                By default, students will see: <b>"Syllabus has not been released."</b>
              </div>
            )}
          </div>

          <div className="ex-submit-row">
            <button type="submit" className="ex-btn-primary">Schedule Exam →</button>
          </div>
        </form>
      </motion.div>

      <motion.div variants={itemVariants} className="ex-card ex-mt">
        <h3 className="ex-section-title">Scheduled Exams</h3>
        
        {loadingExams ? (
           <p className="ex-loading">Loading scheduled exams...</p>
        ) : scheduledExams.length === 0 ? (
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ex-no-data">No upcoming exams scheduled yet.</motion.p>
        ) : (
           <motion.div layout className="ex-list">
             <AnimatePresence>
               {scheduledExams.map(exam => (
                 <motion.div 
                   key={exam.id} 
                   className="ex-list-item"
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                   whileHover={{ scale: 1.01 }}
                   transition={{ type: "spring", stiffness: 400, damping: 30 }}
                 >
                   <div className="ex-list-info">
                     <h4>{exam.subject} - {exam.examName}</h4>
                     <p>Date: {exam.date} | Time: {exam.time} | Room: {exam.room}</p>
                   </div>
                   <button onClick={() => removeExam(exam.id)} className="ex-btn-delete">Remove</button>
                 </motion.div>
               ))}
             </AnimatePresence>
           </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ScheduleExams;