"use client";
import React from 'react';
// 1. CHANGE: useNavigate ki jagah useRouter use hoga
import { useRouter } from 'next/navigation'; 
import Navbar from '@/components/Navbar';
// 2. CHANGE: Yahan tune Folder import kiya hai but niche <Folder /> use kiya, 
// Ensure kar ki component ka naam capital ho (Folder)
import Folder from '@/components/Folder'; 
import AnimatedList from '@/components/AnimatedList';
import './dashboard.css';

const dashboardData = [
  { id: 'subjects', title: 'My Subjects', desc: 'Check cleared & reappear subjects.', path: '/dashboard/subjects' },
  { id: 'dates', title: 'Exam Dates', desc: 'Upcoming reappear schedules.', path: '/dashboard/dates' },
  { id: 'faculty', title: 'Faculty Info', desc: 'Reach out to subject teachers.', path: '/dashboard/faculty' },
  { id: 'peers', title: 'Connect Peers', desc: 'Find students taking the same exam.', path: '/dashboard/peers' },
  { id: 'pyq', title: 'PYQs', desc: 'Download previous year question papers.', path: '/dashboard/pyq' }
];

export default function Dashboard() {
  const folderColor = "#ff2600"; 
  // 3. CHANGE: Router initialize karo
  const router = useRouter();

  const announcements = [
    "URGENT: Reappear form submission deadline extended to 15th April.",
    "B.Tech 2nd Year IT practical schedules updated.",
    "Guest Lecture: Advanced Data Structures & Algorithms this Friday.",
    "Summer 2026 Government Internship portal is now live.",
    "Hostel Data Collection Project: Final report submission next week.",
    "Campus Hackathon: Web Development track registrations open.",
    "Operating Systems (IT205) lab syllabus has been revised.",
    "Exhibition: Hand gesture-controlled bots in the robotics lab at 4 PM.",
    "LeetCode Weekly Contest - NIT Kurukshetra leaderboard updated.",
    "New PDF study materials uploaded for Computer Networks."
  ];

  return (
    <div className="dashboard-container">
      <Navbar />
      
      {/* The Big Announcement Div */}
      <div className="announcement-section">
        <h2 className="announcement-title">Latest Announcements</h2>
        <AnimatedList 
          items={announcements} 
          showGradients={true}
          displayScrollbar={true}
        />
      </div>

      {/* Folder Grid */}
      <div className="dashboard-grid">
        {dashboardData.map((item) => (
          <div 
            key={item.id} 
            className="folder-card" 
            // 4. CHANGE: navigate() ki jagah router.push()
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