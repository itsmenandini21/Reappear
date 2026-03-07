"use client";
import { useState, useEffect } from 'react';
import './backlog.css'; // Iski styling niche di hai

const BacklogForm = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState([]); // Database se aane wali list
  const [selectedIds, setSelectedIds] = useState([]); // Backlog wale subjects

  // Mock Data for Demo (Backend API se replace hoga)
  const fetchSubjects = (sem) => {
    const mockSubjects = [
      { _id: '1', name: 'Mathematics-III', code: 'MA-201' },
      { _id: '2', name: 'Data Structures', code: 'CS-203' },
      { _id: '3', name: 'Digital Electronics', code: 'EC-205' },
      { _id: '4', name: 'COA', code: 'CS-207' },
    ];
    setSubjects(mockSubjects);
  };

  useEffect(() => {
    if (semester) fetchSubjects(semester);
  }, [semester]);

  const toggleSubject = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const payload = {
      rollNumber,
      semester,
      backlogs: selectedIds, // Status: active
      cleared: subjects.filter(s => !selectedIds.includes(s._id)).map(s => s._id) // Status: cleared
    };
    console.log("Saving Data for Roll No:", rollNumber, payload);
    alert("Records saved! Form reset for next student.");
    // Reset Form
    setRollNumber('');
    setSemester('');
    setSubjects([]);
    setSelectedIds([]);
  };

  return (
    <div className="backlog-container fade-in">
      <div className="form-header">
        <h3>Batch Backlog Entry</h3>
        <p>Select subjects that are REAPPEARS. Others will be marked as Cleared.</p>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Student Roll Number</label>
          <input 
            type="text" 
            placeholder="e.g. 12215123" 
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Semester</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">Select Sem</option>
            {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
          </select>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="subject-selection-area">
          <h4>Select Subjects with Reappear:</h4>
          <div className="subject-list">
            {subjects.map(sub => (
              <div 
                key={sub._id} 
                className={`subject-item ${selectedIds.includes(sub._id) ? 'is-backlog' : ''}`}
                onClick={() => toggleSubject(sub._id)}
              >
                <div className="checkbox-custom">
                  {selectedIds.includes(sub._id) && '✓'}
                </div>
                <div className="sub-info">
                  <span className="sub-code">{sub.code}</span>
                  <span className="sub-name">{sub.name}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="save-bulk-btn" onClick={handleSave}>
            Save Records & Next Student →
          </button>
        </div>
      )}
    </div>
  );
};

export default BacklogForm;