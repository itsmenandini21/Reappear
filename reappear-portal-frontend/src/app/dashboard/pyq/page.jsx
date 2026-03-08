"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Folder from '@/components/Folder';
import api from '@/lib/api';
import './PYQ.css';

export default function PYQDirectory() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const folderColor = "#ff2600";

  useEffect(() => {
    const fetchPYQs = async () => {
      try {
        const response = await api.get('/pyq');
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch PYQs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPYQs();
  }, []);

  const years = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
  const branches = ['All', ...new Set(subjects.map(s => s.branch))];

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All' || sub.yearOfStudy === selectedYear;
    const matchesBranch = selectedBranch === 'All' || sub.branch === selectedBranch;
    return matchesSearch && matchesYear && matchesBranch;
  });

  return (
    <div className="page-container" style={{ marginTop: '100px' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Previous Year Questions</h1>
        <p>Select a subject folder to view past exam papers.</p>
      </div>

      <div className="controls-container">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search subject..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map((year, i) => <option key={i} value={year}>{year === 'All' ? 'All Years' : year}</option>)}
        </select>
        <select className="filter-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
          {branches.map((branch, i) => <option key={i} value={branch}>{branch === 'All' ? 'All Branches' : branch}</option>)}
        </select>
      </div>

      <div className="pyq-wrapper-box">
        {loading ? <p style={{textAlign: 'center'}}>Loading folders...</p> : (
          <div className="pyq-grid">
            {filteredSubjects.map(sub => (
              <div 
                key={sub.id} 
                className="pyq-folder-card"
                onClick={() => router.push(`/dashboard/pyq/${sub.id}`)}
              >
                <div className="pyq-folder-wrapper">
                  <Folder color={folderColor} size={1} />
                </div>
                <h3 className="pyq-card-title">{sub.subjectName}</h3>
                <div className="pyq-card-tags">
                  <span className="pyq-tag">{sub.yearOfStudy}</span>
                  <span className="pyq-tag">{sub.branch}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}