"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedList from '@/components/AnimatedList';
import api from '@/lib/api';
import './subjects.css';

export default function Subjects() {
  const router = useRouter();
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
        return sub.status === 'pending' || sub.status === 'unfilled' || sub.status === 'in-progress' || sub.status === 'failed';
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  {sub.hasApplied ? (
                    <div className="status-badge-applied" style={{ background: '#34c759', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}>
                      Applied
                    </div>
                  ) : sub.hasActiveNotice ? (
                    <>
                      <button
                        className="form-btn"
                        onClick={() => {
                          const query = new URLSearchParams({ 
                            subjectName: sub.name, 
                            subjectId: sub.subjectObjectId,
                            recordId: sub.id
                          }).toString();
                          router.push(`/dashboard/apply?${query}`);
                        }}
                      >
                        Apply Now
                      </button>
                      {sub.noticeDeadline && <span className="date-text" style={{ fontSize: '12px', color: '#ff2600', fontWeight: 'bold' }}>Last date: {sub.noticeDeadline}</span>}
                    </>
                  ) : (
                    <span className="not-active-text" style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                      Form Closed
                    </span>
                  )}
                </div>
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