"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './results.css';
import api from '@/lib/api';

const UploadResults = () => {
  const [resFilters, setResFilters] = useState({ dept: '', branch: '', sem: '', subject: '', examType: '', component: '', totalMarks: '', evaluator: '' });
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [activeRoll, setActiveRoll] = useState(null); 
  const [studentMarks, setStudentMarks] = useState({}); 

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableEvaluators, setAvailableEvaluators] = useState([]);

  const dummyData = {
    'Computer Engineering': [
      'Information Technology',
      'Artificial Intelligence and Machine Learning',
      'Artificial Intelligence and Data Science',
      'Mathematics and Computing'
    ],
    'Electronics and Communication Engineering': [
      'Electronics & Communication Engineering (ECE)',
      'Industrial Internet of Things (IIoT)',
      'Microelectronics and VLSI Engineering'
    ],
    'Mechanical Engineering': [
      'Mechanical Engineering',
      'Production & Industrial Engineering',
      'Robotics & Automation'
    ],
    'Electrical Engineering': ['Electrical Engineering'],
    'Civil Engineering': ['Civil Engineering'],
    'Energy Science and Engineering': ['Sustainable Energy Technologies'],
    'Computer Applications': ['MCA']
  };

  const departments = Object.keys(dummyData);
  const branches = resFilters.dept ? dummyData[resFilters.dept] || [] : [];
  const dynamicSemesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Clear dependent filters when dept changes to an invalid one for current branch
  useEffect(() => {
    if (resFilters.dept) {
      const validBranches = dummyData[resFilters.dept] || [];
      if (!validBranches.includes(resFilters.branch)) {
        setResFilters(prev => ({ ...prev, branch: '', sem: '', subject: '', evaluator: '' })); 
      }
    } else {
      setResFilters(prev => ({ ...prev, branch: '', sem: '', subject: '', evaluator: '' })); 
    }
  }, [resFilters.dept]);

  // Handle branch changes
  useEffect(() => {
    if (!resFilters.branch) {
      setResFilters(prev => ({ ...prev, sem: '', subject: '', evaluator: '' })); 
    }
  }, [resFilters.branch]);

  // Dynamically fetch Evaluators
  useEffect(() => {
    if (resFilters.subject) {
       api.get(`/faculty/subject?subjectCode=${resFilters.subject}`)
         .then(res => setAvailableEvaluators(res.data))
         .catch(() => toast.error("Failed to fetch mapped Evaluators"));
    } else {
       setAvailableEvaluators([]);
    }
  }, [resFilters.subject]);

  // Dynamically fetch subjects for the exact Department, Branch, and Semester selected
  useEffect(() => {
    if (resFilters.dept && resFilters.branch && resFilters.sem) {
       const semNum = parseInt(resFilters.sem.replace(/[^0-9]/g, '')); // Safely extracts 3 from "3rd"
       api.get(`/subjects/sem?semesters=${semNum}&department=${resFilters.dept}&branch=${resFilters.branch}`)
         .then(res => setAvailableSubjects(res.data))
         .catch(() => toast.error("Failed to load official subjects for this configuration."));
    } else {
       setAvailableSubjects([]);
       setResFilters(prev => ({ ...prev, subject: '', evaluator: '' }));
    }
  }, [resFilters.dept, resFilters.branch, resFilters.sem]);

  useEffect(() => {
    if (resFilters.dept && resFilters.branch && resFilters.sem && resFilters.subject && resFilters.examType && resFilters.component) {
      
      const fetchEligibleStudents = async () => {
        try {
          const response = await api.get(`/reappear/admin/eligible-students?subjectCode=${resFilters.subject}`);
          setEligibleStudents(response.data);
          
          if(response.data.length === 0){
             toast.error("No active reappears found for this Subject in exactly this Batch query.");
          }
        } catch (error) {
          toast.error("Failed to query legitimate subjects from Reappear Schema.");
          setEligibleStudents([]);
        }
      };

      fetchEligibleStudents();

    } else {
      setEligibleStudents([]);
      setActiveRoll(null);
    }
  }, [resFilters]);

  const handleResChange = (e) => setResFilters({ ...resFilters, [e.target.name]: e.target.value });

  const handleMarkEntry = (roll, field, value) => {
    setStudentMarks(prev => ({ ...prev, [roll]: { ...prev[roll], [field]: value } }));
  };

  const submitResults = async () => {
    const uploadedCount = Object.keys(studentMarks).length;
    if (uploadedCount === 0) return toast.error("Please enter marks for at least one student!");
    if (!resFilters.totalMarks) return toast.error("Please enter the Total Marks for this exam!");

    // Ensure every selected student specifically has a typed out mark
    for (const roll of Object.keys(studentMarks)) {
      if (studentMarks[roll].marks === undefined || studentMarks[roll].marks.toString().trim() === '') {
        return toast.error(`Incomplete Entry: Please enter the exact marks obtained for Roll No: ${roll}`);
      }
    }
    
    // Transform studentMarks object into flat array
    const resultsPayload = Object.keys(studentMarks).map(roll => ({
        rollNumber: roll,
        marksObtained: Number(studentMarks[roll].marks) || 0,
        status: studentMarks[roll].status || 'Fail'
    }));

    try {
        const response = await api.post('/results/bulk', {
            subjectCode: resFilters.subject,
            evaluatedBy: resFilters.evaluator,
            totalMarks: Number(resFilters.totalMarks),
            results: resultsPayload
        });
        toast.success(response.data.message || `Results uploaded successfully for ${uploadedCount} students!`);
        setStudentMarks({});
        setActiveRoll(null);
        
        // Refresh grid
        const newResponse = await api.get(`/reappear/admin/eligible-students?subjectCode=${resFilters.subject}`);
        setEligibleStudents(newResponse.data);
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to publish results to database.");
    }
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
              {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="res-input-group">
            <label>Branch</label>
            <select name="branch" value={resFilters.branch} onChange={handleResChange} disabled={!resFilters.dept || branches.length === 0}>
              <option value="">{branches.length === 0 ? "No Branches" : "Select Branch"}</option>
              {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="res-input-group">
            <label>Semester</label>
            <select name="sem" value={resFilters.sem} onChange={handleResChange} disabled={!resFilters.branch || dynamicSemesters.length === 0}>
              <option value="">{dynamicSemesters.length === 0 ? "No Semesters" : "Select Sem"}</option>
              {dynamicSemesters.map((s, i) => (
                  <option key={i} value={s}>{s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'} Sem</option>
              ))}
            </select>
          </div>
          <div className="res-input-group">
            <label>Subject</label>
            <select name="subject" value={resFilters.subject} onChange={handleResChange} disabled={!resFilters.sem || availableSubjects.length === 0}>
              <option value="">{availableSubjects.length === 0 ? "No Subjects Found" : "Select Subject"}</option>
              {availableSubjects.map(sub => <option key={sub.subjectCode} value={sub.subjectCode}>{sub.subjectCode} - {sub.subjectName}</option>)}
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
            <label>Evaluated By <span className="res-helper-text" style={{fontSize: '0.8em', color: '#666'}}>(Optional)</span></label>
            <select name="evaluator" value={resFilters.evaluator} onChange={handleResChange} disabled={!resFilters.subject || availableEvaluators.length === 0}>
              <option value="">{availableEvaluators.length === 0 ? "No Evaluators Found" : "Select Evaluator"}</option>
              {availableEvaluators.map(prof => <option key={prof._id} value={prof._id}>{prof.name}</option>)}
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
              <button 
                className="res-btn-primary" 
                onClick={submitResults}
                disabled={Object.keys(studentMarks).length === 0}
                style={Object.keys(studentMarks).length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                Publish Results →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResults;