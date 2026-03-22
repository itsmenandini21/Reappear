"use client";
import React, { useState } from 'react';
import './Footer.css';
import Link from 'next/link';
import api from '@/lib/api';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/applications/report-issue', { issue: issueText });
      alert("Success! Your issue has been reported directly to the Admin.");
      setIsModalOpen(false);
      setIssueText('');
    } catch (error) {
      alert("Error reporting issue: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="portal-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>NIT KKR Reappear Hub</h3>
          <p>Streamlining academic reappearances and backlog management for students.</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/subjects">My Subjects</Link>
            <Link href="/dashboard/peers">Find Peers</Link>
            <Link href="/dashboard/pyq">PYQ Library</Link>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <Link href="/help">FAQs</Link>
            <Link href="/contacts">Contact Exam Cell</Link>
            <button onClick={() => setIsModalOpen(true)} className="footer-link-btn">Report an Issue</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright © {new Date().getFullYear()} NIT Kurukshetra. All Rights Reserved.</p>
      </div>

      {isModalOpen && (
        <div className="issue-modal-overlay">
          <div className="issue-modal">
            <h3>🚨 Report an Issue</h3>
            <p>Describe the problem you are facing. Your registered email and details will be automatically attached.</p>
            <form onSubmit={handleSubmitIssue}>
              <textarea 
                value={issueText} 
                onChange={(e) => setIssueText(e.target.value)} 
                placeholder="Type your issue here in detail..." 
                required 
                rows="5"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                <button type="submit" disabled={loading} className="submit-btn">{loading ? 'Sending...' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
