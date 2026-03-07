"use client";
import { useState } from 'react';
import './dashboard.css';
import BacklogForm from './AddBacklogs/page.jsx';
import NoticeForm from './Updates/page.jsx';
import FeeTracker from './FeeTracker/page.jsx';
import SubjectUpdates from './Subjects/page.jsx';
import FacultyManagement from './Faculty/page.jsx';


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: '🏠' },
    { id: 'backlogs', label: 'Manage Backlogs', icon: '📝' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'notices', label: 'Post Notices', icon: '📢' },
    { id: 'fees', label: 'Fee Tracker', icon: '💰' },
    { id:'faculty',label:'Faculty',icon:'👨‍🏫'}
  ];

  return (
    <div className="admin-wrapper">
      {/* 1. STYLISH SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          NIT<span>KKR</span>
          <p>Admin Suite</p>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="status-badge">System Live 🟢</div>
          <div className="admin-info">Welcome, Registrar</div>
        </header>

        <section className="admin-content-box">
          {activeTab === 'dashboard' && (
            <div className="stats-grid fade-in">
              <div className="mini-card"><h3>1,240</h3><p>Total Students</p></div>
              <div className="mini-card"><h3>45</h3><p>Pending Reappears</p></div>
              <div className="mini-card"><h3>12</h3><p>New Notices</p></div>
            </div>
          )}
          {activeTab === 'backlogs' && <BacklogForm />}
          {activeTab === 'notices' && <NoticeForm />}
          {activeTab === 'fees' && <FeeTracker />}
          {activeTab === 'subjects' && <SubjectUpdates />}
          {activeTab === 'faculty' && <FacultyManagement />}
        </section>
      </main>
    </div>
  );
}