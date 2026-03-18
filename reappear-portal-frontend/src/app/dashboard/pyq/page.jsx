"use client"
import React, { useState, useEffect } from 'react';
import Folder from '@/components/Folder';
import api from '@/lib/api';
import './PYQ.css';

export default function PYQDirectory() {
  // 1. Backend ka Base URL define karein
  const BACKEND_URL = "http://localhost:5001"; 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPYQs = async () => {
      try {
        const query = `?semester=${selectedSem === 'All' ? '' : selectedSem}&branch=${selectedBranch}`;
        const response = await api.get(`/pyq${query}`);
        setPyqs(response.data);
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchPYQs();
  }, [selectedSem, selectedBranch]);

  // Helper function to handle opening PDF
  const openPDF = (pdfPath) => {
    if (!pdfPath || pdfPath === "#") return;
    // 2. Full URL banayein: Backend URL + PDF Path
    const fullUrl = `${BACKEND_URL}${pdfPath}`;
    window.open(fullUrl, '_blank');
  };

  const semesters = ['All', 1, 2, 3, 4, 5, 6, 7, 8];
  const branches = ['All', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE'];

  return (
    <div className="page-container" style={{ marginTop: '100px' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Previous Year Questions</h1>
        <p>Prioritized by your re-appear subjects.</p>
      </div>

      {/* ... (Controls same rahenge) */}
      <div className="controls-container">
        <input type="text" className="search-input" placeholder="Search subject..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-select" value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}>
          {semesters.map(sem => <option key={sem} value={sem}>{sem === 'All' ? 'All Semesters' : `Semester ${sem}`}</option>)}
        </select>
        <select className="filter-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
          {branches.map(b => <option key={b} value={b}>{b === 'All' ? 'All Branches' : b}</option>)}
        </select>
      </div>

      <div className="pyq-wrapper-box">
        {loading ? <p style={{textAlign: 'center'}}>Loading...</p> : (
          <div className="pyq-grid">
            {pyqs
              .filter(item => item.subject?.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(item => (
                // 3. openPDF function call karein
                <div key={item._id} className="pyq-folder-card" onClick={() => openPDF(item.pdfUrl)}>
                  <div className="pyq-folder-wrapper">
                    <Folder color="#ff2600" size={1} />
                  </div>
                  <h3 className="pyq-card-title">{item.subject?.subjectName || "Subject"}</h3>
                  <div className="pyq-card-tags">
                    <span className="pyq-tag">Sem {item.semester}</span>
                    <span className="pyq-tag">{item.year}</span>
                    <span className="pyq-tag">{item.branch}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}