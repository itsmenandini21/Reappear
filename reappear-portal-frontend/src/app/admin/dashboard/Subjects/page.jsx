"use client";
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './subjects.css';

const SubjectUpdates = () => {
  const [view, setView] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessuodal, setShowSuccessuodal] = useState(false); // New Success Modal
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [subjects, setSubjects] = useState([
    { id: 1, code: "CS-302", name: "Operating Systems", dept: "CSE", credits: 4, sem: "5th" },
    { id: 2, code: "IT-501", name: "Web Technology", dept: "IT", credits: 3, sem: "3rd" },
    { id: 3, code: "EC-201", name: "Digital Electronics", dept: "ECE", credits: 4, sem: "3rd" },
  ]);

  const confirmDelete = () => {
    setSubjects(subjects.filter(s => s.id !== subjectToDelete.id));
    setShowDeleteModal(false);
    toast.success("Subject Removed!", { position: "top-center" });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (view === 'add') {
      setShowSuccessuodal(true); // "Add More" wala modal dikhao
    } else {
      toast.success("Subject Updated Successfully!", { position: "top-center" });
      setView('list');
    }
  };

  const handleAddMore = (confirm) => {
    setShowSuccessuodal(false);
    if (confirm) {
      document.getElementById("subject-form").reset(); // Reset form
      toast.success("Ready for next entry!", { position: "top-center" });
    } else {
      setView('list');
    }
  };

  return (
    <div className="su-main-container">
      <Toaster position="top-center" />

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="su-modal-overlay">
          <div className="su-modal-content">
            <div className="su-modal-icon">⚠️</div>
            <h2>Are you sure?</h2>
            <p>Do you really want to remove <b>{subjectToDelete?.name}</b>?</p>
            <div className="su-modal-buttons">
              <button className="su-btn-confirm" onClick={confirmDelete}>Yes, Delete it</button>
              <button className="su-btn-cancel-modal" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SUCCESS / ADD MORE MODAL --- */}
      {showSuccessuodal && (
        <div className="su-modal-overlay">
          <div className="su-modal-content">
            <div className="su-modal-icon">✅</div>
            <h2>Subject Added!</h2>
            <p>Subject has been saved successfully. Do you want to add more subjects?</p>
            <div className="su-modal-buttons">
              <button className="su-btn-confirm" onClick={() => handleAddMore(true)}>Yes, Add More</button>
              <button className="su-btn-cancel-modal" onClick={() => handleAddMore(false)}>No, Back to List</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="su-dashboard-header">
        <div className="su-title-box">
          <h1>Subject Repository</h1>
        </div>
        <button className="su-primary-btn" onClick={() => { setSelectedSubject(null); setView('add'); }}>
          <span className="btn-icon">+</span> Add New Subject
        </button>
      </div>

      {view === 'list' ? (
        <div className="su-content-card">
          <div className="su-search-wrapper">
            <div className="su-search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by code, name or department..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="su-table-container">
            <table className="su-modern-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Details</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th className="text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {subjects
                  .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((sub) => (
                    <tr key={sub.id} className="su-table-row">
                      <td className="su-code-td"><span>{sub.code}</span></td>
                      <td>
                        <div className="su-info-td">
                          <span className="su-name-main">{sub.name}</span>
                          <span className="su-credits-sub">{sub.credits} Credits</span>
                        </div>
                      </td>
                      <td><span className="su-dept-pill">{sub.dept}</span></td>
                      <td>{sub.sem} Sem</td>
                      <td className="su-actions-td">
                        <button className="su-edit-btn" onClick={() => { setSelectedSubject(sub); setView('update'); }}>Update</button>
                        <button className="su-remove-btn" onClick={() => { setSubjectToDelete(sub); setShowDeleteModal(true); }}>Remove</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- FORM VIEW --- */
        <div className="su-form-wrapper">
           <div className="su-form-card">
              <div className="su-form-header">
                <h2>{view === 'add' ? "Add Subject" : "Update Subject"}</h2>
              </div>
              <form id="subject-form" onSubmit={handleFormSubmit} className="su-grid-form">
                <div className="su-input-group">
                  <label>Subject Code</label>
                  <input type="text" defaultValue={selectedSubject?.code} placeholder="CS-301" required />
                </div>
                <div className="su-input-group">
                  <label>Subject Name</label>
                  <input type="text" defaultValue={selectedSubject?.name} placeholder="Operating Systems" required />
                </div>
                <div className="su-input-group">
                  <label>Department</label>
                  <select defaultValue={selectedSubject?.dept || ""}>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
                <div className="su-input-group">
                  <label>Credits</label>
                  <input type="number" defaultValue={selectedSubject?.credits} required />
                </div>
                <div className="su-form-actions">
                  {/* Button Label Changed to 'Add Subject' for Add view */}
                  <button type="submit" className="su-save-btn">
                    {view === 'add' ? "Add Subject" : "Save Changes"}
                  </button>
                  <button type="button" className="su-back-btn" onClick={() => setView('list')}>Back to List</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubjectUpdates;