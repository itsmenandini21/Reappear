"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import "./frontPage.css";

function deriveRollNumberFromEmail(email) {
  if (!email) return "";
  const match = String(email).trim().toLowerCase().match(/^(\d+)@nitkkr\.ac\.in$/);
  return match?.[1] || "";
}

function addRipple(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'cta-ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  button.appendChild(ripple);

  window.setTimeout(() => {
    ripple.remove();
  }, 650);
}

function GoogleButton({ onAuthSuccess }) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('auth/google', { access_token: tokenResponse.access_token });
        onAuthSuccess(response);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google Login failed');
      }
    },
    onError: () => toast.error('Google Login failed')
  });

  return (
    <button type="button" className="panel-google" onClick={() => login()}>
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="panel-google-icon"
      />
      Continue with Google
    </button>
  );
}

function FloatingSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  openSelect,
  setOpenSelect,
}) {
  const isOpen = openSelect === id;
  const selected = options.find((o) => o.value === value);
  const hasValue = Boolean(value);

  return (
    <div className={`fselect ${hasValue ? 'has-value' : ''} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}>
      <button
        type="button"
        className="fselect-trigger"
        onClick={() => {
          if (disabled) return;
          setOpenSelect(isOpen ? null : id);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        disabled={disabled}
      >
        <span className="fselect-value">{selected?.label || ''}</span>
        <label className="fselect-label">{label}</label>
        <span className="fselect-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            className="fselect-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            aria-label={label}
          >
            {!options.length ? (
              <div className="fselect-empty">{placeholder}</div>
            ) : (
              options.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`fselect-option ${value === opt.value ? 'active' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpenSelect(null);
                  }}
                >
                  {opt.label}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FrontPage() {
  const router = useRouter();
  const [panel, setPanel] = useState(null); // 'login' | 'join' | null
  const [panelStage, setPanelStage] = useState('idle'); // idle | loading | success

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '' });

  const [joinStep, setJoinStep] = useState(1);
  const [joinLoading, setJoinLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [openSelect, setOpenSelect] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const otpRefs = useRef([]);
  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    otp: ['', '', '', '', '', ''],
    department: '',
    branch: '',
    currentSemester: '',
    password: ''
  });

  const joinBtnRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 320, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 320, damping: 22, mass: 0.6 });

  const isOpen = !!panel;
  const fallbackDepartments = useMemo(() => ([
    'Computer Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Energy Science and Engineering'
  ]), []);

  const fallbackBranchMap = useMemo(() => ({
    'Computer Engineering': [
      'Computer Science',
      'Information Technology',
      'Artificial Intelligence and Machine Learning',
      'Artificial Intelligence and Data Science',
      'Mathematics and Computing'
    ],
    'Electronics and Communication Engineering': [
      'Electronics & Communication Engineering (ECE)',
      'Industrial Internet of Things (IIoT)',
      'Microelectronics and VLSI Engineering'
    ],
    'Mechanical Engineering': [
      'Mechanical Engineering',
      'Production & Industrial Engineering',
      'Robotics & Automation'
    ],
    'Electrical Engineering': ['Electrical Engineering'],
    'Civil Engineering': ['Civil Engineering'],
    'Energy Science and Engineering': ['Sustainable Energy Technologies']
  }), []);

  const departmentOptions = departments.length ? departments : fallbackDepartments;
  const branchOptions = branches.length
    ? branches
    : (joinForm.department ? (fallbackBranchMap[joinForm.department] || []) : []);
  const semesterOptions = useMemo(() => (Array.from({ length: 8 }, (_, i) => String(i + 1))), []);
  const departmentSelectOptions = useMemo(
    () => departmentOptions.map((d) => ({ value: d, label: d })),
    [departmentOptions]
  );
  const branchSelectOptions = useMemo(
    () => branchOptions.map((b) => ({ value: b, label: b })),
    [branchOptions]
  );
  const semesterSelectOptions = useMemo(
    () => semesterOptions.map((s) => ({ value: s, label: `Semester ${s}` })),
    [semesterOptions]
  );

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = window.setInterval(() => setOtpCooldown((c) => c - 1), 1000);
    return () => window.clearInterval(t);
  }, [otpCooldown]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPanelStage('idle');
      setJoinStep(1);
      setLoginLoading(false);
      setJoinLoading(false);
      setOtpCooldown(0);
      setDepartments([]);
      setBranches([]);
      setOpenSelect(null);
      setJoinForm({
        name: '',
        email: '',
        otp: ['', '', '', '', '', ''],
        department: fallbackDepartments[0] || '',
        branch: fallbackBranchMap[fallbackDepartments[0]]?.[0] || '',
        currentSemester: '',
        password: ''
      });
    }
  }, [isOpen, fallbackDepartments, fallbackBranchMap]);

  useEffect(() => {
    if (!openSelect) return;
    const handlePointerDown = (e) => {
      if (!e.target.closest('.fselect')) setOpenSelect(null);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpenSelect(null);
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [openSelect]);

  useEffect(() => {
    if (!isOpen || panel !== 'join') return;
    let alive = true;

    const loadDepartments = async () => {
      try {
        setDeptLoading(true);
        const res = await api.get('subjects/departments');
        if (!alive) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setDepartments(list);
        setJoinForm((p) => {
          if (p.department) return p;
          return { ...p, department: (list[0] || fallbackDepartments[0] || '') };
        });
      } catch {
        if (!alive) return;
        setDepartments(fallbackDepartments);
        setJoinForm((p) => {
          if (p.department) return p;
          return { ...p, department: fallbackDepartments[0] || '' };
        });
      } finally {
        if (alive) setDeptLoading(false);
      }
    };

    loadDepartments();
    return () => {
      alive = false;
    };
  }, [isOpen, panel, fallbackDepartments]);

  useEffect(() => {
    if (!isOpen || panel !== 'join') return;
    if (!joinForm.department) {
      setBranches([]);
      return;
    }

    let alive = true;
    const loadBranches = async () => {
      try {
        setBranchLoading(true);
        const res = await api.get('subjects/branches', { params: { department: joinForm.department } });
        if (!alive) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setBranches(list);
        setJoinForm((p) => {
          if (p.branch && list.includes(p.branch)) return p;
          return { ...p, branch: list[0] || (fallbackBranchMap[joinForm.department]?.[0] || '') };
        });
      } catch {
        if (!alive) return;
        const fb = fallbackBranchMap[joinForm.department] || [];
        setBranches(fb);
        setJoinForm((p) => {
          if (p.branch && fb.includes(p.branch)) return p;
          return { ...p, branch: fb[0] || '' };
        });
      } finally {
        if (alive) setBranchLoading(false);
      }
    };

    loadBranches();
    return () => {
      alive = false;
    };
  }, [isOpen, panel, joinForm.department, fallbackBranchMap]);

  const openLogin = () => {
    setPanel('login');
    setPanelStage('idle');
    setJoinStep(1);
    setJoinLoading(false);
    setOpenSelect(null);
    setLoginData({ email: '', password: '' });
    setForgotPasswordMode(false);
    setForgotStep(1);
    setShowPassword(false);
  };

  const openJoin = () => {
    setPanel('join');
    setPanelStage('idle');
    setJoinStep(1);
    setLoginLoading(false);
    setJoinLoading(false);
    setOpenSelect(null);
    setOtpCooldown(0);
    setJoinForm({
      name: '',
      email: '',
      otp: ['', '', '', '', '', ''],
      department: fallbackDepartments[0] || '',
      branch: fallbackBranchMap[fallbackDepartments[0]]?.[0] || '',
      currentSemester: '',
      password: ''
    });
    setForgotPasswordMode(false);
    setShowPassword(false);
  };

  const handleAuthSuccess = (response) => {
    const { token, name, _id, role } = response.data;
    if (typeof window !== 'undefined') {
      const userObj = { ...response.data };
      delete userObj.token;
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('userId', _id);
    }

    setPanelStage('success');
    window.setTimeout(() => {
      setPanel(null);
      if (role === 'admin') router.push('/admin/dashboard');
      else router.push('/dashboard');
    }, 900);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const studentEmailRegex = /^\d+@nitkkr\.ac\.in$/;
    if (!studentEmailRegex.test(loginData.email) && loginData.email !== 'admin.nitkkr@gmail.com') {
      toast.error('Use rollnumber@nitkkr.ac.in');
      return;
    }

    try {
      setLoginLoading(true);
      setPanelStage('loading');
      const response = await api.post('auth/login', loginData);
      handleAuthSuccess(response);
    } catch (error) {
      setPanelStage('idle');
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const scholarId = deriveRollNumberFromEmail(forgotData.email);
      if (!scholarId) {
         toast.error("Please enter a valid student email (rollnumber@nitkkr.ac.in)");
         return;
      }
      setLoginLoading(true);
      await api.post('/auth/forgot-password', { scholarId });
      toast.success('OTP sent to your email for password reset.');
      setForgotStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      const scholarId = deriveRollNumberFromEmail(forgotData.email);
      await api.post('/auth/reset-password', {
         scholarId,
         otp: forgotData.otp,
         newPassword: forgotData.newPassword
      });
      toast.success('Password has been reset successfully!');
      setForgotPasswordMode(false);
      setForgotStep(1);
      setForgotData({ email: '', otp: '', newPassword: '' });
      setPanel('login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoginLoading(false);
    }
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailRegex = /^\d+@nitkkr\.ac\.in$/;
    if (!emailRegex.test(joinForm.email)) {
      toast.error('Email must be rollnumber@nitkkr.ac.in');
      return;
    }
    if (!joinForm.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!joinForm.department) {
      toast.error('Please select your department');
      return;
    }
    if (!joinForm.branch) {
      toast.error('Please select your branch');
      return;
    }
    const sem = Number(joinForm.currentSemester);
    if (!Number.isFinite(sem) || sem < 1 || sem > 8) {
      toast.error('Please select your current semester (1-8)');
      return;
    }

    try {
      setJoinLoading(true);
      await api.post('auth/send-otp', { email: joinForm.email });
      setOtpCooldown(60);
      setJoinStep(2);
      window.setTimeout(() => otpRefs.current?.[0]?.focus?.(), 50);
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    try {
      setJoinLoading(true);
      await api.post('auth/resend-otp', { email: joinForm.email });
      setOtpCooldown(60);
      toast.success('OTP resent');
      setJoinForm((p) => ({ ...p, otp: ['', '', '', '', '', ''] }));
      window.setTimeout(() => otpRefs.current?.[0]?.focus?.(), 50);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setJoinLoading(false);
    }
  };

  const onOtpChange = (index, value) => {
    const digit = String(value || '').replace(/\D/g, '').slice(-1);
    setJoinForm((p) => {
      const next = [...p.otp];
      next[index] = digit;
      return { ...p, otp: next };
    });
    if (digit && otpRefs.current[index + 1]) otpRefs.current[index + 1].focus();
  };

  const onOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (joinForm.otp[index]) {
        setJoinForm((p) => {
          const next = [...p.otp];
          next[index] = '';
          return { ...p, otp: next };
        });
        return;
      }
      if (otpRefs.current[index - 1]) otpRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && otpRefs.current[index - 1]) otpRefs.current[index - 1].focus();
    if (e.key === 'ArrowRight' && otpRefs.current[index + 1]) otpRefs.current[index + 1].focus();
  };

  const goToStep3 = (e) => {
    e.preventDefault();
    const otp = joinForm.otp.join('');
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    setJoinStep(3);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();

    const rollNumber = deriveRollNumberFromEmail(joinForm.email);
    if (!rollNumber) {
      toast.error('Invalid email for roll number');
      return;
    }
    if (!joinForm.password || joinForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setJoinLoading(true);
      setPanelStage('loading');
      const payload = {
        name: joinForm.name,
        email: joinForm.email,
        otp: joinForm.otp.join(''),
        password: joinForm.password,
        rollNumber,
        department: joinForm.department,
        branch: joinForm.branch,
        currentSemester: Number(joinForm.currentSemester),
      };
      const response = await api.post('auth/verify-otp', payload);
      handleAuthSuccess(response);
    } catch (error) {
      setPanelStage('idle');
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setJoinLoading(false);
    }
  };

  const onJoinMouseMove = (e) => {
    const el = joinBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set((px - 0.5) * 10);
    my.set((py - 0.5) * 10);
  };

  const onJoinMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE"}>
      <div className="front-wrapper">
        <Toaster position="top-center" />
        {/* NAVIGATION BAR */}
        <nav className="front-nav">
          <div className="front-container">
            <div className="front-logo-section">
              <img src="/assets/nit-logo.png" alt="NIT Logo" className="nit-logo" />
              <div className="front-brand-text">
                <span className="nit-name">NIT Kurukshetra</span>
                <span className="portal-name">Reappear Hub</span>
              </div>
            </div>
            <div className="front-nav-links">
              <motion.button
                type="button"
                className="cta-btn cta-login"
                onClick={(e) => {
                  addRipple(e);
                  openLogin();
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="cta-text">Login</span>
              </motion.button>

              <motion.button
                ref={joinBtnRef}
                type="button"
                className="cta-btn cta-join"
                onMouseMove={onJoinMouseMove}
                onMouseLeave={onJoinMouseLeave}
                style={{ x: sx, y: sy }}
                onClick={(e) => {
                  addRipple(e);
                  openJoin();
                }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="cta-text">Join Portal</span>
              </motion.button>
            </div>
          </div>
        </nav>

      {/* HERO SECTION */}
      <header className="front-hero">
        <div className="front-hero-content">
          <div className="nit-badge">NIT KKR Official Academic Support</div>
          <h1 className="front-title">
            Master Your Backlogs <br />
            <span className="accent-red">With Confidence.</span>
          </h1>
          <p className="front-subtitle">
            The premier digital destination for NIT Kurukshetra students. 
            Automate your reappear forms, download PYQs, and find study partners in one click.
          </p>
        </div>

        {/* GLASS PREVIEW BOX */}
        <div className="front-hero-visual">
          <div className="glass-preview-card">
            <div className="glass-top">
              <div className="dot-red"></div>
              <div className="dot-amber"></div>
              <div className="dot-green"></div>
            </div>
            <div className="glass-inner">
              <div className="skeleton-header"></div>
              <div className="skeleton-row"></div>
              <div className="skeleton-grid">
                <div className="skeleton-square"></div>
                <div className="skeleton-square"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* INFO SECTION */}
      <section id="info" className="front-features">
        <div className="front-feat-card">
          <div className="icon-circle">📝</div>
          <h3>Smart Forms</h3>
          <p>Get notified as soon as NITK releases reappear forms. No more missing deadlines.</p>
        </div>
        <div className="front-feat-card">
          <div className="icon-circle">📚</div>
          <h3>PYQ Library</h3>
          <p>A curated collection of previous year questions specifically for reappear exams.</p>
        </div>
        <div className="front-feat-card">
          <div className="icon-circle">🤝</div>
          <h3>Peer Study</h3>
          <p>Don't study alone. Connect with students who share the same backlog subjects.</p>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <Footer />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setPanel(null);
            }}
          >
            <motion.aside
              className="auth-panel"
              initial={{ x: 420, opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={panel === 'login' ? 'Login' : 'Join Portal'}
            >
              <div className="panel-noise" aria-hidden="true" />

              <div className="panel-top">
                <div className="panel-title">
                  <div className="panel-title-kicker">NIT Kurukshetra</div>
                  <div className="panel-title-main">{panel === 'login' ? 'Welcome Back' : 'Join Portal'}</div>
                </div>
                <button type="button" className="panel-close" onClick={() => setPanel(null)} aria-label="Close">
                  ✕
                </button>
              </div>

              {panelStage === 'success' ? (
                <div className="panel-success">
                  <motion.div
                    className="success-check"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <svg viewBox="0 0 52 52" className="check-svg" aria-hidden="true">
                      <motion.path
                        d="M14 27 L22 35 L38 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </svg>
                  </motion.div>
                  <div className="success-text">All set.</div>
                </div>
              ) : panel === 'login' ? (
                <form className="panel-form" onSubmit={forgotPasswordMode ? (forgotStep === 1 ? handleForgotPassword : handleResetPassword) : handleLogin}>
                  {forgotPasswordMode ? (
                    forgotStep === 1 ? (
                      <>
                        <div className="field">
                          <input
                            type="email"
                            value={forgotData.email}
                            onChange={(e) => setForgotData((p) => ({ ...p, email: e.target.value }))}
                            placeholder=" "
                            autoComplete="email"
                            required
                          />
                          <label>Email (rollnumber@nitkkr.ac.in)</label>
                        </div>
                        <button className="panel-primary" type="submit" disabled={loginLoading}>
                          <span className={loginLoading ? 'btn-dots' : ''}>
                            {loginLoading ? 'Sending...' : 'Send OTP'}
                          </span>
                        </button>
                        <div className="panel-switch">
                          Remember your password?
                          <button type="button" className="panel-link" onClick={() => setForgotPasswordMode(false)}>Back to Login</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="field">
                          <input
                            type="text"
                            value={forgotData.otp}
                            onChange={(e) => setForgotData((p) => ({ ...p, otp: e.target.value }))}
                            placeholder=" "
                            maxLength={6}
                            required
                          />
                          <label>Enter OTP</label>
                        </div>
                        <div className="field" style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={forgotData.newPassword}
                            onChange={(e) => setForgotData((p) => ({ ...p, newPassword: e.target.value }))}
                            placeholder=" "
                            required
                            style={{ paddingRight: '40px' }}
                          />
                          <label>New Password</label>
                          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', zIndex: 10, fontSize: '1.2rem', userSelect: 'none' }}>
                            {showPassword ? '🙈' : '👁️'}
                          </span>
                        </div>
                        <button className="panel-primary" type="submit" disabled={loginLoading}>
                          <span className={loginLoading ? 'btn-dots' : ''}>
                            {loginLoading ? 'Resetting...' : 'Reset Password'}
                          </span>
                        </button>
                        <div className="panel-switch">
                          <button type="button" className="panel-link" onClick={() => setForgotStep(1)}>Resend OTP?</button>
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <div className="field">
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                          placeholder=" "
                          autoComplete="email"
                          required
                        />
                        <label>Email</label>
                      </div>
                      <div className="field" style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                          placeholder=" "
                          autoComplete="current-password"
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <label>Password</label>
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', zIndex: 10, fontSize: '1.2rem', userSelect: 'none' }}>
                          {showPassword ? '🙈' : '👁️'}
                        </span>
                      </div>
                      
                      <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                        <button type="button" className="panel-link" onClick={() => setForgotPasswordMode(true)}>Forgot Password?</button>
                      </div>

                      <button className="panel-primary" type="submit" disabled={loginLoading}>
                        <span className={panelStage === 'loading' ? 'btn-dots' : ''}>
                          {loginLoading ? 'Signing in' : 'Login'}
                        </span>
                      </button>

                      <div className="panel-sep"><span>or</span></div>
                      <GoogleButton onAuthSuccess={handleAuthSuccess} />

                      <div className="panel-switch">
                        New here?
                        <button type="button" className="panel-link" onClick={openJoin}>Join Portal</button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                <div className="panel-join">
                  <div className="stepbar" aria-hidden="true">
                    <motion.div
                      className="stepbar-fill"
                      initial={false}
                      animate={{ width: joinStep === 1 ? '33.333%' : (joinStep === 2 ? '66.666%' : '100%') }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {joinStep === 1 && (
                      <motion.form
                        key="join-step-1"
                        className="panel-form"
                        onSubmit={handleSendOtp}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="field">
                          <input
                            type="text"
                            value={joinForm.name}
                            onChange={(e) => setJoinForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder=" "
                            autoComplete="name"
                            required
                          />
                          <label>Name</label>
                        </div>
                        <div className="field">
                          <input
                            type="email"
                            value={joinForm.email}
                            onChange={(e) => setJoinForm((p) => ({ ...p, email: e.target.value.trim() }))}
                            placeholder=" "
                            autoComplete="email"
                            required
                          />
                          <label>Email (rollnumber@nitkkr.ac.in)</label>
                        </div>

                        <FloatingSelect
                          id="department"
                          label="Department"
                          value={joinForm.department}
                          options={departmentSelectOptions}
                          placeholder="No departments found"
                          disabled={false}
                          openSelect={openSelect}
                          setOpenSelect={setOpenSelect}
                          onChange={(val) => setJoinForm((p) => ({ ...p, department: val, branch: '' }))}
                        />

                        <FloatingSelect
                          id="branch"
                          label="Branch"
                          value={joinForm.branch}
                          options={branchSelectOptions}
                          placeholder="No branches found"
                          disabled={false}
                          openSelect={openSelect}
                          setOpenSelect={setOpenSelect}
                          onChange={(val) => setJoinForm((p) => ({ ...p, branch: val }))}
                        />

                        <FloatingSelect
                          id="semester"
                          label="Current Semester"
                          value={joinForm.currentSemester}
                          options={semesterSelectOptions}
                          placeholder="No semester options"
                          disabled={false}
                          openSelect={openSelect}
                          setOpenSelect={setOpenSelect}
                          onChange={(val) => setJoinForm((p) => ({ ...p, currentSemester: val }))}
                        />

                        <button className="panel-primary" type="submit" disabled={joinLoading}>
                          {joinLoading ? (
                            <span className="btn-loading"><span className="btn-spinner" /> Sending OTP…</span>
                          ) : (
                            'Send OTP'
                          )}
                        </button>

                        <div className="panel-switch">
                          Already registered?
                          <button type="button" className="panel-link" onClick={openLogin}>Login</button>
                        </div>
                      </motion.form>
                    )}

                    {joinStep === 2 && (
                      <motion.form
                        key="join-step-2"
                        className="panel-form"
                        onSubmit={goToStep3}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="otp-block">
                          <div className="otp-title">OTP Verification</div>
                          <div className="otp-sub">Sent to <strong>{joinForm.email}</strong></div>
                          <div className="otp-row" aria-label="OTP inputs">
                            {joinForm.otp.map((d, idx) => (
                              <input
                                key={idx}
                                ref={(el) => (otpRefs.current[idx] = el)}
                                className="otp-input"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={d}
                                onChange={(e) => onOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => onOtpKeyDown(idx, e)}
                                aria-label={`OTP digit ${idx + 1}`}
                              />
                            ))}
                          </div>
                          <div className="otp-actions">
                            <button
                              type="button"
                              className="panel-secondary"
                              onClick={() => setJoinStep(1)}
                              disabled={joinLoading}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              className="panel-secondary"
                              onClick={handleResendOtp}
                              disabled={joinLoading || otpCooldown > 0}
                            >
                              {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                            </button>
                            <button className="panel-primary otp-continue" type="submit" disabled={joinLoading}>
                              Continue
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}

                    {joinStep === 3 && (
                      <motion.form
                        key="join-step-3"
                        className="panel-form"
                        onSubmit={handleJoinSubmit}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="panel-summary">
                          <div className="panel-summary-row"><span>Name</span><strong>{joinForm.name}</strong></div>
                          <div className="panel-summary-row"><span>Email</span><strong>{joinForm.email}</strong></div>
                          <div className="panel-summary-row"><span>Department</span><strong>{joinForm.department || '-'}</strong></div>
                          <div className="panel-summary-row"><span>Branch</span><strong>{joinForm.branch || '-'}</strong></div>
                          <div className="panel-summary-row"><span>Semester</span><strong>{joinForm.currentSemester || '-'}</strong></div>
                        </div>

                        <div className="field" style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={joinForm.password}
                            onChange={(e) => setJoinForm((p) => ({ ...p, password: e.target.value }))}
                            placeholder=" "
                            autoComplete="new-password"
                            required
                            style={{ paddingRight: '40px' }}
                          />
                          <label>Password</label>
                          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '15px', cursor: 'pointer', zIndex: 10, fontSize: '1.2rem', userSelect: 'none' }}>
                            {showPassword ? '🙈' : '👁️'}
                          </span>
                        </div>

                        <div className="panel-row">
                          <button
                            type="button"
                            className="panel-secondary"
                            onClick={() => setJoinStep(2)}
                            disabled={joinLoading}
                          >
                            Back
                          </button>
                          <button className="panel-primary" type="submit" disabled={joinLoading}>
                            {joinLoading ? 'Creating account…' : 'Create Account'}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </GoogleOAuthProvider>
  );
}