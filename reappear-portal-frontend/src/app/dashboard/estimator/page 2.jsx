"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import './estimator.css';

export default function EstimatorPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/estimator/options');
        setSubjects(res.data.subjects);
        setFaculties(res.data.faculties);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    fetchOptions();
  }, []);

  const handleEstimate = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    setError(null);
    setEstimation(null);

    try {
      const url = `/estimator/fail-rate/${selectedSubject}` + (selectedFaculty ? `?professorId=${selectedFaculty}` : '');
      const res = await api.get(url);
      
      // Simulate slow AI thinking effect for animation purposes
      setTimeout(() => {
        setEstimation(res.data);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setError("Failed to generate estimation. Please try again.");
      setLoading(false);
    }
  };

  const availableFaculties = selectedSubject 
    ? faculties.filter(f => f.subjects.some(sub => sub._id === selectedSubject) || true)
    : faculties;

  return (
    <div className="estimator-container">
      {/* Removed Navbar to maintain clean margin and dedicated page space */}
      
      <div className="estimator-content">
        <div className="estimator-header-row">
          <button 
            className="back-button-glass" 
            onClick={() => router.push('/dashboard')}
            aria-label="Go back"
            title="Back to Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          
          <h1 className="estimator-title">Difficulty Estimator</h1>
          <p className="estimator-subtitle">Predict the probability of failing an exam based on historical database records and professor grading trends.</p>
        </div>

        <div className="estimator-clean-card">
          <div className="input-group">
            <label>Select Course <span className="required">*</span></label>
            <select 
              value={selectedSubject} 
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedFaculty('');
              }}
              className="clean-input"
            >
              <option value="">-- Choose a Subject --</option>
              {subjects.map(sub => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectCode} - {sub.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Select Professor (Optional)</label>
            <select 
              value={selectedFaculty} 
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="clean-input"
              disabled={!selectedSubject}
            >
              <option value="">-- Any Professor --</option>
              {availableFaculties.map(fac => (
                <option key={fac._id} value={fac._id}>
                  {fac.name} ({fac.department})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="estimate-btn" 
            onClick={handleEstimate} 
            disabled={!selectedSubject || loading}
          >
            {loading ? <span className="spinner"></span> : "Generate Prediction"}
          </button>
        </div>

        {error && <div className="error-message" style={{color: '#ff2600', marginTop: '1rem', fontWeight: 'bold'}}>{error}</div>}

        {estimation && !loading && (
          <div className="result-clean-card">
            <h2 className="result-title">Prediction Result</h2>
            
            <div className="result-stats">
              <div className="stat-box" style={{animation: 'slideUpFade 0.4s 0.2s backwards'}}>
                <span className="stat-value">{estimation.totalStudents}</span>
                <span className="stat-label">Historical Records</span>
              </div>
              <div className="stat-box" style={{animation: 'slideUpFade 0.4s 0.4s backwards'}}>
                <span className="stat-value">{estimation.failedStudents}</span>
                <span className="stat-label">Total Fails</span>
              </div>
            </div>

            <div className="gauge-container" style={{animation: 'slideUpFade 0.5s 0.6s backwards'}}>
              <div className="gauge-circle" style={{
                background: `conic-gradient(#ff2600 ${Math.round(estimation.failRate)}%, #f0f0f0 ${Math.round(estimation.failRate)}%)`
              }}>
                <div className="gauge-inner">
                  <span className="gauge-percentage">{Math.round(estimation.failRate)}%</span>
                  <span className="gauge-label">Fail Probability</span>
                </div>
              </div>
            </div>

            <div className={`difficulty-badge diff-${estimation.difficulty.toLowerCase().split(' ')[0]}`}>
              Estimated Difficulty: {estimation.difficulty}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
