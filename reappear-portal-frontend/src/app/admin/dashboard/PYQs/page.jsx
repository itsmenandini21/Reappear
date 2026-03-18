"use client"
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast'; // Toaster bhi import karein
import './pyqs.css';

export default function UploadPyqForm() {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ subjectId: '', semester: '', branch: '', year: '' });
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/subjects').then(res => setSubjects(res.data));
    }, []);

    const filteredSubjects = subjects.filter(s => 
        Number(s.semester) === Number(formData.semester) && 
        s.department.toLowerCase() === formData.branch.toLowerCase()
    );

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
            setFormData({ subjectId: '', semester: '', branch: '', year: '' });
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
                            <label>Semester</label>
                            <select 
                                className="pyq-input"
                                value={formData.semester}
                                onChange={(e) => setFormData({...formData, semester: e.target.value, subjectId: '', branch: ''})} 
                                required
                            >
                                <option value="">Select</option>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="pyq-group">
                            <label>Branch</label>
                            <select 
                                className="pyq-input"
                                value={formData.branch}
                                disabled={!formData.semester}
                                onChange={(e) => setFormData({...formData, branch: e.target.value, subjectId: ''})}
                                required
                            >
                                <option value="">Select</option>
                                <option value="IT">IT</option>
                                <option value="CS">CS</option>
                                <option value="Engineering">Engineering</option>
                                <option value="MECH">MECH</option>
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
                                {!formData.branch ? "-- First select Sem & Branch --" : "-- Choose Subject --"}
                            </option>
                            {filteredSubjects.map(s => (
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