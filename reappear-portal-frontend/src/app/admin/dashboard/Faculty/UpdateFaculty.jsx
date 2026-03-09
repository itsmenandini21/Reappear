"use client";
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiX, FiPlus, FiSave, FiUser, FiBriefcase, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api'; // API import
import './updateFaculty.css';

const UpdateFaculty = ({ facultyData, onBack }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [activeSem, setActiveSem] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedInModal, setSelectedInModal] = useState([]);

    // DB se data handle karne ke liye states
    const [tempWorkload, setTempWorkload] = useState({});
    const [globalSubjectRepo, setGlobalSubjectRepo] = useState({});
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
                // Check if subject and semester exists
                if (sub && sub.semester) {
                    if (!grouped[sub.semester]) grouped[sub.semester] = [];
                    grouped[sub.semester].push(sub);
                }
            });
            setTempWorkload(grouped);
        }
        fetchGlobalSubjects();
    }, [facultyData]);

    // 2. Fetch Global Subjects for this Department
    const fetchGlobalSubjects = async () => {
        try {
            const res = await api.get(`/subjects/dept?department=${facultyData?.department}`);
            const grouped = {};
            res.data.forEach(sub => {
                if (!grouped[sub.semester]) grouped[sub.semester] = [];
                grouped[sub.semester].push(sub);
            });
            setGlobalSubjectRepo(grouped);
        } catch (err) {
            console.error("Error loading subjects");
        }
    };

    const handleRemoveSubject = (sem, subId) => {
        setTempWorkload(prev => {
            const updatedList = prev[sem].filter(item => item._id !== subId);
            const newState = { ...prev, [sem]: updatedList };
            // Agar semester khali ho jaye toh key delete kar do taaki UI se card hat jaye
            if (updatedList.length === 0) delete newState[sem];
            return newState;
        });
        toast.error(`Subject removed from view`, { icon: '🗑️' });
    };

    const handleAddSubjects = () => {
        if (selectedInModal.length === 0) {
            toast.error("Please select at least one subject");
            return;
        }

        const selectedObjs = globalSubjectRepo[activeSem].filter(s => selectedInModal.includes(s._id));

        setTempWorkload(prev => ({
            ...prev,
            [activeSem]: [...(prev[activeSem] || []), ...selectedObjs]
        }));

        setSelectedInModal([]);
        setShowPicker(false);
        toast.success(`${selectedInModal.length} Subjects added to list`);
    };

    const toggleSubjectSelection = (subId) => {
        setSelectedInModal(prev =>
            prev.includes(subId) ? prev.filter(s => s !== subId) : [...prev, subId]
        );
    };

    // 4. Final PUT Request to Database
    const handleFinalDBUpdate = async () => {
        const loadingToast = toast.loading("Updating Database...");
        try {
            const allSubjectIds = Object.values(tempWorkload).flat().map(s => s._id);

            await api.put(`/faculty/update/${facultyData._id}`, {
                ...formData,
                subjects: allSubjectIds
            });

            toast.success("Updated Successfully", { id: loadingToast });
            onBack();
        } catch (error) {
            toast.error("Update Failed", { id: loadingToast });
        }
    };

    return (
        <div className={`update-screen-wrapper ${showPicker || showConfirmModal ? 'body-blur' : ''}`}>

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

                {/* 3. SEMESTER-WISE WORKLOAD SECTION */}
                <section className="workload-section">
                    <h3 className="card-heading"><FiBriefcase /> Assigned Academic Workload</h3>

                    <div className="semester-stack">
                        {/* Only map semesters that have assigned subjects */}
                        {Object.keys(tempWorkload).length > 0 ? (
                            Object.keys(tempWorkload).sort((a, b) => a - b).map(sem => (
                                <div key={sem} className="sem-row-card">
                                    <div className="sem-row-header">
                                        <h4>Semester {sem}</h4>
                                        <button className="btn-add-course" onClick={() => { setActiveSem(Number(sem)); setShowPicker(true) }}>
                                            <FiPlus /> Add Course
                                        </button>
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
                                <p>No active workload detected for this faculty.</p>
                                <button onClick={() => { setActiveSem(1); setShowPicker(true) }} className="btn-add-course">Assign First Subject</button>
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

            {/* --- MODAL 1: SUBJECT PICKER --- */}
            {showPicker && (
                <div className="modal-overlay-fixed">
                    <div className="picker-card-central fade-in">
                        <div className="picker-header">
                            <h3>Select Subjects (Sem {activeSem})</h3>
                            <FiX className="close-icon" onClick={() => { setShowPicker(false); setSelectedInModal([]); }} />
                        </div>

                        <div className="picker-list">
                            {/* Filter: Jo subjects faculty abhi nahi pada raha wahi dikhenge usi semester ke */}
                            {globalSubjectRepo[activeSem]
                                ?.filter(s => !tempWorkload[activeSem]?.some(assigned => assigned._id === s._id))
                                .map(sub => (
                                    <label key={sub._id} className={`picker-item ${selectedInModal.includes(sub._id) ? 'selected-row' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="custom-check"
                                            checked={selectedInModal.includes(sub._id)}
                                            onChange={() => toggleSubjectSelection(sub._id)}
                                        />
                                        <span>{sub.subjectName} ({sub.subjectCode})</span>
                                    </label>
                                ))}
                            {(!globalSubjectRepo[activeSem] || globalSubjectRepo[activeSem].filter(s => !tempWorkload[activeSem]?.some(assigned => assigned._id === s._id)).length === 0) && (
                                <p className="no-subjects-msg">No new subjects available for Semester {activeSem}.</p>
                            )}
                        </div>

                        <div className="picker-footer-actions">
                            <button className="btn-modal-add" onClick={handleAddSubjects}>
                                Add {selectedInModal.length > 0 ? `(${selectedInModal.length})` : ''} to Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

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