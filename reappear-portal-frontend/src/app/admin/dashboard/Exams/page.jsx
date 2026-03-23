"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import '../Subjects/subjects.css';
import api from '@/lib/api'; 

const ScheduleExams = () => {
  const [view, setView] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]); 
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState(null); 
  const [hasSyllabus, setHasSyllabus] = useState(false);
  // Frontend Dummy Mappings
  const dummyData = {
    'Computer Engineering': [
      'Information Technology',
      'Artificial Intelligence and Machine Learning',
      'Artificial Intelligence and Data Science',
      'Mathematics and Computing'
    ],
    'Electronics and Communication Engineering': [
      'Electronics & Communication Engineering (ECE)',
      'Industrial Internet of Things (IIoT)',
      'Microelectronics and VLSI Engineering'
    ],
    'Mechanical Engineering': [
      'Mechanical Engineering',
      'Production & Industrial Engineering',
      'Robotics & Automation'
    ],
    'Electrical Engineering': ['Electrical Engineering'],
    'Civil Engineering': ['Civil Engineering'],
    'Energy Science and Engineering': ['Sustainable Energy Technologies']
  };

  const departments = Object.keys(dummyData);
  const [formData, setFormData] = useState({ dept: '', branch: '', sem: '', subject: '', examType: '', component: '' });

  const branches = formData.dept ? dummyData[formData.dept] || [] : [];
  const dynamicSemesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchExams();
  }, []);



  useEffect(() => {
    if (formData.sem && formData.dept && formData.branch && formData.dept !== 'All' && formData.branch !== 'All') {
       api.get(`/subjects/sem?semesters=${formData.sem}&department=${formData.dept}&branch=${formData.branch}`)
          .then(res => setSubjects(res.data)).catch(() => setSubjects([]));
    } else {
       api.get('/subjects').then(res => setSubjects(res.data)).catch(() => setSubjects([]));
    }
  }, [formData.dept, formData.branch, formData.sem]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exams/all');
      setExams(res.data || []);
    } catch (err) {
      toast.error("Database connection failed!");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/exams/${examToDelete._id}`);
      setExams(exams.filter(e => e._id !== examToDelete._id));
      setShowDeleteModal(false);
      toast.success("Exam Removed!");
    } catch (err) {
      toast.error("Delete failed!");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      dept: formData.get("dept"),
      branch: formData.get("branch"),
      sem: formData.get("sem"),
      subject: formData.get("subject"),
      examType: formData.get("examType"),
      component: formData.get("component"),
      date: formData.get("date"),
      time: formData.get("time"),
      room: formData.get("room"),
      syllabus: hasSyllabus ? formData.get("syllabus") : ""
    };
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    try {
      if (view === 'add') {
        await api.post('/exams', pendingData);
        toast.success("Exam Scheduled!");
      } else {
        await api.put(`/exams/${selectedExam._id}`, pendingData);
        toast.success("Exam Updated!");
      }
      fetchExams();
      setShowConfirmModal(false);
      setView('list');
      setHasSyllabus(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Process failed!");
      setShowConfirmModal(false);
    }
  };

  const openEdit = (exam) => {
    setSelectedExam(exam);
    setHasSyllabus(!!exam.syllabus);
    // Preload the specific data into the dynamic states to establish the mappings instantly
    setFormData({ 
      dept: exam.department || '', 
      branch: exam.branch || '', 
      sem: exam.semester || '', 
      subject: exam.subjectCode || '',
      examType: exam.examType || '',
      component: exam.examComponent || ''
    });
    setView('update');
  };

  const openAdd = () => {
    setSelectedExam(null); 
    setView('add'); 
    setHasSyllabus(false);
    setFormData({ dept: '', branch: '', sem: '', subject: '', examType: '', component: '' });
  };

  const getSubName = (code) => {
      const s = subjects.find(sub => sub.subjectCode === code);
      return s ? s.subjectName : "";
  };

  return (
    <div className="admin-subjects-wrapper">
      <Toaster position="top-center" />

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-card bounce-in">
            <div className="modal-icon-danger">⚠️</div>
            <h2>Remove Exam?</h2>
            <p>Are you sure you want to delete the exam for <b>{examToDelete?.subjectCode}</b>?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete Exam</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/UPDATE CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-card bounce-in">
            <div className="modal-icon-info">📝</div>
            <h2>{view === 'add' ? "Schedule Exam?" : "Save Changes?"}</h2>
            <p>Do you want to {view === 'add' ? "schedule this exam in" : "update the exam details in"} the repository?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>No, Back</button>
              <button className="btn-primary" onClick={executeSubmit}>Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Exam Repository</h1>
          <p className="page-subtitle">Manage upcoming exams and exam center details.</p>
        </div>
        {view === 'list' && (
          <button className="btn-primary" onClick={openAdd}>
            + Schedule Exam
          </button>
        )}
      </div>

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <div className="table-card fade-in">
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search exams by dept, code, or center..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            {loading ? <p style={{padding: '20px'}}>Loading...</p> : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Exam Details</th>
                  <th>Department</th>
                  <th>Center & Time</th>
                  <th>Syllabus</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams
                  .filter(e => 
                    e.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.roomAllocation?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((exam) => (
                    <tr key={exam._id}>
                      <td>
                        <div className="subject-info">
                          <span className="sub-code">{exam.subjectCode}</span>
                          <span className="sub-name">{getSubName(exam.subjectCode)}</span>
                          <div style={{marginTop: '4px'}}>
                            <span className="pill" style={{background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '2px 6px', marginRight: '4px'}}>{exam.examType || 'End-Sem'}</span>
                            <span className="pill" style={{background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '2px 6px'}}>{exam.examComponent || 'Theory'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pill pill-dept" style={{display: 'inline-block', marginBottom: '4px'}}>{exam.department} • {exam.branch}</span><br />
                        <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#64748b'}}>Semester {exam.semester}</span>
                      </td>
                      <td>
                        <div className="subject-info">
                          <span className="sub-name">Room: {exam.roomAllocation}</span>
                          <span className="text-muted">{new Date(exam.examDate).toLocaleDateString()} at {exam.examTime}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">{exam.syllabus ? "Available" : "Not Provided"}</span>
                      </td>
                      <td className="action-cell">
                        <button className="action-btn btn-edit" onClick={() => openEdit(exam)}>Edit</button>
                        <button className="action-btn btn-delete" onClick={() => { setExamToDelete(exam); setShowDeleteModal(true); }}>Remove</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      )}

      {/* --- ADD / UPDATE FORM --- */}
      {(view === 'add' || view === 'update') && (
        <div className="form-card fade-in">
          <button className="btn-back-top" onClick={() => setView('list')}>← Back</button>
          <div className="form-header">
            <h2>{view === 'add' ? "Schedule New Exam" : "Edit Exam Details"}</h2>
          </div>
          <form onSubmit={handleFormSubmit} className="grid-form">
            <div className="input-group">
              <label>Department</label>
              <select name="dept" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value, branch: '', sem: '', subject: '' })} required>
                <option value="">Select Dept</option>
                {formData.dept && !departments.includes(formData.dept) && (
                  <option value={formData.dept}>{formData.dept}</option>
                )}
                {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="input-group">
              <label>Branch</label>
              <select name="branch" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value, sem: '', subject: '' })} required disabled={!formData.dept || (branches.length === 0 && !formData.branch)}>
                <option value="">{(branches.length === 0 && !formData.branch) ? "No Branches" : "Select Branch"}</option>
                {formData.branch && !branches.includes(formData.branch) && (
                  <option value={formData.branch}>{formData.branch}</option>
                )}
                {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Semester</label>
              <select name="sem" value={formData.sem} onChange={e => setFormData({ ...formData, sem: e.target.value, subject: '' })} required>
                <option value="">Select Sem</option>
                {formData.sem && !dynamicSemesters.includes(String(formData.sem)) && (
                  <option value={formData.sem}>{formData.sem}{formData.sem == 1 ? 'st' : formData.sem == 2 ? 'nd' : formData.sem == 3 ? 'rd' : 'th'} Semester</option>
                )}
                {dynamicSemesters.map(num => (
                  <option key={num} value={num}>{num}{num == 1 ? 'st' : num == 2 ? 'nd' : num == 3 ? 'rd' : 'th'} Semester</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Subject</label>
              <select name="subject" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required disabled={!formData.sem || (subjects.length === 0 && !formData.subject)}>
                <option value="">{(subjects.length === 0 && !formData.subject) ? "No mapped subjects" : "Select Subject"}</option>
                {formData.subject && !subjects.some(s => s.subjectCode === formData.subject) && (
                  <option value={formData.subject}>{getSubName(formData.subject) ? `${formData.subject} - ${getSubName(formData.subject)}` : formData.subject}</option>
                )}
                {subjects.map(sub => (
                  <option key={sub.subjectCode} value={sub.subjectCode}>{sub.subjectCode} - {sub.subjectName}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Exam Type</label>
              <select name="examType" value={formData.examType} onChange={e => setFormData({ ...formData, examType: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Mid-Sem-1">Mid Sem 1</option>
                <option value="Mid-Sem-2">Mid Sem 2</option>
                <option value="End-Sem">End Sem</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Component</label>
              <select name="component" value={formData.component} onChange={e => setFormData({ ...formData, component: e.target.value })} required>
                <option value="">Select Component</option>
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
            </div>

            <div className="input-group">
              <label>Exam Date</label>
              <input name="date" type="date" defaultValue={selectedExam?.examDate ? new Date(selectedExam.examDate).toISOString().split('T')[0] : ''} required />
            </div>

            <div className="input-group">
              <label>Exam Time</label>
              <input name="time" type="time" defaultValue={selectedExam?.examTime} required />
            </div>

            <div className="input-group">
              <label>Exam Centre (Room No.)</label>
              <input name="room" type="text" defaultValue={selectedExam?.roomAllocation} placeholder="e.g. Room 101" required />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasSyllabus} onChange={(e) => setHasSyllabus(e.target.checked)} style={{width: 'auto', padding: 0}} />
                Syllabus is available for this exam
              </label>
              
              {hasSyllabus && (
                <textarea 
                  name="syllabus" 
                  rows="4" 
                  placeholder="Type the chapters, topics, or instructions here..." 
                  defaultValue={selectedExam?.syllabus} 
                  required 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #eee' }}
                />
              )}
            </div>

            <div className="form-actions full-width">
              <button type="button" className="btn-cancel" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn-primary">{view === 'add' ? "Schedule" : "Update"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ScheduleExams;