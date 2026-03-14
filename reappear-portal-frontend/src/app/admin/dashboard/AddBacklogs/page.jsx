"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './backlog.css';

const AddBacklogs = () => {
  // Removed 'subject' from filters
  const [filters, setFilters] = useState({ dept: '', branch: '', sem: '' });
  const [lastDate, setLastDate] = useState('');
  const [rollNumbers, setRollNumbers] = useState([]); 
  
  // NEW STATE: Maps a roll number to an array of selected subjects
  // Example: { "124101": ["CS-302", "IT-501"], "124105": ["EC-201"] }
  const [studentSelections, setStudentSelections] = useState({}); 
  const [activeDropdown, setActiveDropdown] = useState(null); // Tracks which roll number's dropdown is open
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Subjects (The backend will supply these based on the Semester selected)
  const availableSubjects = [
    { code: "CS-302", name: "Operating Systems" },
    { code: "IT-501", name: "Web Technology" },
    { code: "EC-201", name: "Digital Electronics" },
    { code: "MA-201", name: "Engineering Maths III" }
  ];

  // Fetch roll numbers based on the 3 main filters
  useEffect(() => {
    if (filters.dept && filters.branch && filters.sem) {
      const mockRolls = Array.from({ length: 30 }, (_, i) => `1241${(i + 1).toString().padStart(2, '0')}`);
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

  // Toggles a subject for a specific student
  const handleSubjectToggle = (roll, subjectCode) => {
    setStudentSelections(prev => {
      const currentSubjects = prev[roll] || [];
      
      if (currentSubjects.includes(subjectCode)) {
        // Remove subject
        const updatedSubjects = currentSubjects.filter(code => code !== subjectCode);
        if (updatedSubjects.length === 0) {
          const newState = { ...prev };
          delete newState[roll]; // If no subjects left, remove student from selection entirely
          return newState;
        }
        return { ...prev, [roll]: updatedSubjects };
      } else {
        // Add subject
        return { ...prev, [roll]: [...currentSubjects, subjectCode] };
      }
    });
  };

  // Clears all selections
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

  const confirmAndNotify = () => {
    setIsSubmitting(true);
    // Simulate Backend API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(false);
      toast.success(`Successfully assigned backlogs to ${selectedStudentCount} students!`, { duration: 4000 });
      
      setFilters({ dept: '', branch: '', sem: '' });
      setRollNumbers([]);
      setStudentSelections({});
      setLastDate('');
    }, 2000);
  };

  return (
    <div className="bl-main-container">
      <Toaster position="top-center" />

      {/* --- CONFIRMATION MODAL --- */}
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
        {/* --- 3-COLUMN FILTER ROW --- */}
        <div className="bl-filter-row-3">
          <div className="bl-input-group">
            <label>Department</label>
            <select name="dept" value={filters.dept} onChange={handleFilterChange}>
              <option value="">Select Dept</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
          <div className="bl-input-group">
            <label>Branch</label>
            <select name="branch" value={filters.branch} onChange={handleFilterChange} disabled={!filters.dept}>
              <option value="">Select Branch</option>
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics</option>
            </select>
          </div>
          <div className="bl-input-group">
            <label>Semester</label>
            <select name="sem" value={filters.sem} onChange={handleFilterChange} disabled={!filters.branch}>
              <option value="">Select Sem</option>
              <option value="1st">1st Sem</option>
              <option value="3rd">3rd Sem</option>
              <option value="5th">5th Sem</option>
            </select>
          </div>
        </div>

        {/* --- ROLL NUMBER GRID WITH DROPDOWNS --- */}
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

                    {/* THE DROPDOWN MENU */}
                    {isDropdownOpen && (
                      <div className="bl-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="bl-dropdown-header">Select Subjects</div>
                        {availableSubjects.map(sub => (
                          <label key={sub.code} className="bl-dropdown-item">
                            <input 
                              type="checkbox" 
                              checked={(studentSelections[roll] || []).includes(sub.code)}
                              onChange={() => handleSubjectToggle(roll, sub.code)}
                            />
                            <span className="bl-dropdown-text">{sub.code}</span>
                          </label>
                        ))}
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