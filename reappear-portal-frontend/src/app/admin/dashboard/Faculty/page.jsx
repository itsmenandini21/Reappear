"use client";
import React, { useState } from 'react';
import { FiPlus, FiSearch, FiEdit3, FiTrash2, FiUsers } from 'react-icons/fi';
import './faculty.css';
import AddFaculty from './AddFaculty.jsx';
import UpdateFaculty from './UpdateFaculty.jsx';

const FacultyDashboard = () => {
  const [view, setView] = useState('list'); 
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const facultyData = [
    { id: "NITK-2024-01", name: "Dr. Aman Srivastava", dept: "Computer Science", role: "Sr. Professor" },
    { id: "NITK-2024-05", name: "Prof. Sunita Verma", dept: "Information Technology", role: "Associate Professor" }
  ];

  if (view === 'add') return <AddFaculty onBack={() => setView('list')} />;
  if (view === 'update') return <UpdateFaculty facultyData={selectedFaculty} onBack={() => setView('list')} />;

  return (
    <div className="admin-portal-container fade-in">
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
            placeholder="Search by faculty name or ID..." 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="data-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th><FiUsers /> Faculty ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyData
              .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.id.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((f) => (
              <tr key={f.id} className="table-row">
                <td className="id-cell">
                  <span className="id-badge">{f.id}</span>
                </td>
                <td>
                  <div className="name-stack">
                    <span className="full-name">{f.name}</span>
                    <span className="role-text">{f.role}</span>
                  </div>
                </td>
                <td><span className="dept-tag">{f.dept}</span></td>
                <td className="text-right">
                  <div className="action-btns-group">
                    <button className="btn-action-edit" onClick={() => {setSelectedFaculty(f); setView('update')}}>
                      <FiEdit3 /> Update
                    </button>
                    <button className="btn-action-delete">
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyDashboard;