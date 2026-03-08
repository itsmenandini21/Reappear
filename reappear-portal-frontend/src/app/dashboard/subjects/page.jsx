"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 1. ADD THIS IMPORT
import AnimatedList from '@/components/AnimatedList';
import api from '@/lib/api';
import './subjects.css';

export default function Subjects() {
  const router = useRouter(); // 2. INITIALIZE THE ROUTER HERE
  const [activeTab, setActiveTab] = useState('pending');

  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubjects = async () => {
      try {
        const response = await api.get('/subjects');
        setAllSubjects(response.data);
      } catch (error) {
        console.error("Backend fetch failed, using fallback data...", error);

        setAllSubjects([
          {
            id: 1,
            name: 'Data Structures and Algorithms',
            desc: 'Optimized solution provider for LC 955.',
            status: 'unfilled',
            lastDate: '15 April 2026'
          },
          {
            id: 2,
            name: 'Computer Architecture',
            desc: 'Core architecture concepts.',
            status: 'pending',
            lastDate: null
          },
          {
            id: 3,
            name: 'Object Oriented Programming',
            desc: 'Advanced OOP principles.',
            status: 'cleared',
            lastDate: null
          },
          {
            id: 4,
            name: 'Analog Electronics',
            desc: 'Basic circuits and systems.',
            status: 'cleared',
            lastDate: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubjects();
  }, []);

  const displayedSubjects = allSubjects.filter(sub => {
    if (activeTab === 'pending') {
      return sub.status === 'unfilled' || sub.status === 'pending';
    }
    return sub.status === 'cleared';
  });

  const listItems = displayedSubjects.map((sub) => (
    <div key={sub.id} className={`custom-subject-card border-${sub.status}`}>
      <div className="card-header-row">
        <div className="title-group">
          <h3>{sub.name}</h3>
          <span className="sub-desc">{sub.desc}</span>
        </div>

        {sub.status === 'unfilled' && (
          <div className="action-group">
            {/* Replace your existing button with this: */}
            <button
              className="theme-btn form-btn"
              onClick={() => {
                // This encodes the subject name safely for the URL!
                const query = new URLSearchParams({ subject: sub.name }).toString();
                router.push(`/dashboard/apply?${query}`);
              }}
            >
              Fill Form
            </button>
            <span className="date-text">Last date: {sub.lastDate}</span>
          </div>
        )}
      </div>
    </div>
  ));

  return (
    <div className="subjects-page">
      <h1 className="page-header-text">My Subjects</h1>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`tab-button ${activeTab === 'cleared' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('cleared')}
        >
          Cleared
        </button>
      </div>

      <div className="list-wrapper">
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading subjects...</p>
        ) : (
          <AnimatedList
            items={listItems}
            showGradients={true}
            displayScrollbar={false}
          />
        )}
      </div>
    </div>
  );
}