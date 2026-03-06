"use client"
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import '../PYQ.css'; 

export default function SubjectPYQPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const subjectId = resolvedParams.subjectId;

  const [subjectData, setSubjectData] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await api.get(`/pyq/${subjectId}`);
        setSubjectData(response.data);
      } catch (error) {
        console.error("Backend fetch failed, using fallback database...", error);
        
        // NEW: Added 'fileUrl' to every paper pointing to our public folder!
        const fallbackDB = [
          {
            id: 'os-it-2',
            subjectName: 'Operating Systems',
            branch: 'Information Technology',
            yearOfStudy: '2nd Year',
            semester: '4',
            papers: [
              { id: 'p1', examType: 'Mid Sem 1', examYear: '2023', professor: 'Prof. A. Sharma', fileUrl: '/papers/sample.pdf' },
              { id: 'p2', examType: 'Mid Sem 2', examYear: '2023', professor: 'Dr. S. Gupta', fileUrl: '/papers/sample.pdf' },
              { id: 'p3', examType: 'End Sem', examYear: '2022', professor: 'Prof. A. Sharma', fileUrl: '/papers/sample.pdf' }
            ]
          },
          {
            id: 'dsa-it-2',
            subjectName: 'Data Structures and Algorithms',
            branch: 'Information Technology',
            yearOfStudy: '2nd Year',
            semester: '3',
            papers: [
              { id: 'p4', examType: 'Mid Sem 1', examYear: '2023', professor: 'Prof. V. Kumar', fileUrl: '/papers/sample.pdf' },
              { id: 'p5', examType: 'End Sem', examYear: '2022', professor: 'Dr. M. Singh', fileUrl: '/papers/sample.pdf' }
            ]
          },
          {
            id: 'math2-ece-1',
            subjectName: 'Mathematics II',
            branch: 'Electronics',
            yearOfStudy: '1st Year',
            semester: '2',
            papers: [
              { id: 'p6', examType: 'End Sem', examYear: '2021', professor: 'Dr. R. K. Sharma', fileUrl: '/papers/sample.pdf' }
            ]
          }
        ];

        const found = fallbackDB.find(s => s.id === subjectId);
        setSubjectData(found || null);

      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  if (loading) return <div style={{ marginTop: '150px', textAlign: 'center' }}>Loading papers...</div>;
  
  if (!subjectData) return (
    <div style={{ marginTop: '150px', textAlign: 'center' }}>
      <h2>Subject not found.</h2>
      <button className="back-pill-btn" onClick={() => router.push('/dashboard/pyq')} style={{ marginTop: '15px' }}>
        ← Go Back
      </button>
    </div>
  );

  const examTypes = ['All', ...new Set(subjectData.papers.map(p => p.examType))];

  const filteredPapers = activeTab === 'All' 
    ? subjectData.papers 
    : subjectData.papers.filter(p => p.examType === activeTab);

  return (
    <div className="page-container" style={{ marginTop: '100px', maxWidth: '900px', margin: '100px auto 0' }}>
      
      <button className="back-pill-btn" onClick={() => router.push('/dashboard/pyq')}>
        ← Back to Directory
      </button>

      <div className="subject-header-container">
        <h1 className="subject-main-title">{subjectData.subjectName}</h1>
        <p className="subject-meta-text">{subjectData.yearOfStudy} • {subjectData.branch} • Sem {subjectData.semester}</p>
      </div>

      <div className="exam-tab-wrapper">
        {examTypes.map(type => (
          <button 
            key={type}
            onClick={() => setActiveTab(type)} 
            className={`exam-tab-btn ${activeTab === type ? 'active' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="pyq-wrapper-box" style={{ padding: '20px' }}>
        <div className="papers-list" style={{ marginTop: '0' }}>
          {filteredPapers.length > 0 ? (
            filteredPapers.map(paper => (
              <div key={paper.id} className="paper-row">
                <div className="paper-info">
                  <span className="paper-icon">📄</span>
                  <div>
                    <h3 className="paper-title">{paper.examType}</h3>
                    <div className="paper-meta">
                      <span className="meta-item">📅 Year: <strong>{paper.examYear}</strong></span>
                      <span className="meta-item">👨‍🏫 By: <strong>{paper.professor}</strong></span>
                    </div>
                  </div>
                </div>
                
                {/* NEW: Changed from <button> to an <a> tag targeting _blank */}
                <a 
                  href={paper.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="download-pdf-btn"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  View Paper
                </a>

              </div>
            ))
          ) : (
            <div className="no-results" style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
              <p>No papers found for this selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}