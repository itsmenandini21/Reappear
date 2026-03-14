"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import './Apply.css';

// Next.js requirement: useSearchParams must be wrapped in Suspense
export default function ApplyForm() {
  return (
    <Suspense fallback={<div className="apply-wrapper"><h1>Loading Form...</h1></div>}>
      <ApplyFormContent />
    </Suspense>
  );
}

function ApplyFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    studentName: '', 
    rollNo: '',
    branch: '',
    semester: '',
    subjectName: '',
    subjectId: '',
    reappearRecordId: '',
    transactionId: '',
    feeAmount: 1000 
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. URL parameters fetch karein
    const sName = searchParams.get('subjectName');
    const sId = searchParams.get('subjectId');
    const rId = searchParams.get('recordId');

    // 2. Student info fetch karne ka function
    const loadStudentData = async () => {
      try {
        const response = await api.get('/applications/student-info');
        const user = response.data;
        
        setFormData(prev => ({
          ...prev,
          studentName: user.name || '',
          rollNo: user.rollNumber || '',
          branch: user.branch || '',
          semester: user.currentSemester || '',
          subjectName: sName || 'Mathematics I',
          subjectId: sId || 'MA101',
          reappearRecordId: rId || ''
        }));
      } catch (error) {
        console.error("Failed to load student info:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please Login again.");
          router.push('/login');
        }
      } finally {
        setFetching(false);
      }
    };

    loadStudentData();
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId) {
      alert("Error: Subject ID is missing. Please go back and click Apply Now again.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/applications/apply', {
        subjectId: formData.subjectId,
        reappearRecordId: formData.reappearRecordId,
        transactionId: formData.transactionId
      });
      setSuccess(true);
    } catch (error) {
      console.error("Submission Error:", error);
      alert(error.response?.data?.message || "Submission failed. Check your Backend.");
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
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Your reappear form for <strong>{formData.subjectName}</strong> has been sent to the Exam Cell.
          </p>
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
        {fetching ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Fetching your profile and subject details...</p>
          </div>
        ) : (
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
              <div className="input-group full-width">
                <label>Reappear Subject</label>
                <input type="text" className="form-input" value={formData.subjectName} disabled />
              </div>
            </div>

            <h3 className="form-section-title">Fee Payment</h3>
            <div className="fee-info-box">
              <span className="fee-text">Total Reappear Fee</span>
              <span className="fee-amount">₹{formData.feeAmount}</span>
            </div>
            
            <div className="form-grid">
              <div className="input-group full-width">
                <label>SBI Collect Transaction ID</label>
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
        )}
      </div>
    </div>
  );
}