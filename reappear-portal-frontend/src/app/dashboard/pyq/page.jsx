"use client"
import React, { useState, useEffect } from 'react';
import Folder from '@/components/Folder';
import api from '@/lib/api';
import './PYQ.css';

export default function PYQDirectory() {
  // 1. Backend ka Base URL dynamically resolve karein
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') 
    : "http://localhost:5001";

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic MongoDB Mappings
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dynamicSemesters, setDynamicSemesters] = useState([]);

  useEffect(() => {
    api.get('/subjects/departments').then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const deptQuery = selectedDept !== 'All' ? `?department=${selectedDept}` : '';
    api.get(`/subjects/branches${deptQuery}`).then(res => setBranches(res.data)).catch(() => {});
  }, [selectedDept]);

  useEffect(() => {
    // If neither Department nor Branch is selected, universally display 1-8 Semesters
    if (selectedDept === 'All' && selectedBranch === 'All') {
       setDynamicSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
       return;
    }

    let queryArgs = [];
    if (selectedDept !== 'All') queryArgs.push(`department=${selectedDept}`);
    if (selectedBranch !== 'All') queryArgs.push(`branch=${selectedBranch}`);
    
    const queryString = `?${queryArgs.join('&')}`;
    api.get(`/subjects/semesters/distinct${queryString}`).then(res => setDynamicSemesters(res.data)).catch(() => {});
  }, [selectedDept, selectedBranch]);

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
    
    // Check if it's already an absolute Cloudinary URL!
    if (pdfPath.startsWith('http')) {
        window.open(pdfPath, '_blank');
        return;
    }

    // 2. Fallback for older legacy PYQs uploaded locally
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
        <select className="filter-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
          <option value="All">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="filter-select" value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}>
          <option value="All">All Semesters</option>
          {dynamicSemesters.map(sem => <option key={sem} value={sem}>{`Semester ${sem}`}</option>)}
        </select>
      </div>

      <div className="pyq-wrapper-box">
        {loading ? <p style={{textAlign: 'center'}}>Loading...</p> : pyqs.filter(item => item.subject?.subjectName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#ffffff', borderRadius: '15px', border: '2px dashed #e2e8f0', margin: '40px auto', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '50px', display: 'block', marginBottom: '15px' }}>📁</span>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>No PYQs Present</h3>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
              We couldn't find any past year question papers matching your specific filters or active reappear combinations. Try clicking "All" to broader your search.
            </p>
          </div>
        ) : (
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