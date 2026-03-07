"use client"
import { use, useState } from "react";
import api from "@/lib/api";
import toast from 'react-hot-toast';
import "./login.css"
import { useRouter } from "next/navigation"; //to directly navigate to the dashboard or any other page as soon as user login is successful

function LoginPage() {
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

            localStorage.setItem('token', token);
            localStorage.setItem('name', name);

            toast.success(`Welcome Back ${name}`)
            router.push("/dashboard");
        }
        catch (error) {
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
    </div>
  );
}

export default LoginPage;