"use client";
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiAlertCircle, FiCheck, FiBookOpen, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import "./addFaculty.css";
import api from '@/lib/api';

const AddFaculty = ({ onBack }) => {
  const [facultyData, setFacultyData] = useState({
    name: '',
    department: '', 
    email: '',
    phoneNumber: '',
    subjects: [] 
  });

  const [availableSubjects, setAvailableSubjects] = useState([]); 
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const semesterData = [1, 2, 3, 4, 5, 6, 7, 8];

  // Effect: Fetch subjects based on Single Dept + Selected Semesters
  useEffect(() => {
    const fetchSubs = async () => {
      if (selectedSemesters.length > 0 && facultyData.department) {
        setLoadingSubs(true);
        try {
          const res = await api.get(
            `/subjects/sem?semesters=${selectedSemesters.join(',')}&department=${facultyData.department}`
          );
          setAvailableSubjects(res.data);
        } catch (err) {
          toast.error("Error loading subjects");
        } finally {
          setLoadingSubs(false);
        }
      } else {
        setAvailableSubjects([]);
      }
    };
    fetchSubs();
  }, [selectedSemesters, facultyData.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Agar department change ho raha hai, toh selected semesters aur subjects reset kar do
    if (name === 'department') {
      setSelectedSemesters([]);
      setFacultyData(prev => ({ ...prev, [name]: value, subjects: [] }));
    } else {
      setFacultyData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSemToggle = (sem) => {
    // Condition: Agar dept select nahi hai, toh alert dikhao aur return kar jao
    if (!facultyData.department) {
      toast.error("Please select a department first!");
      return;
    }
    
    setSelectedSemesters(prev =>
      prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem]
    );
  };

  const handleSubjectToggle = (subId) => {
    setFacultyData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subId)
        ? prev.subjects.filter(id => id !== subId)
        : [...prev.subjects, subId]
    }));
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (facultyData.subjects.length === 0) {
      return toast.error("Please assign at least one subject.");
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    const loadingToast = toast.loading("Registering Faculty...");
    try {
      const response = await api.post("/faculty/add", facultyData);
      if (response.status === 201 || response.status === 200) {
        toast.success("Faculty Registered!", { id: loadingToast });
        setShowSuccess(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed", { id: loadingToast });
    }
  };

  const handleReset = () => {
    setFacultyData({ name: '', department: '', email: '', phoneNumber: '', subjects: [] });
    setSelectedSemesters([]);
    setShowSuccess(false);
    setShowConfirm(false);
  };

  return (
    <div className="admin-portal-container fade-in">
      <button className="back-link" onClick={onBack}><FiArrowLeft /> Back to Directory</button>

      <div className="form-container">
        <div className="form-header">
          <h2>Register New Faculty</h2>
          <p>Complete professional details and map academic workload.</p>
        </div>

        <form onSubmit={handleSubmitClick}>
          {/* SECTION 1: IDENTITY */}
          <section className="form-section">
            <h3 className="section-title">Professional Identity</h3>
            <div className="form-grid-horizontal">
              <div className="input-field">
                <label>Full Name *</label>
                <input type="text" required name="name" value={facultyData.name} onChange={handleChange} placeholder="Dr. Rajesh Kumar" />
              </div>
              <div className="input-field">
                <label>Department *</label>
                <select name="department" value={facultyData.department} onChange={handleChange} required>
                  <option value="">Choose Dept</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>
              <div className="input-field">
                <label>Email Address *</label>
                <input type="email" name="email" value={facultyData.email} onChange={handleChange} required placeholder="rajesh@nitk.ac.in" />
              </div>
              <div className="input-field">
                <label>Phone Number *</label>
                <input type="text" name="phoneNumber" value={facultyData.phoneNumber} onChange={handleChange} required placeholder="9145678901" />
              </div>
            </div>
          </section>

          {/* SECTION 2: SEMESTERS (Locked if no Department) */}
          <section className="form-section">
            <h3 className="section-title">
                Academic Workload (Semesters) 
                {!facultyData.department && <span className="lock-badge"><FiLock /> Select Dept First</span>}
            </h3>
            <div className={`sem-selection-grid ${!facultyData.department ? 'disabled-grid' : ''}`}>
              {semesterData.map(sem => (
                <div 
                  key={sem} 
                  onClick={() => handleSemToggle(sem)}
                  className={`sem-card ${selectedSemesters.includes(sem) ? 'active' : ''} ${!facultyData.department ? 'locked' : ''}`}
                >
                  Sem {sem}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: SUBJECT PICKER */}
          {selectedSemesters.length > 0 && (
            <section className="form-section fade-in">
              <h3 className="section-title">Assign {facultyData.department} Subjects</h3>
              {loadingSubs ? <p>Loading subjects...</p> : (
                <div className="subject-grid">
                  {selectedSemesters.sort().map(sem => (
                    <div key={sem} className="subject-card">
                      <header><FiBookOpen className="icon-red" /><h4>Semester {sem}</h4></header>
                      <div className="sub-chips-wrap">
                        {availableSubjects
                          .filter(sub => Number(sub.semester) === sem)
                          .map(sub => (
                            <label key={sub._id} className="sub-chip-label">
                              <input 
                                  type="checkbox" 
                                  checked={facultyData.subjects.includes(sub._id)}
                                  onChange={() => handleSubjectToggle(sub._id)} 
                              /> 
                              {sub.subjectName} <small>({sub.subjectCode})</small>
                            </label>
                          ))}
                          {availableSubjects.filter(sub => Number(sub.semester) === sem).length === 0 && <p className="no-data">No subjects found for this semester.</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <footer className="form-footer">
            <button type="submit" className="confirm-reg-btn">Register Faculty</button>
            <button type="button" onClick={onBack} className="discard-btn">Cancel</button>
          </footer>
        </form>
      </div>

      {/* MODALS remain the same... */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <div className="modal-icon-wrap warning"><FiAlertCircle size={30} /></div>
            <h3>Confirm Registration?</h3>
            <p>Registering <b>{facultyData.name}</b> in <b>{facultyData.department}</b>.</p>
            <div className="modal-actions">
              <button className="confirm-reg-btn" onClick={handleFinalSubmit}>Confirm & Save</button>
              <button onClick={() => setShowConfirm(false)} className="discard-btn">Review</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <div className="modal-icon-wrap success"><FiCheck size={30} /></div>
            <h3>Faculty Added!</h3>
            <div className="modal-actions">
              <button className="confirm-reg-btn" onClick={handleReset}>Add Another</button>
              <button onClick={onBack} className="discard-btn">View Directory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFaculty;