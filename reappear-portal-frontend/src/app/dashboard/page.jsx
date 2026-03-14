"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Navbar from '@/components/Navbar';
import Folder from '@/components/Folder'; 
import AnimatedList from '@/components/AnimatedList';
import api from '@/lib/api';
import './dashboard.css';

const dashboardData = [
  { id: 'subjects', title: 'My Subjects', desc: 'Check cleared & reappear subjects.', path: '/dashboard/subjects' },
  { id: 'dates', title: 'Exam Dates', desc: 'Upcoming reappear schedules.', path: '/dashboard/exams' },
  { id: 'faculty', title: 'Faculty Info', desc: 'Reach out to subject teachers.', path: '/dashboard/faculty' },
  { id: 'peers', title: 'Connect Peers', desc: 'Find students taking the same exam.', path: '/dashboard/peers' },
  { id: 'pyq', title: 'PYQs', desc: 'Download previous year question papers.', path: '/dashboard/pyq' }
];

export default function Dashboard() {
  const folderColor = "#ff2600"; 
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await api.get('/announcements');
        // MODIFICATION: Title aur Category ke saath Content bhi merge kar diya hai
        const formattedNotices = response.data.map(n => 
          `${n.category.toUpperCase()}: ${n.title} - ${n.content}`
        );
        setAnnouncements(formattedNotices);
      } catch (error) {
        console.error("Error fetching announcements", error);
        setAnnouncements(["Could not load latest announcements."]);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="announcement-section">
        <h2 className="announcement-title">Latest Announcements</h2>
        <AnimatedList 
          items={announcements.length > 0 ? announcements : ["Loading announcements..."]} 
          showGradients={true}
          displayScrollbar={true}
        />
      </div>

      <div className="dashboard-grid">
        {dashboardData.map((item) => (
          <div 
            key={item.id} 
            className="folder-card" 
            onClick={() => router.push(item.path || '/dashboard')}
          >
            <div className="folder-wrapper">
              <Folder color={folderColor} size={2.8} />
            </div>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}