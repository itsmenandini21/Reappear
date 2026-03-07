"use client";
import React, { useState } from 'react';
import { FiArrowLeft, FiX, FiPlus, FiSave, FiUser, FiBriefcase, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './updateFaculty.css';

const UpdateFaculty = ({ facultyData, onBack }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [activeSem, setActiveSem] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedInModal, setSelectedInModal] = useState([]); // 1. Modal ke liye ek temporary selection state banayein (top level par)

    // Initial State: Simulating data already assigned to this faculty
    const [tempWorkload, setTempWorkload] = useState({
        1: ["Applied Physics", "Programming in C"],
        3: ["Data Structures", "Discrete Mathematics"],
        5: ["Operating Systems"]
    });

    // Mock Repository of all subjects available in the college
    const globalSubjectRepo = {
        1: ["Engineering Drawing", "Mathematics-I", "Chemistry"],
        3: ["Computer Organization", "Digital Logic", "Object Oriented Programming"],
        5: ["Cloud Computing", "Machine Learning", "Theory of Computation"],
        6: ["Compiler Design", "Software Engineering"]
    };

    const handleRemoveSubject = (sem, sub) => {
        setTempWorkload(prev => ({
            ...prev,
            [sem]: prev[sem].filter(item => item !== sub)
        }));
        toast.error(`${sub} removed from view`, { icon: '🗑️' });
    };

    // 2. handleAddSubjects ko modify karein
    const handleAddSubjects = () => {
        if (selectedInModal.length === 0) {
            toast.error("Please select at least one subject");
            return;
        }

        setTempWorkload(prev => ({
            ...prev,
            [activeSem]: [...(prev[activeSem] || []), ...selectedInModal]
        }));

        setSelectedInModal([]); // Selection clear karein
        setShowPicker(false);
        toast.success(`${selectedInModal.length} Subjects added to list`);
    };

    // 3. Checkbox toggle function
    const toggleSubjectSelection = (subject) => {
        setSelectedInModal(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
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
                        <div className="input-box"><label>Full Name</label><input type="text" defaultValue={facultyData?.name} /></div>
                        <div className="input-box"><label>Employee ID</label><input type="text" defaultValue={facultyData?.id} disabled className="disabled-field" /></div>
                        <div className="input-box"><label>Department</label><input type="text" defaultValue={facultyData?.dept} /></div>
                        <div className="input-box"><label>Designation</label><input type="text" defaultValue={facultyData?.role} /></div>
                    </div>
                    <div className="grid-2-col" style={{ marginTop: '20px' }}>
                        <div className="input-box"><label>Experience (Years)</label><input type="text" defaultValue="12 Years" /></div>
                        <div className="input-box"><label>Highest Degree</label><input type="text" defaultValue="Ph.D. in Computer Science" /></div>
                    </div>
                </section>

                {/* 3. SEMESTER-WISE WORKLOAD SECTION */}
                <section className="workload-section">
                    <h3 className="card-heading"><FiBriefcase /> Assigned Academic Workload</h3>

                    <div className="semester-stack">
                        {Object.keys(tempWorkload).map(sem => (
                            tempWorkload[sem].length > 0 && (
                                <div key={sem} className="sem-row-card">
                                    <div className="sem-row-header">
                                        <h4>Semester {sem}</h4>
                                        <button className="btn-add-course" onClick={() => { setActiveSem(sem); setShowPicker(true) }}>
                                            <FiPlus /> Add Course
                                        </button>
                                    </div>
                                    <div className="subject-pills-wrap">
                                        {tempWorkload[sem].map(sub => (
                                            <div key={sub} className="subject-pill">
                                                <span>{sub}</span>
                                                <FiX className="pill-remove" onClick={() => handleRemoveSubject(sem, sub)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
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
                            {/* Filter: Jo subjects pehle se assigned nahi hain wahi dikhenge */}
                            {globalSubjectRepo[activeSem]
                                ?.filter(s => !tempWorkload[activeSem]?.includes(s))
                                .map(sub => (
                                    <label key={sub} className={`picker-item ${selectedInModal.includes(sub) ? 'selected-row' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="custom-check"
                                            checked={selectedInModal.includes(sub)}
                                            onChange={() => toggleSubjectSelection(sub)}
                                        />
                                        <span style={{ fontWeight: selectedInModal.includes(sub) ? '700' : '500' }}>
                                            {sub}
                                        </span>
                                    </label>
                                ))}
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
                            <button className="btn-yes" onClick={() => {
                                toast.success("Updated Successfully", { position: "top-center" });
                                onBack();
                            }}>Yes, Update</button>
                            <button className="btn-no" onClick={() => setShowConfirmModal(false)}>No, Go Back</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateFaculty;