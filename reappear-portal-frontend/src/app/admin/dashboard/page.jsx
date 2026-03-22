"use client";
import { useState } from 'react';
import './dashboard.css';
import BacklogForm from './AddBacklogs/page.jsx';
import NoticeForm from './Updates/page.jsx';
import SubjectUpdates from './Subjects/page.jsx';
import FacultyManagement from './Faculty/page.jsx';
import  ScheduleExams  from './Exams/page.jsx';
import  UploadResults  from './Results/page.jsx';
import UploadPyqForm from './PYQs/page.jsx';
import AdminOverview from './Overview/page.jsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: '🏠' },
    { id: 'backlogs', label: 'Manage Backlogs', icon: '📝' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'exams', label: 'Exams', icon: '📅' },        // <-- ADDED THIS
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'notices', label: 'Post Notices', icon: '📢' },
    { id:'faculty',label:'Faculty',icon:'👨‍🏫'},
    {id:'pyqs',label:'Upload PYQs',icon:"📤"}
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
        <section className="admin-content-box">
          {activeTab === 'dashboard' && <AdminOverview />}
          {activeTab === 'backlogs' && <BacklogForm />}
          {activeTab === 'notices' && <NoticeForm />}
          {activeTab === 'subjects' && <SubjectUpdates />}
          {activeTab === 'faculty' && <FacultyManagement />}
          {activeTab === 'exams' && <ScheduleExams />}
          {activeTab === 'results' && <UploadResults />}
          {activeTab === 'pyqs' && <UploadPyqForm />}
        </section>
      </main>
    </div>
  );
}