"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedList from '@/components/AnimatedList';
import api from '@/lib/api';
import './subjects.css';

export default function Subjects() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubjects = async () => {
      try {
        const response = await api.get('/reappear/my-reappears'); 
        setGroupedSubjects(response.data);
      } catch (error) {
        console.error("Fetch failed", error);
        // Fallback for UI testing
        setGroupedSubjects({
          1: [{ id: '1', name: 'Mathematics I', status: 'pending', code: 'MA101', desc: 'Calculus and Linear Algebra' }],
          3: [{ id: '2', name: 'Data Structures', status: 'cleared', code: 'CS301', desc: 'Binary Trees and Graphs' }]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMySubjects();
  }, []);

  const renderSemesterGroups = () => {
    const semesters = Object.keys(groupedSubjects).sort((a, b) => a - b);
    
    return semesters.map(sem => {
      const filteredInSem = groupedSubjects[sem].filter(sub => {
        if (activeTab === 'pending') return sub.status === 'pending' || sub.status === 'unfilled' || sub.status === 'in-progress';
        return sub.status === 'cleared';
      });

      if (filteredInSem.length === 0) return null;

      const listItems = filteredInSem.map((sub) => (
        <div key={sub.id} className={`custom-subject-card border-${sub.status}`}>
          <div className="card-header-row">
            <div className="title-group">
              <span className="sub-code">{sub.code}</span>
              <h3>{sub.name}</h3>
              <span className="sub-desc">{sub.desc || 'No description available'}</span>
            </div>

            <div className="action-group">
              {sub.status !== 'cleared' ? (
                <>
                  <button
                    className="form-btn"
                    onClick={() => {
                      const query = new URLSearchParams({ subject: sub.name, code: sub.code }).toString();
                      router.push(`/dashboard/apply?${query}`);
                    }}
                  >
                    Apply Now
                  </button>
                  {sub.lastDate && <span className="date-text">Last date: {sub.lastDate}</span>}
                </>
              ) : (
                <span className="status-badge-cleared">Verified ✓</span>
              )}
            </div>
          </div>
        </div>
      ));

      return (
        <div key={sem} className="semester-section">
          <div className="semester-header">
            <h2 className="semester-title">Semester {sem}</h2>
            <div className="semester-line"></div>
          </div>
          <AnimatedList
            items={listItems}
            showGradients={false}
            displayScrollbar={false}
          />
        </div>
      );
    });
  };

  return (
    <div className="subjects-page">
      <div className="header-wrapper">
        <h1 className="page-header-text">My Academic Records</h1>
        <p className="page-subtext">View and manage your reappear examinations</p>
      </div>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Active Reappears
        </button>
        <button
          className={`tab-button ${activeTab === 'cleared' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('cleared')}
        >
          Cleared / History
        </button>
      </div>

      <div className="list-wrapper">
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Fetching your records...</p>
          </div>
        ) : (
          <div className="semester-flow">
            {renderSemesterGroups()}
            {Object.keys(groupedSubjects).length === 0 && (
              <div className="empty-state">
                <p>No records found for this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}