"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './subjects.css';
import api from '@/lib/api'; 

const SubjectUpdates = () => {
  const [view, setView] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // New for Add/Update
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState(null); // Temporary store form data

  const [notifyData, setNotifyData] = useState({ rollNumbers: '', title: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      toast.error("Database connection failed!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Remove Functionality
  const confirmDelete = async () => {
    try {
      await api.delete(`/subjects/delete/${subjectToDelete._id}`);
      setSubjects(subjects.filter(s => s._id !== subjectToDelete._id));
      setShowDeleteModal(false);
      toast.success("Subject Removed!");
    } catch (err) {
      toast.error("Delete failed!");
    }
  };

  // Trigger Confirmation Popup
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subjectData = {
      subjectCode: formData.get("code"),
      subjectName: formData.get("name"),
      department: formData.get("dept"),
      semester: Number(formData.get("semester")),
      credits: Number(formData.get("credits"))
    };
    setPendingData(subjectData);
    setShowConfirmModal(true);
  };

  // Actual API Call after "Yes"
  const executeSubmit = async () => {
    try {
      if (view === 'add') {
        const res = await api.post('/subjects/add', pendingData);
        setSubjects([...subjects, res.data]);
        toast.success("Subject Added!");
      } else {
        await api.put(`/subjects/update/${selectedSubject._id}`, pendingData);
        toast.success("Subject Updated!");
        fetchSubjects();
      }
      setShowConfirmModal(false);
      setView('list');
    } catch (err) {
      toast.error(err.response?.data?.message || "Process failed!");
      setShowConfirmModal(false);
    }
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      toast.success(`Notices sent!`, { icon: '📢' });
      setIsSending(false);
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
            <p>Are you sure you want to delete <b>{subjectToDelete?.subjectName}</b>?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/UPDATE CONFIRMATION MODAL (Industry Standard) --- */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-card bounce-in">
            <div className="modal-icon-info">📝</div>
            <h2>{view === 'add' ? "Add Subject?" : "Save Changes?"}</h2>
            <p>Do you want to {view === 'add' ? "add this new subject to" : "update the details in"} the repository?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>No, Back</button>
              <button className="btn-primary" onClick={executeSubmit}>Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Subject Repository</h1>
          <p className="page-subtitle">Manage curriculum and broadcast notices.</p>
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
                placeholder="Search..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            {loading ? <p style={{padding: '20px'}}>Loading...</p> : (
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
                  .filter(s => 
                    s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <div className="subject-info">
                          <span className="sub-code">{sub.subjectCode}</span>
                          <span className="sub-name">{sub.subjectName}</span>
                        </div>
                      </td>
                      <td><span className="pill pill-dept">{sub.department}</span></td>
                      <td><span className="text-muted">{sub.credits} Credits</span></td>
                      <td><span className="pill pill-sem">{sub.semester} Sem</span></td>
                      <td className="action-cell">
                        <button className="action-btn btn-notify" onClick={() => { setSelectedSubject(sub); setView('notify'); }}>📢 Notify</button>
                        <button className="action-btn btn-edit" onClick={() => { setSelectedSubject(sub); setView('update'); }}>Edit</button>
                        <button className="action-btn btn-delete" onClick={() => { setSubjectToDelete(sub); setShowDeleteModal(true); }}>Remove</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      )}

      {/* --- ADD / UPDATE FORM --- */}
      {(view === 'add' || view === 'update') && (
        <div className="form-card fade-in">
          <button className="btn-back-top" onClick={() => setView('list')}>← Back</button>
          <div className="form-header">
            <h2>{view === 'add' ? "Add New Subject" : "Edit Subject Details"}</h2>
          </div>
          <form onSubmit={handleFormSubmit} className="grid-form">
            <div className="input-group">
              <label>Subject Code</label>
              <input name="code" type="text" defaultValue={selectedSubject?.subjectCode} placeholder="Code" required />
            </div>
            <div className="input-group">
              <label>Subject Name</label>
              <input name="name" type="text" defaultValue={selectedSubject?.subjectName} placeholder="Name" required />
            </div>
            <div className="input-group">
              <label>Department</label>
              <select name="dept" defaultValue={selectedSubject?.department || "CSE"}>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Semester</label>
              <select name="semester" defaultValue={selectedSubject?.semester || 1}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}{num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} Semester</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Credits</label>
              <input name="credits" type="number" defaultValue={selectedSubject?.credits} placeholder="Credits" required />
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn-cancel" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn-primary">{view === 'add' ? "Save" : "Update"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubjectUpdates;