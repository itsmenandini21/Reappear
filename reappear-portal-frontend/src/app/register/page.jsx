"use client";
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import './register.css';

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', rollNumber: '', branch: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            toast.success("Account Created! Please Login.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration Failed");
        }
    };
    return (
    <div className="reg-page-bg">
      {/* Branding Header */}
      <div className="nit-badge">
        <span className="nit-dot"></span>
        <h1>NIT <span>Kurukshetra</span></h1>
      </div>

      <div className="reg-card">
        <div className="reg-header">
          <h2>Create your Student Account</h2>
          <span className="reg-icon">📝</span>
        </div>
        <form onSubmit={handleSubmit} className="reg-grid">
          <div className="reg-input-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" onChange={handleChange} required />
          </div>

          <div className="reg-input-group">
            <label>Roll Number</label>
            <input type="text" name="rollNumber" placeholder="eg. 1211XXXX" onChange={handleChange} required />
          </div>

          <div className="reg-input-group full-row">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="student@nitkkr.ac.in" onChange={handleChange} required />
          </div>

          <div className="reg-input-group">
            <label>Current Semester</label>
            <input type="number" name="currentSemester" placeholder="eg. 4" onChange={handleChange} required />
          </div>

          <div className="reg-input-group">
            <label>Branch</label>
            <select name="branch" onChange={handleChange}>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div className="reg-input-group full-row">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <button type="submit" className="reg-submit-btn">REGISTER</button>
        </form>
      </div>
      <p className="reg-footer">NIT Kurukshetra • Reappear Portal 2026</p>
    </div>
  );
};

export default RegisterPage;