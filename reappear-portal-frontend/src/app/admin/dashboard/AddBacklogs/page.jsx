"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/api';
import './backlog.css';

const AddBacklogs = () => {
  const [filters, setFilters] = useState({ dept: '', branch: '', sem: '' });
  const [lastDate, setLastDate] = useState('');
  const [rollNumbers, setRollNumbers] = useState([]); 
  const [studentSelections, setStudentSelections] = useState({}); 
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [existingBacklogs, setExistingBacklogs] = useState([]); // NEW STATE: To track DB records
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Database Selectors
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dynamicSemesters, setDynamicSemesters] = useState([]);

  useEffect(() => {
    api.get('/subjects/departments')
      .then(res => setDepartments(res.data))
      .catch(() => toast.error("Failed to fetch Schema Departments"));
  }, []);

  useEffect(() => {
    if (filters.dept) {
      api.get(`/subjects/branches?department=${filters.dept}`)
        .then(res => setBranches(res.data))
        .catch(() => {});
    } else {
      setBranches([]);
      setFilters(prev => ({ ...prev, branch: '', sem: '' }));
    }
  }, [filters.dept]);

  useEffect(() => {
     if (filters.dept && filters.branch) {
        api.get(`/subjects/semesters/distinct?department=${filters.dept}&branch=${filters.branch}`)
          .then(res => setDynamicSemesters(res.data))
          .catch(() => {});
     } else {
        setDynamicSemesters([]);
        setFilters(prev => ({ ...prev, sem: '' }));
     }
  }, [filters.branch, filters.dept]);

  // Load active subjects for the selected matrix
  useEffect(() => {
    const fetchSubjects = async () => {
        if (!filters.dept || !filters.branch || !filters.sem) {
            setAvailableSubjects([]);
            return;
        }
        try {
            const semNum = parseInt(filters.sem.replace(/[^0-9]/g, ''));
            const res = await api.get(`/subjects/sem?semesters=${semNum}&department=${filters.dept}&branch=${filters.branch}`);
            setAvailableSubjects(res.data);
        } catch (error) {
            console.error("Failed to load official subjects", error);
        }
    }
    fetchSubjects();
  }, [filters.dept, filters.branch, filters.sem]);

  // NEW EFFECT: Fetch existing backlogs when a dropdown is opened
  useEffect(() => {
    const fetchExisting = async () => {
      if (activeDropdown) {
        try {
          const res = await api.get(`/reappear/check/${activeDropdown}`);
          // Assuming backend returns an array of subject IDs or Codes
          setExistingBacklogs(res.data.map(rec => rec.subject.subjectCode));
        } catch (error) {
          console.error("Failed to check existing backlogs", error);
          setExistingBacklogs([]);
        }
      } else {
        setExistingBacklogs([]);
      }
    };
    fetchExisting();
  }, [activeDropdown]);

  useEffect(() => {
    if (filters.dept && filters.branch && filters.sem) {
      const mockRolls = Array.from({ length: 60 }, (_, i) => `124103${(i + 1).toString().padStart(3, '0')}`);
      setRollNumbers(mockRolls);
      setStudentSelections({}); 
      setActiveDropdown(null);
    } else {
      setRollNumbers([]);
      setStudentSelections({});
      setActiveDropdown(null);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubjectToggle = (roll, subjectCode) => {
    // Prevent toggling if it's already in the database
    if (existingBacklogs.includes(subjectCode)) return;

    setStudentSelections(prev => {
      const currentSubjects = prev[roll] || [];
      if (currentSubjects.includes(subjectCode)) {
        const updatedSubjects = currentSubjects.filter(code => code !== subjectCode);
        if (updatedSubjects.length === 0) {
          const newState = { ...prev };
          delete newState[roll];
          return newState;
        }
        return { ...prev, [roll]: updatedSubjects };
      } else {
        return { ...prev, [roll]: [...currentSubjects, subjectCode] };
      }
    });
  };

  const clearAll = () => {
    setStudentSelections({});
    setActiveDropdown(null);
  };

  const selectedStudentCount = Object.keys(studentSelections).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStudentCount === 0) return toast.error("Please assign subjects to at least one student!");
    if (!lastDate) return toast.error("Please provide the last date for the form!");
    setShowModal(true);
  };

  const confirmAndNotify = async () => {
    setIsSubmitting(true);
    try {
        // Prepare bulk assignments data
        const assignments = [];
        for (const [rollNumber, subjects] of Object.entries(studentSelections)) {
            for (const subjectCode of subjects) {
                const subjectDoc = availableSubjects.find(sub => sub.subjectCode === subjectCode);
                if (subjectDoc && subjectDoc._id) {
                    assignments.push({
                        rollNumber: rollNumber,
                        subjectId: subjectDoc._id
                    });
                }
            }
        }

        // Send all assignments in one bulk request
        await api.post('/reappear/add-bulk', {
            assignments: assignments,
            lastDate: lastDate
        });

        setIsSubmitting(false);
        setShowModal(false);
        toast.success(`Successfully assigned backlogs to ${selectedStudentCount} students!`, { duration: 4000 });
        setFilters({ dept: '', branch: '', sem: '' });
        setRollNumbers([]);
        setStudentSelections({});
        setLastDate('');
    } catch (error) {
        setIsSubmitting(false);
        console.error("Failed to assign backlogs", error);
        toast.error("Failed to assign backlogs. Check console for details.");
    }
  };

  return (
    <div className="bl-main-container">
      <Toaster position="top-center" />
      {showModal && (
        <div className="bl-modal-overlay">
          <div className="bl-modal-content">
            <div className="bl-modal-icon">📨</div>
            <h2>Confirm & Notify</h2>
            <p>You are assigning custom backlogs to <b>{selectedStudentCount} students</b>.</p>
            <p className="bl-modal-subtext">Students will receive an official email notifying them to check their dashboard and fill the form by <b>{lastDate}</b>.</p>
            <div className="bl-modal-actions">
              <button className="bl-btn-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="bl-btn-confirm" onClick={confirmAndNotify} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bl-header">
        <h1>Batch Backlog Entry</h1>
        <p>Filter the batch, click a student to assign specific subjects, and instantly notify them.</p>
      </div>

      <div className="bl-card">
        <div className="bl-filter-row-3">
          <div className="bl-input-group">
            <label>Department</label>
            <select name="dept" value={filters.dept} onChange={handleFilterChange}>
              <option value="">Select Dept</option>
              {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="bl-input-group">
            <label>Branch</label>
            <select name="branch" value={filters.branch} onChange={handleFilterChange} disabled={!filters.dept || branches.length === 0}>
              <option value="">{branches.length === 0 ? "No Branches" : "Select Branch"}</option>
              {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="bl-input-group">
            <label>Semester</label>
            <select name="sem" value={filters.sem} onChange={handleFilterChange} disabled={!filters.branch || dynamicSemesters.length === 0}>
              <option value="">{dynamicSemesters.length === 0 ? "No Semesters" : "Select Sem"}</option>
              {dynamicSemesters.map((s, i) => (
                  <option key={i} value={s.toString()}>{s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'} Sem</option>
              ))}
            </select>
          </div>
        </div>

        {rollNumbers.length > 0 && (
          <div className="bl-selection-area">
            <div className="bl-area-header">
              <h3>Assign Subjects to Students</h3>
              <div className="bl-quick-actions">
                <button type="button" onClick={clearAll}>Clear All Selections</button>
              </div>
            </div>

            <div className="bl-roll-grid">
              {rollNumbers.map((roll) => {
                const isSelected = !!studentSelections[roll];
                const subjectCount = isSelected ? studentSelections[roll].length : 0;
                const isDropdownOpen = activeDropdown === roll;

                return (
                  <div key={roll} className="bl-roll-wrapper">
                    <div 
                      className={`bl-roll-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : roll)}
                    >
                      {roll}
                      {isSelected && <span className="bl-badge">{subjectCount}</span>}
                    </div>

                    {isDropdownOpen && (
                      <div className="bl-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="bl-dropdown-header">Select Subjects</div>
                        {availableSubjects.map(sub => {
                          const isAlreadyInDB = existingBacklogs.includes(sub.subjectCode);
                          return (
                            <label 
                              key={sub.subjectCode} 
                              className={`bl-dropdown-item ${isAlreadyInDB ? 'disabled-item' : ''}`}
                              title={isAlreadyInDB ? "Already assigned" : ""}
                              style={isAlreadyInDB ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                              <input 
                                type="checkbox" 
                                disabled={isAlreadyInDB}
                                checked={(studentSelections[roll] || []).includes(sub.subjectCode) || isAlreadyInDB}
                                onChange={() => handleSubjectToggle(roll, sub.subjectCode)}
                              />
                              <span className="bl-dropdown-text">
                                {sub.subjectName} <small style={{color: '#666', fontSize: '0.85em'}}>({sub.subjectCode})</small> {isAlreadyInDB ? "(Already in DB)" : ""}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bl-bottom-section">
              <div className="bl-date-input">
                <label>Last Date to Fill Form <span style={{color: '#E3342F'}}>*</span></label>
                <input 
                  type="date" 
                  value={lastDate} 
                  onChange={(e) => setLastDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="bl-notification-preview">
                <label>Automated Email Preview</label>
                <div className="bl-email-box">
                  <p><b>Subject:</b> Action Required: Reappear Form Updates</p>
                  <p>Dear Student,</p>
                  <p>You have been marked for reappears in specific subjects by the Exam Cell. Please log in to your NIT KKR Reappear Portal to view your assigned subjects and complete your form submission by <b>{lastDate || '[Selected Date]'}</b> to avoid late fees.</p>
                  <p>- Exam Cell, NIT Kurukshetra</p>
                </div>
              </div>

              <div className="bl-submit-row">
                <p className="bl-selected-count"><b>{selectedStudentCount}</b> students assigned backlogs</p>
                <button className="bl-btn-primary" onClick={handleSubmit}>
                  Proceed to Notify →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBacklogs;