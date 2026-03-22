"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import './overview.css';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingReappears: 0,
    totalNotices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/overview-stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="overview-loading">
        <div className="spinner"></div>
        <p>Loading real-time system analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-overview-container fade-in">
      <div className="overview-header">
        <h2>System Analytics</h2>
        <p>Live metrics tracking the active state of the Reappear Portal database.</p>
      </div>
      
      <div className="stats-grid-dynamic">
        <div className="metric-card student-card">
          <div className="metric-icon">👥</div>
          <div className="metric-data">
            <h3>{stats.totalStudents}</h3>
            <p>Registered Students</p>
          </div>
        </div>

        <div className="metric-card app-card">
          <div className="metric-icon">📑</div>
          <div className="metric-data">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="metric-card pending-card">
          <div className="metric-icon">⏳</div>
          <div className="metric-data">
            <h3>{stats.pendingReappears}</h3>
            <p>Uncleared Reappears</p>
          </div>
        </div>

        <div className="metric-card notice-card">
          <div className="metric-icon">📢</div>
          <div className="metric-data">
            <h3>{stats.totalNotices}</h3>
            <p>Tracked Notices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
