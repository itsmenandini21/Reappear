"use client"
import React, { useState } from 'react';
import AnimatedList from '@/components/AnimatedList';
import './subjects.css';

export default function Subjects() {
  const [activeTab, setActiveTab] = useState('pending');

  // Realistic mock data. 
  // Notice we added a note about that LC 955 solution to your DSA record!
  const allSubjects = [
    { 
      id: 1, 
      name: 'Data Structures and Algorithms', 
      desc: 'Optimized solution provider for LC 955.',
      status: 'unfilled', // Red Border
      lastDate: '15 April 2026'
    },
    { 
      id: 2, 
      name: 'Computer Architecture', 
      desc: 'Core architecture concepts.',
      status: 'pending', // Yellow Border
      lastDate: null
    },
    { 
      id: 3, 
      name: 'Object Oriented Programming', 
      desc: 'Advanced OOP principles.',
      status: 'cleared', // Green Border
      lastDate: null
    },
    { 
      id: 4, 
      name: 'Analog Electronics', 
      desc: 'Basic circuits and systems.',
      status: 'cleared', // Green Border
      lastDate: null
    }
  ];

  const displayedSubjects = allSubjects.filter(sub => {
    if (activeTab === 'pending') {
      return sub.status === 'unfilled' || sub.status === 'pending';
    }
    return sub.status === 'cleared';
  });

  // We wrap your custom layout in a div so it passes cleanly into AnimatedList
  const listItems = displayedSubjects.map((sub) => (
    <div key={sub.id} className={`custom-subject-card border-${sub.status}`}>
      <div className="card-header-row">
        <div className="title-group">
          <h3>{sub.name}</h3>
          <span className="sub-desc">{sub.desc}</span>
        </div>
        
        {sub.status === 'unfilled' && (
          <div className="action-group">
            <button className="form-btn">Fill the form</button>
            <span className="date-text">Last date: {sub.lastDate}</span>
          </div>
        )}
      </div>
    </div>
  ));

  return (
    <div className="subjects-page">
      <h1 className="page-header-text">My Subjects</h1>
      
      {/* 1. The Pending / Cleared Toggle Buttons matching your sketch */}
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

      {/* 2. Passing the formatted items into your exact AnimatedList */}
      <div className="list-wrapper">
        <AnimatedList 
          items={listItems} 
          showGradients={true} 
          displayScrollbar={false} 
        />
      </div>
    </div>
  );
}