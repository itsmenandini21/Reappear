"use client"
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast'; // Toaster bhi import karein
import './pyqs.css';

export default function UploadPyqForm() {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ dept: '', branch: '', semester: '', subjectId: '', year: '' });
    const [loading, setLoading] = useState(false);

    // Dynamic selectors
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [dynamicSemesters, setDynamicSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        api.get('/subjects/departments').then(res => setDepartments(res.data));
    }, []);

    useEffect(() => {
        if (formData.dept) {
            api.get(`/subjects/branches?department=${formData.dept}`)
               .then(res => setBranches(res.data));
        } else {
            setBranches([]);
            setFormData(prev => ({ ...prev, branch: '', semester: '', subjectId: '' }));
        }
    }, [formData.dept]);

    useEffect(() => {
        if (formData.dept && formData.branch) {
            api.get(`/subjects/semesters/distinct?department=${formData.dept}&branch=${formData.branch}`)
               .then(res => setDynamicSemesters(res.data));
        } else {
            setDynamicSemesters([]);
            setFormData(prev => ({ ...prev, semester: '', subjectId: '' }));
        }
    }, [formData.branch, formData.dept]);

    useEffect(() => {
        if (formData.dept && formData.branch && formData.semester) {
            api.get(`/subjects/sem?semesters=${formData.semester}&department=${formData.dept}&branch=${formData.branch}`)
               .then(res => setSubjects(res.data));
        } else {
            setSubjects([]);
            setFormData(prev => ({ ...prev, subjectId: '' }));
        }
    }, [formData.dept, formData.branch, formData.semester]);

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if(!file) {
            toast.error("Please select a PDF file");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('file', file);
        // Ensure semester and year are sent as numbers if your backend expects it
        data.append('subjectId', formData.subjectId);
        data.append('semester', formData.semester);
        data.append('branch', formData.branch);
        data.append('year', formData.year);

        try {
            const res = await api.post('/pyq/upload', data);
            
            // Success Message!
            toast.success("PYQ Uploaded Successfully! 🚀");

            // Form Reset
            setFile(null);
            setFormData({ dept: '', branch: '', semester: '', subjectId: '', year: '' });
            e.target.reset(); 
        } catch (err) { 
            console.error("Upload Error:", err);
            const errorMsg = err.response?.data?.message || "Upload failed. Try again.";
            toast.error(errorMsg); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pyq-container">
            {/* YE LINE IMPORTANT HAI: Isse toast isi page par dikhega */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="pyq-card">
                <h3 className="pyq-title">Upload New PYQ</h3>
                
                <form onSubmit={handleUpload} className="pyq-form">
                    <div className="pyq-grid">
                        <div className="pyq-group">
                            <label>Department</label>
                            <select 
                                className="pyq-input"
                                value={formData.dept}
                                onChange={(e) => setFormData({...formData, dept: e.target.value})} 
                                required
                            >
                                <option value="">Select Dept</option>
                                {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="pyq-group">
                            <label>Branch</label>
                            <select 
                                className="pyq-input"
                                value={formData.branch}
                                disabled={!formData.dept || branches.length === 0}
                                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                                required
                            >
                                <option value="">{branches.length === 0 ? "No Branches" : "Select Branch"}</option>
                                {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
                            </select>
                        </div>
                        
                        <div className="pyq-group">
                            <label>Semester</label>
                            <select 
                                className="pyq-input"
                                value={formData.semester}
                                disabled={!formData.branch || dynamicSemesters.length === 0}
                                onChange={(e) => setFormData({...formData, semester: e.target.value})} 
                                required
                            >
                                <option value="">{dynamicSemesters.length === 0 ? "No Semesters" : "Select Sem"}</option>
                                {dynamicSemesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="pyq-group">
                            <label>Year</label>
                            <input 
                                type="number" 
                                className="pyq-input"
                                placeholder="2025"
                                value={formData.year}
                                onChange={(e) => setFormData({...formData, year: e.target.value})} 
                                required
                            />
                        </div>
                    </div>

                    <div className="pyq-group">
                        <label>Subject Name & Code</label>
                        <select 
                            className="pyq-input"
                            value={formData.subjectId}
                            disabled={!formData.branch}
                            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                            required
                        >
                            <option value="">
                                {!formData.semester ? "-- Select Dept, Branch & Sem first --" : "-- Choose Subject --"}
                            </option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>
                                    {s.subjectName} ({s.subjectCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pyq-group">
                        <label>Upload Question Paper (PDF)</label>
                        <div className="pyq-file-wrapper">
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={(e) => setFile(e.target.files[0])} 
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="pyq-submit-btn"
                        disabled={loading || !formData.subjectId}
                    >
                        {loading ? "Processing..." : "Upload to Portal"}
                    </button>
                </form>
            </div>
        </div>
    );
}