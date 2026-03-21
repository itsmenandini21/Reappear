"use client";
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiX, FiPlus, FiSave, FiUser, FiBriefcase, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api'; // API import
import './updateFaculty.css';

const UpdateFaculty = ({ facultyData, onBack }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // Dynamic Dropdown states
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // DB se data handle karne ke liye states
    const [tempWorkload, setTempWorkload] = useState({});
    const [formData, setFormData] = useState({
        name: facultyData?.name || "",
        email: facultyData?.email || "",
        phoneNumber: facultyData?.phoneNumber || "",
        department: facultyData?.department || ""
    });

    // 1. Load Initial Data: Faculty ke subjects ko Sem-wise group karein
    useEffect(() => {
        if (facultyData?.subjects && Array.isArray(facultyData.subjects)) {
            const grouped = {};
            facultyData.subjects.forEach(sub => {
                if (sub && sub.semester) {
                    if (!grouped[sub.semester]) grouped[sub.semester] = [];
                    grouped[sub.semester].push(sub);
                }
            });
            setTempWorkload(grouped);
        }
    }, [facultyData]);

    // 2. Fetch Branches dynamically for this Faculty's Department
    useEffect(() => {
        if (formData.department) {
            api.get(`/subjects/branches?department=${formData.department}`)
               .then(res => setBranches(res.data)).catch(() => {});
        }
    }, [formData.department]);

    // 3. Fetch Semesters dynamically based on Branch
    useEffect(() => {
        if (formData.department && selectedBranch) {
            api.get(`/subjects/semesters/distinct?department=${formData.department}&branch=${selectedBranch}`)
               .then(res => setSemesters(res.data)).catch(() => {});
        } else {
            setSemesters([]);
            setSelectedSem("");
        }
    }, [selectedBranch, formData.department]);

    // 4. Fetch Subjects based on Semester & Branch
    useEffect(() => {
        if (formData.department && selectedBranch && selectedSem) {
            api.get(`/subjects/sem?semesters=${selectedSem}&department=${formData.department}&branch=${selectedBranch}`)
               .then(res => setAvailableSubjects(res.data)).catch(() => {});
        } else {
            setAvailableSubjects([]);
        }
        setSelectedSubjects([]); // Reset checkboxes on any filter change
    }, [selectedSem, selectedBranch, formData.department]);

    // Active Flat List tracker
    const flatWorkloadIds = Object.values(tempWorkload).flat().map(s => s._id);
    const filteredSubjects = availableSubjects.filter(s => !flatWorkloadIds.includes(s._id));

    const handleRemoveSubject = (sem, subId) => {
        setTempWorkload(prev => {
            const updatedList = prev[sem].filter(item => item._id !== subId);
            const newState = { ...prev };
            newState[sem] = updatedList;
            if (updatedList.length === 0) delete newState[sem];
            return newState;
        });
        toast.error(`Removed from local view`, { icon: '🗑️' });
    };

    const toggleSubject = (id) => {
        setSelectedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const injectSubjects = () => {
        if (selectedSubjects.length === 0) {
            toast.error("Please select at least one subject from the list");
            return;
        }

        const selectedObjs = availableSubjects.filter(s => selectedSubjects.includes(s._id));
        if (selectedObjs.length === 0) return;

        setTempWorkload(prev => {
            const newState = { ...prev };
            selectedObjs.forEach(subObj => {
                const sem = subObj.semester;
                if (!newState[sem]) newState[sem] = [];
                // Only push if not already present somehow
                if (!newState[sem].find(s => s._id === subObj._id)) {
                    newState[sem].push(subObj);
                }
            });
            return newState;
        });

        setSelectedSubjects([]);
        toast.success(`${selectedObjs.length} subjects staged for assignment`);
    };

    // 5. Final PUT Request to Database
    const handleFinalDBUpdate = async () => {
        const loadingToast = toast.loading("Executing Database Transaction...");
        try {
            const allSubjectIds = Object.values(tempWorkload).flat().map(s => s._id);

            await api.put(`/faculty/update/${facultyData._id}`, {
                ...formData,
                subjects: allSubjectIds
            });

            toast.dismiss(loadingToast);
            toast.success("Updated Successfully", { position: 'top-center' });
            
            setTimeout(() => {
                onBack();
            }, 600);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Synchronization Failed", { position: 'top-center' });
        }
    };

    return (
        <div className={`update-screen-wrapper ${showConfirmModal ? 'body-blur' : ''}`}>

            {/* 1. TOP NAVIGATION */}
            <nav className="update-navbar">
                <button className="back-link-btn" onClick={onBack}>
                    <FiArrowLeft /> Back to List
                </button>
            </nav>

            <div className="update-content-container fade-in">
                <header className="update-page-header">
                    <div className="badge-edit">Resource Modification Mode</div>
                    <h1>Update Faculty Profile</h1>
                    <p>You are modifying the official records for <strong>{facultyData?.name}</strong></p>
                </header>

                {/* 2. FACULTY PRIMARY DETAILS CARD */}
                <section className="info-card">
                    <h3 className="card-heading"><FiUser /> Primary Credentials</h3>
                    <div className="grid-4-col">
                        <div className="input-box"><label>Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                        <div className="input-box"><label>Department</label><input type="text" value={formData.department} disabled className="disabled-field" /></div>
                        <div className="input-box"><label>Email Address</label><input type="text" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                        <div className="input-box"><label>Phone Number</label><input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} /></div>
                    </div>
                </section>

                {/* 3. ASSIGN NEW COURSE SECTION */}
                <section className="assign-course-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '15px' }}><FiPlus /> Assign New Course</h3>
                    <div className="assign-course-grid">
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="input-box">
                                <label>Designated Branch</label>
                                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                                    <option value="">Select Branch</option>
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="input-box">
                                <label>Semester Depth</label>
                                <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} disabled={!selectedBranch}>
                                    <option value="">Select Semester</option>
                                    {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="input-box">
                            <label>Available Subjects (Multi-Select)</label>
                            <div className="checkbox-list-container">
                                {filteredSubjects.length === 0 ? (
                                    <p className="no-subjects-msg">{selectedSem ? "No Subjects Left" : "Select Semester to view"}</p>
                                ) : (
                                    filteredSubjects.map(s => (
                                        <label key={s._id} className={`checkbox-item-row ${selectedSubjects.includes(s._id) ? 'checked-row' : ''}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSubjects.includes(s._id)} 
                                                onChange={() => toggleSubject(s._id)}
                                            />
                                            <span className="truncate-text" title={`${s.subjectName} (${s.subjectCode})`}>
                                                {s.subjectName} ({s.subjectCode})
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <button 
                            className="btn-update-final" 
                            style={{ margin: 0, opacity: selectedSubjects.length === 0 ? 0.5 : 1, width: '100%', height: '100%', justifyContent: 'center' }} 
                            onClick={injectSubjects}
                            disabled={selectedSubjects.length === 0}
                        >
                            Stage {selectedSubjects.length > 0 ? `(${selectedSubjects.length})` : ''}
                        </button>
                    </div>
                </section>

                {/* 4. SEMESTER-WISE WORKLOAD SECTION */}
                <section className="workload-section">
                    <h3 className="card-heading"><FiBriefcase /> Assigned Academic Workload</h3>

                    <div className="semester-stack">
                        {Object.keys(tempWorkload).length > 0 ? (
                            Object.keys(tempWorkload).sort((a, b) => a - b).map(sem => (
                                <div key={sem} className="sem-row-card">
                                    <div className="sem-row-header">
                                        <h4>Semester {sem}</h4>
                                    </div>
                                    <div className="subject-pills-wrap">
                                        {tempWorkload[sem].map(sub => (
                                            <div key={sub._id} className="subject-pill">
                                                <span>{sub.subjectName} ({sub.subjectCode})</span>
                                                <FiX className="pill-remove" onClick={() => handleRemoveSubject(sem, sub._id)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-workload-placeholder">
                                <p>No active workload detected for this faculty. Use the assignment panel above to stage courses.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. FOOTER ACTIONS */}
                <footer className="update-footer-actions">
                    <button className="btn-cancel-final" onClick={onBack}>Cancel Changes</button>
                    <button className="btn-update-final" onClick={() => setShowConfirmModal(true)}>
                        <FiSave /> Update Changes
                    </button>
                </footer>
            </div>



            {/* --- MODAL 2: FINAL CONFIRMATION --- */}
            {showConfirmModal && (
                <div className="modal-overlay-fixed">
                    <div className="confirm-box-central scale-up">
                        <FiBook size={40} color="#E3342F" />
                        <h3>Update Faculty Records?</h3>
                        <p>This action will synchronize the current workload with the central database.</p>
                        <div className="confirm-btns">
                            <button className="btn-yes" onClick={handleFinalDBUpdate}>Yes, Update</button>
                            <button className="btn-no" onClick={() => setShowConfirmModal(false)}>No, Go Back</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateFaculty;