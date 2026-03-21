"use client"
import React, { useState, useEffect } from 'react';
import Folder from '@/components/Folder';
import api from '@/lib/api';
import './PYQ.css';

export default function PYQDirectory() {
  // 1. Backend ka Base URL define karein
  const BACKEND_URL = "http://localhost:5001"; 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic MongoDB Mappings
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.get('/subjects/departments').then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDept !== 'All') {
      api.get(`/subjects/branches?department=${selectedDept}`)
         .then(res => setBranches(res.data)).catch(() => {});
    } else {
      setBranches([]);
      setSelectedBranch('All');
    }
  }, [selectedDept]);

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

  return (
    <div className="page-container" style={{ marginTop: '100px' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Previous Year Questions</h1>
        <p>Prioritized by your re-appear subjects.</p>
      </div>

      <div className="controls-container">
        <input type="text" className="search-input" placeholder="Search subject..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} disabled={selectedDept === 'All'}>
          <option value="All">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="filter-select" value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}>
          <option value="All">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(sem => <option key={sem} value={sem}>{`Semester ${sem}`}</option>)}
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