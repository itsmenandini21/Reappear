"use client";
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './subjects.css';

const SubjectUpdates = () => {
  const [view, setView] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [notifyData, setNotifyData] = useState({ rollNumbers: '', title: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  // Mock Database
  const [subjects, setSubjects] = useState([
    { id: 1, code: "CS-302", name: "Operating Systems", dept: "CSE", credits: 4, sem: "5th" },
    { id: 2, code: "IT-501", name: "Web Technology", dept: "IT", credits: 3, sem: "3rd" },
    { id: 3, code: "EC-201", name: "Digital Electronics", dept: "ECE", credits: 4, sem: "3rd" },
  ]);

  const confirmDelete = () => {
    setSubjects(subjects.filter(s => s.id !== subjectToDelete.id));
    setShowDeleteModal(false);
    toast.success("Subject Removed Successfully!", { position: "top-center" });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    toast.success(view === 'add' ? "Subject Added!" : "Subject Updated!", { position: "top-center" });
    setView('list');
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate API Call to backend to send emails
    setTimeout(() => {
      toast.success(`Notices sent to students successfully!`, { position: "top-center", icon: '📢' });
      setIsSending(false);
      setNotifyData({ rollNumbers: '', title: '', message: '' }); 
      setView('list');
    }, 1500);
  };

  return (
    <div className="admin-subjects-wrapper">
      <Toaster position="top-center" />

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-card bounce-in">
            <div className="modal-icon-danger">⚠️</div>
            <h2>Remove Subject?</h2>
            <p>Are you sure you want to delete <b>{subjectToDelete?.name}</b>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Subject Repository</h1>
          <p className="page-subtitle">Manage curriculum and broadcast notices to enrolled students.</p>
        </div>
        {view === 'list' && (
          <button className="btn-primary" onClick={() => { setSelectedSubject(null); setView('add'); }}>
            + Add New Subject
          </button>
        )}
      </div>

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <div className="table-card fade-in">
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by code, name, or department..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Subject Details</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects
                  .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div className="subject-info">
                          <span className="sub-code">{sub.code}</span>
                          <span className="sub-name">{sub.name}</span>
                        </div>
                      </td>
                      <td><span className="pill pill-dept">{sub.dept}</span></td>
                      <td><span className="text-muted">{sub.credits} Credits</span></td>
                      <td><span className="pill pill-sem">{sub.sem} Sem</span></td>
                      <td className="action-cell">
                        <button className="action-btn btn-notify" onClick={() => { setSelectedSubject(sub); setView('notify'); }} title="Send Notice">
                          📢 Notify
                        </button>
                        <button className="action-btn btn-edit" onClick={() => { setSelectedSubject(sub); setView('update'); }}>
                          Edit
                        </button>
                        <button className="action-btn btn-delete" onClick={() => { setSubjectToDelete(sub); setShowDeleteModal(true); }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {subjects.length === 0 && <div className="empty-state">No subjects found.</div>}
          </div>
        </div>
      )}

      {/* --- ADD / UPDATE FORM --- */}
      {/* --- ADD / UPDATE FORM --- */}
      {(view === 'add' || view === 'update') && (
        <div className="form-card fade-in">
          
          {/* 1. ADD THIS BACK BUTTON HERE */}
          <button className="btn-back-top" onClick={() => setView('list')}>
            ← Back to Subjects
          </button>

          <div className="form-header">
            <h2>{view === 'add' ? "Add New Subject" : "Edit Subject Details"}</h2>
          </div>
          <form onSubmit={handleFormSubmit} className="grid-form">
            {/* ... (Keep your existing form inputs here) ... */}
            <div className="input-group">
              <label>Subject Code</label>
              <input type="text" defaultValue={selectedSubject?.code} placeholder="e.g. CS-301" required />
            </div>
            <div className="input-group">
              <label>Subject Name</label>
              <input type="text" defaultValue={selectedSubject?.name} placeholder="e.g. Operating Systems" required />
            </div>
            <div className="input-group">
              <label>Department</label>
              <select defaultValue={selectedSubject?.dept || "CSE"}>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Credits</label>
              <input type="number" defaultValue={selectedSubject?.credits} placeholder="e.g. 4" required />
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn-cancel" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn-primary">{view === 'add' ? "Save Subject" : "Update Details"}</button>
            </div>
          </form>
        </div>
      )}

      {/* --- NOTIFY STUDENTS FORM --- */}
      {view === 'notify' && (
        <div className="form-card notify-card fade-in">
          
          {/* 2. AND ADD THIS BACK BUTTON HERE */}
          <button className="btn-back-top" onClick={() => setView('list')}>
            ← Back to Subjects
          </button>

          <div className="form-header">
            <h2>Broadcast Notice 📢</h2>
            <p className="subtitle">Send an email alert to students enrolled in <b>{selectedSubject?.name} ({selectedSubject?.code})</b></p>
          </div>
          
          <form onSubmit={handleNotifySubmit} className="grid-form">
            {/* ... (Keep your existing notify inputs here) ... */}
            <div className="input-group full-width">
              <label>Target Roll Numbers (Comma Separated)</label>
              <textarea 
                className="code-textarea"
                placeholder="e.g. 124101, 124102, 124115" 
                value={notifyData.rollNumbers}
                onChange={(e) => setNotifyData({...notifyData, rollNumbers: e.target.value})}
                required 
              />
            </div>

            <div className="input-group full-width">
              <label>Email Subject / Notice Title</label>
              <input 
                type="text" 
                placeholder="e.g. Important update regarding Mid-Sem dates" 
                value={notifyData.title}
                onChange={(e) => setNotifyData({...notifyData, title: e.target.value})}
                required 
              />
            </div>

            <div className="input-group full-width">
              <label>Message Content</label>
              <textarea 
                className="message-textarea"
                placeholder="Type your official announcement here..." 
                value={notifyData.message}
                onChange={(e) => setNotifyData({...notifyData, message: e.target.value})}
                required 
              />
            </div>

            <div className="form-actions full-width">
              <button type="button" className="btn-cancel" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn-notify-submit" disabled={isSending}>
                {isSending ? "Sending Emails..." : "Send Notice to Students"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubjectUpdates;