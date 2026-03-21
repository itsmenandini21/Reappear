"use client";
import { useState } from 'react';
import api from '@/lib/api';
import './register.css';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function RegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNotSuccess,setisNotSuccess]=useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', rollNumber: '', branch: 'CSE', currentSemester: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response=await api.post('auth/register', formData);
      setIsSuccess(true);
      setTimeout(() => { router.push("/login"); }, 2000);
    } catch (err) {
      setisNotSuccess(true);
      setTimeout(() => { setisNotSuccess(false); }, 2000);
      toast.error(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="reg-page-bg">
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
            <select name="branch" onChange={handleChange} value={formData.branch}>
              <option value="Computer Science Engineering">Computer Science Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <div className="reg-input-group full-row">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <button type="submit" className="reg-submit-btn">REGISTER</button>
        </form>

        <div className="login-link">
          Already registered? <a href="/login">Login</a>
        </div>
      </div>
      <p className="reg-footer">NIT Kurukshetra • Reappear Portal 2026</p>
      
      {/* Existing modals */}
      {isSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-icon">🚀</div>
            <h2>Registration Successful!</h2>
            <p>Welcome to NIT Kurukshetra Reappear Portal.</p>
            <div className="loading-bar"></div>
            <p className="redirect-text" style={{color: 'gray', marginTop: '10px'}}>Redirecting to login...</p>
          </div>
        </div>
      )}
      {isNotSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="Notsuccess-icon">⚠️</div>
            <h2>User already exists</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;