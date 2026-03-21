"use client"
import React, { useState, useEffect } from 'react';
import './feeTracker.css';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const FeeTracker = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");

  const [filterSem, setFilterSem] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterRoll, setFilterRoll] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reappear/admin/fee-tracker');
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load records.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openEmailModal = (studentEmail, unpaidSubjectsStr) => {
    setSelectedStudentEmail(studentEmail);
    setEmailSubject(`Urgent: Fee/Application Pending`);
    setEmailMessage(`You have not filled the form or have not paid the fees for this (${unpaidSubjectsStr}) exams.`);
    setModalOpen(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reappear/admin/send-email', {
        email: selectedStudentEmail,
        subject: emailSubject,
        message: emailMessage
      });
      toast.success("Email sent successfully!");
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to send email");
    }
  };

  const filteredRecords = data.filter(record => {
    if (record.feesPaid === true) return false;
    if (!record.student || !record.subject) return false;
    if (filterSem && String(record.subject.semester) !== String(filterSem)) return false;
    if (filterDept && !record.subject.department.toLowerCase().includes(filterDept.toLowerCase())) return false;
    if (filterSub && !record.subject.subjectCode.toLowerCase().includes(filterSub.toLowerCase())) return false;
    if (filterRoll && !record.student.rollNumber.toLowerCase().includes(filterRoll.toLowerCase())) return false;
    return true;
  });

  const aggregated = {};
  filteredRecords.forEach(rec => {
    const semIndex = rec.subject.semester;
    const sem = semIndex + (semIndex === 1 ? 'st' : semIndex === 2 ? 'nd' : semIndex === 3 ? 'rd' : 'th') + ' Semester';
    const dept = rec.subject.department;
    const studentId = rec.student._id;
    
    if (!aggregated[sem]) aggregated[sem] = {};
    if (!aggregated[sem][dept]) aggregated[sem][dept] = {};
    if (!aggregated[sem][dept][studentId]) {
      aggregated[sem][dept][studentId] = {
        name: rec.student.name,
        roll: rec.student.rollNumber,
        email: rec.student.email,
        unpaid: []
      };
    }
    aggregated[sem][dept][studentId].unpaid.push(rec.subject.subjectName + " (" + rec.subject.subjectCode + ")");
  });

  return (
    <div className="ft-main-wrapper">
      <Toaster position="top-center" />

      {/* FILTER SECTION */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', display: 'flex', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Sem (e.g. 1)" value={filterSem} onChange={e=>setFilterSem(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', flex: 1 }} />
        <input type="text" placeholder="Dept (e.g. CSE)" value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', flex: 1 }} />
        <input type="text" placeholder="Subject (e.g. CS101)" value={filterSub} onChange={e=>setFilterSub(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', flex: 1 }} />
        <input type="text" placeholder="Roll No" value={filterRoll} onChange={e=>setFilterRoll(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', flex: 1 }} />
      </div>

      {loading ? <p>Loading data...</p> : Object.keys(aggregated).length === 0 ? <p style={{color: '#666', background: 'white', padding: '20px', borderRadius: '12px'}}>No unpaid records found matching the criteria.</p> : (
        Object.keys(aggregated).map((sem, sIndex) => (
          <div key={sIndex} className="ft-sem-wrapper">
            <div className="ft-sem-indicator">
              <div className="ft-sem-tag">{sem}</div>
              <div className="ft-header-divider"></div>
            </div>

            {Object.keys(aggregated[sem]).map((dept, bIdx) => (
              <div key={bIdx} className="ft-branch-group">
                <h3 className="ft-branch-label">{dept}</h3>
                
                <div className="ft-vertical-list">
                  {Object.values(aggregated[sem][dept]).map((student, sId) => (
                    <div key={sId} className="ft-student-card">
                      <div className="ft-card-header">
                        <div className="ft-name-roll">
                          <span className="ft-student-name">{student.name}</span>
                          <span className="ft-student-roll">{student.roll}</span>
                        </div>
                        <button className="ft-mail-action" onClick={() => openEmailModal(student.email, student.unpaid.join(", "))}>📩</button>
                      </div>

                      <div className="ft-subject-panel">
                        <div className="ft-panel-title">Pending Applications/Fees:</div>
                        <div className="ft-sub-container">
                          {student.unpaid.map((sub, i) => (
                            <div key={i} className="ft-sub-entry">
                              <span className="ft-sub-bullet"></span> {sub}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* EMAIL MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{marginTop: 0, fontSize: '20px', marginBottom: '10px'}}>Send Warning Email</h2>
            <p style={{marginBottom: '20px', color: '#666', fontSize: '13px', fontWeight: 'bold'}}>To: {selectedStudentEmail}</p>
            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} required />
              <textarea value={emailMessage} onChange={e=>setEmailMessage(e.target.value)} rows="5" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }} required />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={()=>setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#ffebeb', color: '#ff3b30', border: '1px solid #ffc0c0', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: '#ff2600', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FeeTracker;