"use client"
import { useState } from "react";
import api from "@/lib/api";
import toast from 'react-hot-toast';
import "./login.css"
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

function GoogleCustomButton({ handleAuthSuccess, setisNotSuccess }) {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await api.post("auth/google", {
                    access_token: tokenResponse.access_token
                });
                handleAuthSuccess(response);
            } catch (error) {
                toast.error(error.response?.data?.message || "Google Login failed");
            }
        },
        onError: () => toast.error('Google Login Failed')
    });

    return (
        <button type="button" className="google-custom-btn" onClick={() => login()}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            Sign in with Google
        </button>
    );
}

function LoginPage() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isNotSuccess, setisNotSuccess] = useState(false);
    const router = useRouter();
    const [loginData, setLoginData] = useState({ email: "", password: "" })

    function handleChange(e) {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    }

    async function handleAuthSuccess(response) {
        const { token, name, _id } = response.data;
        if (typeof window !== "undefined") {
            const userObj = { ...response.data };
            delete userObj.token;
            localStorage.setItem("user", JSON.stringify(userObj));
            localStorage.setItem("token", token);
            localStorage.setItem("name", name);
            localStorage.setItem("userId", _id);
        }
        setIsSuccess(true);
        setTimeout(() => { router.push("/dashboard"); }, 2000);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await api.post("auth/login", loginData);
            handleAuthSuccess(response);
        } catch (error) {
            setisNotSuccess(true);
            setTimeout(() => setisNotSuccess(false), 2000);
            toast.error(error.response?.data?.message || "Login failed");
        }
    }

    return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE"}>
      <div className="login-wrapper">
        <div className="nit-logo-badge">
          <span className="nit-indicator"></span>
          <h1>NIT <span>Kurukshetra</span></h1>
        </div>

        <div className="login-container glass-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <span className="lock-icon">🔒</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <label>Email Address</label>
              <input 
                type="email" name="email" placeholder="student@nitkkr.ac.in" 
                value={loginData.email} onChange={handleChange} required 
              />
            </div>
            <div className="input-box">
              <label>Password</label>
              <input 
                type="password" name="password" placeholder="••••••••" 
                value={loginData.password} onChange={handleChange} required 
              />
            </div>
            <button type="submit" className="login-submit-btn">LOGIN</button>
          </form>

          <div className="auth-separator">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="google-auth-wrapper">
             <GoogleCustomButton handleAuthSuccess={handleAuthSuccess} setisNotSuccess={setisNotSuccess} />
          </div>

          <div className="register-link">
            New user? <a href="/register">Create an account</a>
          </div>
        </div>
        <p className="copyright-text">Reappear Portal 2026</p>

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
    </GoogleOAuthProvider>
  );
}

export default LoginPage;