"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Phone, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import './faculty.css';

export default function Faculty() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // State for backend data
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Node.js Backend
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await api.get('/faculty');
        setFacultyData(response.data);
      } catch (error) {
        console.error("Backend fetch failed, using fallback...", error);
        // Fallback data
        setFacultyData([
          { id: 1, name: 'Dr. Rajesh Kumar', gender: 'M', subject: 'Data Structures', dept: 'Information Technology', phone: '+91 98765 43210' },
          { id: 2, name: 'Prof. Sneha Sharma', gender: 'F', subject: 'Mathematics II', dept: 'Mathematics', phone: '+91 98765 43211' },
          { id: 3, name: 'Dr. Amit Verma', gender: 'M', subject: 'Discrete Maths', dept: 'Computer Science', phone: '+91 98765 43212' },
          { id: 4, name: 'Dr. Meera Gupta', gender: 'F', subject: 'Operating Systems', dept: 'Information Technology', phone: '+91 98765 43213' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  // Extract unique departments dynamically
  const departments = ['All', ...new Set(facultyData.map(f => f.dept))];

  const filteredFaculty = facultyData.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || faculty.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header-new">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title-new"
        >
          Faculty <span>Directory</span>
        </motion.h1>
        <p className="page-subtitle">Connect with your professors and subject experts</p>
      </div>

      <div className="controls-glass">
        <div className="search-box">
          <Search className="search-icon" size={20} color="#666" />
          <input
            type="text"
            placeholder="Search name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter className="filter-icon" size={20} color="#666" />
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="faculty-grid-new">
        {loading ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Loading faculty data...</p>
        ) : (
          <AnimatePresence>
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map((faculty, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={faculty.id}
                  className="faculty-card-new"
                >
                  <div className="avatar-section">
                    <div className="avatar-circle">
                      <span className="emoji-large">{faculty.gender === 'M' ? '👨‍🏫' : '👩‍🏫'}</span>
                    </div>
                    <div className="dept-tag">{faculty.dept}</div>
                  </div>

                  <div className="faculty-info">
                    <h3 className="name-heading">{faculty.name}</h3>
                    <div className="subject-line">
                      <BookOpen size={16} className="red-icon" />
                      <span>{faculty.subject}</span>
                    </div>
                  </div>

                  <div className="contact-details-box">
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{faculty.phone}</span>
                    </div>
                  </div>

                  <button
                    className="modern-contact-btn"
                    onClick={() => {
                      const profEmail = "professor@nitkkr.ac.in"; // Replace with actual faculty.email
                      const subject = encodeURIComponent(`Reappear Exam Query - ${faculty.name}`);
                      const body = encodeURIComponent(`Respected ${faculty.name},\n\nI am writing to you regarding my reappear examination for your subject...\n\nRoll No:\nBranch:`);

                      window.location.href = `mailto:${profEmail}?subject=${subject}&body=${body}`;
                    }}
                  >
                    Email Professor
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#666' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🔍</span>
                <p>No faculty members found. Try a different search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}