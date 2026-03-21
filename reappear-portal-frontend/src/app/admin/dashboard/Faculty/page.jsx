"use client";
import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit3, FiTrash2, FiUsers, FiMail, FiPhone, FiAlertTriangle, FiX } from 'react-icons/fi';
import './faculty.css';
import AddFaculty from './AddFaculty.jsx';
import UpdateFaculty from './UpdateFaculty.jsx';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const FacultyDashboard = () => {
  const [view, setView] = useState('list');
  const [facultyList, setFacultyList] = useState([]); 
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await api.get("/faculty"); 
      setFacultyList(response.data);
    } catch (error) {
      console.error("Error fetching faculty:", error.message);
      toast.error("Failed to load faculty directory");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Modal
  const openDeleteModal = (faculty) => {
    setFacultyToDelete(faculty);
    setShowConfirmModal(true);
  };

  // Final Delete Action
  const confirmDelete = async () => {
    if (!facultyToDelete) return;

    const id = facultyToDelete._id;
    const loadingToast = toast.loading(`Removing ${facultyToDelete.name}...`);
    
    // UI se turant hatane ke liye (Optimistic Update)
    const originalList = [...facultyList];
    setFacultyList(prev => prev.filter(f => f._id !== id));
    setShowConfirmModal(false);

    try {
      await api.delete(`/faculty/delete/${id}`);
      toast.success("Faculty removed successfully", { id: loadingToast });
    } catch (error) {
      // Agar error aaye toh wapas list mein add kar do
      setFacultyList(originalList);
      console.error("Delete error:", error);
      toast.error("Failed to delete faculty", { id: loadingToast });
    } finally {
      setFacultyToDelete(null);
    }
  };

  if (view === 'add') return <AddFaculty onBack={() => { setView('list'); fetchFaculty(); }} />;
  if (view === 'update') return <UpdateFaculty facultyData={selectedFaculty} onBack={() => { setView('list'); fetchFaculty(); }} />;

  return (
    <div className={`admin-portal-container fade-in ${showConfirmModal ? 'body-blur' : ''}`}>
      <Toaster />
      <div className="portal-header-wrapper">
        <div className="header-info">
          <h1>Faculty Management</h1>
          <p>Global Directory: View and audit academic personnel records.</p>
        </div>
        <button className="primary-action-btn" onClick={() => setView('add')}>
          <FiPlus /> <span>Register New Faculty</span>
        </button>
      </div>

      <div className="table-controls-row">
        <div className="search-container-modern">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, department or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="data-card">
        {loading ? (
          <div className="loading-state">Loading directory...</div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Department</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList?.filter(f => 
                    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    f.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((f) => (
                  <tr key={f._id} className="table-row">
                    <td>
                      <div className="name-stack">
                        <span className="full-name">{f.name}</span>
                        <span className="role-text">Faculty Member</span>
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag">{f.department}</span>
                    </td>
                    <td className="text-right">
                      <div className="action-btns-group">
                        <button 
                          className="btn-action-edit" 
                          onClick={() => { setSelectedFaculty(f); setView('update'); }}
                        >
                          <FiEdit3 /> Update
                        </button>
                        <button 
                          className="btn-action-delete" 
                          onClick={() => openDeleteModal(f)}
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {!loading && facultyList?.length === 0 && (
            <div className="no-data-msg">No faculty records found.</div>
        )}
      </div>

      {/* --- BEAUTIFUL DELETE CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="modal-overlay-fixed">
          <div className="confirm-box-central scale-up">
            <div className="modal-close-icon" onClick={() => setShowConfirmModal(false)}>
                <FiX />
            </div>
            <div className="warning-icon-circle">
                <FiAlertTriangle size={32} color="#e11d48" />
            </div>
            <h3>Remove Faculty?</h3>
            <p>Are you sure you want to remove <strong>{facultyToDelete?.name}</strong>? This action cannot be undone.</p>
            
            <div className="confirm-btns-group">
              <button className="btn-no-cancel" onClick={() => setShowConfirmModal(false)}>
                No, Keep it
              </button>
              <button className="btn-yes-remove" onClick={confirmDelete}>
                Yes, Remove Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;