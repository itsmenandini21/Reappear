"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import './Apply.css';

export default function ApplyForm() {
  const router = useRouter();
  
  // 1. Grab the subject from the URL!
  const searchParams = useSearchParams();
  const prefilledSubject = searchParams.get('subject') || 'Unknown Subject';
  
  const [formData, setFormData] = useState({
    studentName: 'Harsh Indoria', 
    rollNo: '124101',
    branch: 'Information Technology',
    semester: '4',
    subjectName: prefilledSubject, // Automatically slot it in here
    transactionId: '',
    feeAmount: 1000 
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/applications/apply', formData);
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Something went wrong. Make sure your backend is running!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="apply-wrapper">
        <div className="form-card success-box">
          <div className="success-icon">✅</div>
          <h2>Application Submitted!</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Your reappear form for <strong>{formData.subjectName}</strong> has been sent to the Exam Cell.</p>
          <button className="submit-btn" onClick={() => router.push('/dashboard/subjects')}>
            Return to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-wrapper">
      <div className="apply-header">
        <h1 className="apply-title">Reappear Application Form</h1>
        <p>Submit your exam details and fee receipt for HOD approval.</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          
          <h3 className="form-section-title">Student Details</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" className="form-input" value={formData.studentName} disabled />
            </div>
            <div className="input-group">
              <label>Roll Number</label>
              <input type="text" className="form-input" value={formData.rollNo} disabled />
            </div>
            <div className="input-group">
              <label>Branch</label>
              <input type="text" className="form-input" value={formData.branch} disabled />
            </div>
            <div className="input-group">
              <label>Current Semester</label>
              <input type="text" className="form-input" value={formData.semester} disabled />
            </div>
          </div>

          <h3 className="form-section-title">Subject Details</h3>
          <div className="form-grid">
            {/* 2. Replaced the Dropdown with a Locked Text Box! */}
            <div className="input-group full-width">
              <label>Reappear Subject</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.subjectName} 
                disabled 
              />
            </div>
          </div>

          <h3 className="form-section-title">Fee Payment</h3>
          <div className="fee-info-box">
            <span className="fee-text">Total Reappear Fee</span>
            <span className="fee-amount">₹{formData.feeAmount}</span>
          </div>
          
          <div className="form-grid">
            <div className="input-group full-width">
              <label>SBI Collect Transaction ID (Starting with DU)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., DU123456789" 
                required
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
              />
            </div>
            <div className="input-group full-width">
              <label>Upload Fee Receipt (PDF/JPG)</label>
              <input type="file" className="form-input" accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting to Database...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}