"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedList from '@/components/AnimatedList';
import api from '@/lib/api';
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
          <p className="exam-faculty">Faculty: {data.faculty}</p>
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
        const response = await api.get('/exams');
        setExams(response.data);
      } catch (error) {
        console.error("Failed to fetch exams, using fallback...", error);
        // Fallback data just in case the backend is sleeping
        setExams({
          upcoming: [
            { id: 1, examName: 'Mid Sem - 2', subject: 'Operating Systems', faculty: 'Prof. A. Sharma', date: '20 March 2026', time: '10:00 AM', room: '101', syllabus: 'Process Management, Threads, CPU Scheduling, Deadlocks.' }
          ],
          results: [
            { id: 4, examName: 'Mid Sem - 1', subject: 'Computer Architecture', faculty: 'Dr. M. Singh', marks: 24, total: 30 }
          ]
        });
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
        ) : (
          <AnimatedList items={cardItems} displayScrollbar={false} showGradients={true} />
        )}
      </div>
    </div>
  );
}