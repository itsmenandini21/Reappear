"use client"
import {useState } from "react";
import api from "@/lib/api";
import toast from 'react-hot-toast';
import "./login.css"
import { useRouter } from "next/navigation"; //to directly navigate to the dashboard or any other page as soon as user login is successful

function LoginPage() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isNotSuccess,setisNotSuccess]=useState(false);
    const router=useRouter();
    const [loginData, setLoginData] = useState({ email: "", password: "" })
    function handleChange(e) {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await api.post("auth/login", loginData);
            const { token, name } = response.data;

            if (typeof window !== "undefined") {
              const userObj = { ...response.data };
              delete userObj.token; // usually good practice not to double store token inside object
              
              localStorage.setItem("user", JSON.stringify(userObj));
              localStorage.setItem("token", token);
              localStorage.setItem("name", name);
              localStorage.setItem("userId", response.data._id); // Store the user ID for future API calls
            }
            setIsSuccess(true);
            setTimeout(()=>{
              router.push("/dashboard");
            },2000);
        }
        catch (error) {
          setisNotSuccess(true);
          setTimeout(()=>{
            setisNotSuccess(false);
          },2000);
            toast.error(error.response?.data?.message || "Login failed");
        }
    }


    return (
    <div className="login-wrapper">
      {/* Branding Header */}
      <div className="nit-logo-badge">
        <span className="nit-indicator"></span>
        <h1>NIT <span>Kurukshetra</span></h1>
      </div>

      <div className="login-container">
        <div className="login-header">
          <h2>Student Login</h2>
          <span className="lock-icon">🔒</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="student@nitkkr.ac.in" 
              value={loginData.email}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-box">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              value={loginData.password}
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="login-submit-btn">LOGIN</button>
        </form>

        <div className="register-link">
          New user? <a href="/register">Create an account</a>
        </div>
      </div>
      <p className="copyright-text">Academic Portal 2026</p>
      {isSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Login Successful! ✅</h2>

            <div className="loading-bar"></div>
            <p className="redirect-text">Redirecting to Dashboard...</p>
          </div>
        </div>
      )}
      {isNotSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="Notsuccess-icon">⚠️</div>
            <h2>Incorrect email or password</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;