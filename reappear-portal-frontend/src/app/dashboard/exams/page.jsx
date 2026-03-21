"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedList from '@/components/AnimatedList';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import './ExamDates.css';

const ExamCard = ({ data, activeTab }) => {
  const [showResult, setShowResult] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);

  return (
    <div className="exam-card">
      <div className="exam-card-main">
        <div className="exam-left">
          <span className="exam-tag">{data.examName}</span>
          <h3 className="exam-subject">{data.subject}</h3>
        </div>

        <div className="exam-right">
          {activeTab === 'upcoming' ? (
            <div className="upcoming-action-group">
              <div className="upcoming-details">
                <span className="detail-pill">📅 {data.date}</span>
                <span className="detail-pill">⏰ {data.time}</span>
                <span className="detail-pill">📍 Room {data.room}</span>
              </div>
              <button 
                className={`theme-btn ${showSyllabus ? 'open' : ''}`} 
                onClick={() => setShowSyllabus(!showSyllabus)}
              >
                {showSyllabus ? 'Hide Syllabus' : 'View Syllabus'}
              </button>
            </div>
          ) : (
            <button 
              className={`theme-btn ${showResult ? 'open' : ''}`} 
              onClick={() => setShowResult(!showResult)}
            >
              {showResult ? 'Hide Result' : 'View Result'}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'upcoming' && (
        <AnimatePresence>
          {showSyllabus && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 15 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="slider-container"
            >
              <div className="slider-content">
                <span className="slider-label">Topics to Cover</span>
                <div className="slider-data">
                  <span className="syllabus-text">{data.syllabus}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {activeTab === 'result' && (
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 15 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="slider-container"
            >
              <div className="slider-content">
                <span className="slider-label">Marks Obtained</span>
                <div className="slider-data">
                  <span className="marks-obtained">{data.marks}</span>
                  <span className="marks-total">/ {data.total}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default function ExamDates() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [exams, setExams] = useState({ upcoming: [], results: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        
        if (!userId) {
            setLoading(false);
            return;
        }
        
        const promises = [
            api.get('/exams').catch(() => ({ data: { upcoming: [] } })), // Gracefully handle if exams API doesn't exist yet
            api.get(`/results/${userId}`)
        ];
        
        const [examsResponse, resultsResponse] = await Promise.all(promises);
        
        let fetchedUpcoming = examsResponse.data.upcoming || [];
        
        // Remap strictly from MongoDB
        let fetchedResults = resultsResponse.data.map((res, index) => ({
          id: res._id || `res-${index}`,
          examName: `${res.subject?.semester || 'Unknown'} Sem`,
          subject: res.subject?.subjectName || res.subject?.subjectCode || "Subject Name",
          faculty: "Auto-Evaluated",
          marks: res.marksObtained,
          total: res.totalMarks || 100, 
          date: new Date(res.createdAt).toLocaleDateString('en-GB') || "Published",
          time: "--",
          room: "--"
        }));

        setExams({ upcoming: fetchedUpcoming, results: fetchedResults });
      } catch (error) {
        console.error("Failed to fetch Live Exams Data", error);
        setExams({ upcoming: [], results: [] }); // Strict: Empty arrays on pure failure instead of Mock Data
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const currentData = activeTab === 'upcoming' ? exams.upcoming : exams.results;
  const cardItems = currentData.map((item) => (
    <ExamCard key={item.id} data={item} activeTab={activeTab} />
  ));

  return (
    <ProtectedRoute>
    <div className="page-container" style={{ marginTop: '100px' }}>
      <div className="page-header" style={{ textAlign: 'center', paddingBottom: '20px' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Exams</h1>
        <p>Track your upcoming reappear schedules, syllabus, and past results.</p>
      </div>

      <div className="toggle-wrapper" style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('upcoming')} 
          className={`tab-button ${activeTab === 'upcoming' ? 'active-tab' : ''}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('result')} 
          className={`tab-button ${activeTab === 'result' ? 'active-tab' : ''}`}
        >
          Result
        </button>
      </div>

      <div className="list-wrapper">
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading schedule...</p>
        ) : cardItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>No {activeTab} exams found</h3>
            <p>Check back later or contact your department for more information.</p>
          </div>
        ) : (
          <AnimatedList items={cardItems} displayScrollbar={false} showGradients={true} />
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}