"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './results.css';

const UploadResults = () => {
  const [resFilters, setResFilters] = useState({ dept: '', branch: '', sem: '', subject: '', examType: '', component: '', totalMarks: '' });
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [activeRoll, setActiveRoll] = useState(null); 
  const [studentMarks, setStudentMarks] = useState({}); 

  const availableSubjects = [
    { code: "CS-302", name: "Operating Systems" },
    { code: "IT-501", name: "Web Technology" },
    { code: "EC-201", name: "Digital Electronics" }
  ];

  useEffect(() => {
    if (resFilters.dept && resFilters.branch && resFilters.sem && resFilters.subject && resFilters.examType && resFilters.component) {
      // Mocking the backend fetch of reappear students
      const mockRolls = Array.from({ length: 12 }, (_, i) => `1241${(i + 1).toString().padStart(2, '0')}`);
      setEligibleStudents(mockRolls);
    } else {
      setEligibleStudents([]);
      setActiveRoll(null);
    }
  }, [resFilters]);

  const handleResChange = (e) => setResFilters({ ...resFilters, [e.target.name]: e.target.value });

  const handleMarkEntry = (roll, field, value) => {
    setStudentMarks(prev => ({ ...prev, [roll]: { ...prev[roll], [field]: value } }));
  };

  const submitResults = () => {
    const uploadedCount = Object.keys(studentMarks).length;
    if (uploadedCount === 0) return toast.error("Please enter marks for at least one student!");
    if (!resFilters.totalMarks) return toast.error("Please enter the Total Marks for this exam!");
    
    toast.success(`Results uploaded successfully for ${uploadedCount} students!`);
    setStudentMarks({});
    setActiveRoll(null);
  };

  return (
    <div className="res-main-container">
      <Toaster position="top-center" />

      <div className="res-header">
        <h1>Upload Results</h1>
        <p>Enter marks and publish official pass/fail status for reappear exams.</p>
      </div>

      <div className="res-card">
        <h3 className="res-section-title">Identify Batch & Exam</h3>
        
        <div className="res-form-row-4">
          <div className="res-input-group">
            <label>Department</label>
            <select name="dept" value={resFilters.dept} onChange={handleResChange}>
              <option value="">Select Dept</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
          <div className="res-input-group">
            <label>Branch</label>
            <select name="branch" value={resFilters.branch} onChange={handleResChange} disabled={!resFilters.dept}>
              <option value="">Select Branch</option>
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
            </select>
          </div>
          <div className="res-input-group">
            <label>Semester</label>
            <select name="sem" value={resFilters.sem} onChange={handleResChange} disabled={!resFilters.branch}>
              <option value="">Select Sem</option>
              <option value="3rd">3rd Sem</option>
              <option value="5th">5th Sem</option>
            </select>
          </div>
          <div className="res-input-group">
            <label>Subject</label>
            <select name="subject" value={resFilters.subject} onChange={handleResChange} disabled={!resFilters.sem}>
              <option value="">Select Subject</option>
              {availableSubjects.map(sub => <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>)}
            </select>
          </div>
        </div>

        <div className="res-form-row-3 res-mt-small">
          <div className="res-input-group">
            <label>Exam Type</label>
            <select name="examType" value={resFilters.examType} onChange={handleResChange}>
              <option value="">Select Type</option>
              <option value="Mid-Sem-1">Mid Sem 1</option>
              <option value="Mid-Sem-2">Mid Sem 2</option>
              <option value="End-Sem">End Sem</option>
            </select>
          </div>
          <div className="res-input-group">
            <label>Component</label>
            <select name="component" value={resFilters.component} onChange={handleResChange}>
              <option value="">Select Component</option>
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
            </select>
          </div>
          <div className="res-input-group">
            <label>Total Marks <span style={{color: '#E3342F'}}>*</span></label>
            <input type="number" name="totalMarks" placeholder="e.g. 50" value={resFilters.totalMarks} onChange={handleResChange} />
          </div>
        </div>

        {/* --- ELIGIBLE STUDENTS GRID --- */}
        {eligibleStudents.length > 0 && (
          <div className="res-students-area">
            <div className="res-area-header">
              <h3>Reappear Students ({eligibleStudents.length})</h3>
              <span className="res-helper-text">Click a roll number to enter marks</span>
            </div>

            <div className="res-roll-grid">
              {eligibleStudents.map((roll) => {
                const isGraded = !!studentMarks[roll]?.status;
                const isOpen = activeRoll === roll;

                return (
                  <div key={roll} className="res-roll-wrapper">
                    <div 
                      className={`res-roll-chip ${isGraded ? 'graded' : ''} ${isOpen ? 'active-chip' : ''}`}
                      onClick={() => setActiveRoll(isOpen ? null : roll)}
                    >
                      {roll}
                      {isGraded && <span className="res-check-icon">✓</span>}
                    </div>

                    {/* INLINE MARKS POPOVER */}
                    {isOpen && (
                      <div className="res-marks-popover" onClick={(e) => e.stopPropagation()}>
                        <div className="res-popover-header">Result for {roll}</div>
                        <div className="res-pop-input">
                          <label>Marks Obtained</label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={studentMarks[roll]?.marks || ''}
                            onChange={(e) => handleMarkEntry(roll, 'marks', e.target.value)}
                          />
                        </div>
                        <div className="res-pop-input">
                          <label>Status</label>
                          <div className="res-status-toggles">
                            <button 
                              className={`res-btn-pass ${studentMarks[roll]?.status === 'Pass' ? 'selected' : ''}`}
                              onClick={() => { handleMarkEntry(roll, 'status', 'Pass'); setActiveRoll(null); }}
                            >Pass</button>
                            <button 
                              className={`res-btn-fail ${studentMarks[roll]?.status === 'Fail' ? 'selected' : ''}`}
                              onClick={() => { handleMarkEntry(roll, 'status', 'Fail'); setActiveRoll(null); }}
                            >Fail</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="res-submit-row">
              <p className="res-selected-count"><b>{Object.keys(studentMarks).length}</b> results entered</p>
              <button className="res-btn-primary" onClick={submitResults}>Publish Results →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResults;