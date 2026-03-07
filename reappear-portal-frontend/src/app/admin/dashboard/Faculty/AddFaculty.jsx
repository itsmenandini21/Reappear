"use client";
import React, { useState } from 'react';
import { FiArrowLeft, FiAlertCircle, FiCheck, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import "./addFaculty.css";

const AddFaculty = ({ onBack }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedSemesters, setSelectedSemesters] = useState([]);

  const semesterData = [1, 2, 3, 4, 5, 6, 7, 8];
  
  const subjectRepo = {
    1: ["Applied Physics", "Programming in C", "Mathematics-I"],
    3: ["Data Structures", "Discrete Mathematics", "Digital Logic"],
    5: ["Operating Systems", "Computer Networks", "Database Management"],
    7: ["Artificial Intelligence", "Cloud Computing", "Information Security"]
  };

  const handleSemToggle = (sem) => {
    setSelectedSemesters(prev => 
      prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem]
    );
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };
  const handleReset = () => {
    // Saari states ko empty/initial kar do
    setSelectedSemesters([]);
    setShowSuccess(false);
    
    // Agar aapne inputs ke liye state banayi hai (jaise facultyName, facultyId) 
    // toh unhe bhi yahan "" set karein. 
    // Lekin agar aap uncontrolled inputs (defaultValue) use kar rahe hain, 
    // toh hum form element ka built-in reset use karenge.
    
    const form = document.querySelector('form');
    if (form) form.reset(); 
    
    toast.success("Form cleared successfully", {
        icon: '🧹',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
};

  return (
    <div className="admin-portal-container fade-in">
      <button className="back-link" onClick={onBack}>
        <FiArrowLeft /> Back to Directory
      </button>

      <div className="form-container">
        <div className="form-header">
          <h2>Register New Faculty</h2>
          <p>Enter the official credentials and map the academic workload for the new member.</p>
        </div>

        <form onSubmit={handleFinalSubmit}>
          {/* SECTION 1: PRIMARY DETAILS */}
          <section className="form-section">
            <h3 className="section-title">Professional Identity</h3>
            <div className="form-grid-horizontal">
              <div className="input-field">
                <label>Faculty ID *</label>
                <input type="text" required placeholder="NITK-2024-001" />
              </div>
              <div className="input-field">
                <label>Full Name *</label>
                <input type="text" required placeholder="Dr. Rajesh Kumar" />
              </div>
              <div className="input-field">
                <label>Department *</label>
                <select required>
                  <option value="">Choose Dept</option>
                  <option>Computer Science</option>
                  <option>Information Technology</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="input-field">
                <label>Email Address *</label>
                <input type="email" required placeholder="rajesh@nitk.ac.in" />
              </div>
            </div>
          </section>

          {/* SECTION 2: SEMESTERS */}
          <section className="form-section">
            <h3 className="section-title">Academic Workload (Semesters)</h3>
            <div className="sem-selection-grid">
              {semesterData.map(sem => (
                <div 
                  key={sem} 
                  onClick={() => handleSemToggle(sem)}
                  className={`sem-card ${selectedSemesters.includes(sem) ? 'active' : ''}`}
                >
                  Sem {sem}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: SUBJECT PICKER */}
          {selectedSemesters.length > 0 && (
            <section className="form-section fade-in">
              <h3 className="section-title">Assign Subjects</h3>
              <div className="subject-grid">
                {selectedSemesters.sort().map(sem => (
                  <div key={sem} className="subject-card">
                    <header>
                      <FiBookOpen className="icon-red" />
                      <h4>Semester {sem}</h4>
                    </header>
                    <div className="sub-chips-wrap">
                      {(subjectRepo[sem] || ["Advanced Elective I", "Project Lab"]).map(sub => (
                        <label key={sub} className="sub-chip-label">
                          <input type="checkbox" /> {sub}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="form-footer">
            <button type="submit" className="confirm-reg-btn">
               Register Faculty & Generate ID
            </button>
            <button type="button" onClick={onBack} className="discard-btn">
               Cancel Registration
            </button>
          </footer>
        </form>
      </div>

      {/* MODALS */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <div className="modal-icon-wrap warning">
              <FiAlertCircle size={30} />
            </div>
            <h3>Confirm Entry?</h3>
            <p>Please verify all details. Once registered, a professional email will be triggered.</p>
            <div className="modal-actions">
              <button className="confirm-reg-btn" onClick={() => {setShowConfirm(false); setShowSuccess(true)}}>Confirm & Save</button>
              <button onClick={() => setShowConfirm(false)} className="discard-btn">Review</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <div className="modal-icon-wrap success">
              <FiCheck size={30} />
            </div>
            <h3>Registration Successful!</h3>
            <p>Faculty record has been successfully added to the system.</p>
            <div className="modal-actions">
              <button className="confirm-reg-btn" onClick={handleReset}>Add Another</button>
              <button onClick={onBack} className="discard-btn">Go to Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFaculty;