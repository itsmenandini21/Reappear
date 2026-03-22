"use client";
import { useState, useEffect } from 'react';
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
  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'email') {
        const val = e.target.value;
        const emailRegex = /^\d+@nitkkr\.ac\.in$/;
        if (val && !emailRegex.test(val)) {
            setEmailError("Please enter only your valid college mail ID (rollnumber@nitkkr.ac.in)");
        } else {
            setEmailError("");
        }
    }
  };

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const emailRegex = /^\d+@nitkkr\.ac\.in$/;
    if (!emailRegex.test(formData.email)) {
        toast.error("Email must be precisely rollnumber@nitkkr.ac.in");
        return;
    }

    try {
      setIsLoading(true);
      await api.post('auth/send-otp', { email: formData.email });
      setStep(2);
      setCooldown(60);
      toast.success("OTP sent to your email!");
    } catch (err) {
      setisNotSuccess(true);
      setTimeout(() => { setisNotSuccess(false); }, 3000);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");
    try {
      setIsLoading(true);
      const payload = { ...formData, otp };
      const response = await api.post('auth/verify-otp', payload);
      
      // CACHE credentials locally for the Dashboard global route guard
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("token", response.data.token);
      
      setIsSuccess(true);
      setTimeout(() => { router.push("/dashboard"); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or Expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setIsLoading(true);
      await api.post('auth/resend-otp', { email: formData.email });
      setCooldown(60);
      toast.success("A new OTP has been sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
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
        {step === 1 ? (
        <form onSubmit={handleSendOtp} className="reg-grid">
          <div className="reg-input-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="reg-input-group">
            <label>Roll Number</label>
            <input type="text" name="rollNumber" placeholder="eg. 1211XXXX" value={formData.rollNumber} onChange={handleChange} required />
          </div>

          <div className="reg-input-group full-row">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="student@nitkkr.ac.in" value={formData.email} onChange={handleChange} required />
            {emailError && <p style={{color: '#ff4d4d', fontSize: '13px', marginTop: '5px', textAlign: 'left'}}>{emailError}</p>}
          </div>

          <div className="reg-input-group">
            <label>Current Semester</label>
            <input type="number" name="currentSemester" placeholder="eg. 4" value={formData.currentSemester} onChange={handleChange} required />
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
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="reg-submit-btn" disabled={isLoading || !!emailError || !formData.email} style={{ opacity: (isLoading || !!emailError || !formData.email) ? 0.5 : 1, cursor: (isLoading || !!emailError || !formData.email) ? 'not-allowed' : 'pointer' }}>
            {isLoading ? "SENDING OTP..." : "REGISTER"}
          </button>
        </form>
        ) : (
        <form onSubmit={handleVerifyOtp} className="reg-grid">
           <div className="reg-input-group full-row" style={{ textAlign: "center" }}>
             <label style={{ fontSize: "16px", marginBottom: "15px" }}>
                Enter the 6-digit OTP sent to <br/><strong style={{color:"#4a90e2"}}>{formData.email}</strong>
             </label>
             <input type="text" maxLength="6" placeholder="000000" 
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))} 
                    required style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "bold" }} />
           </div>
           
           <button type="submit" className="reg-submit-btn" disabled={isLoading} style={{ marginTop: "10px" }}>
              {isLoading ? "VERIFYING..." : "VERIFY ACCOUNT"}
           </button>

           <div className="full-row" style={{ textAlign: "center", marginTop: "15px" }}>
              <button type="button" onClick={handleResendOtp} disabled={cooldown > 0 || isLoading}
                 style={{ background: "transparent", border: "none", color: cooldown > 0 ? "#666" : "#4a90e2", cursor: cooldown > 0 ? "not-allowed" : "pointer", fontWeight: "bold", textDecoration: "underline" }}
              >
                 {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
           </div>
        </form>
        )}

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
            <p className="redirect-text" style={{color: 'gray', marginTop: '10px'}}>Redirecting to dashboard...</p>
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