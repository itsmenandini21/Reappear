import axios from "axios";

const api = axios.create({
  // Dynamically points to Render in production, but localhost in development!
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api', 
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const requestPath = String(config.url || '');
      const isPublicEndpoint = [
        'auth/login',
        'auth/google',
        'auth/send-otp',
        'auth/verify-otp',
        'auth/resend-otp',
        '/auth/forgot-password',
        '/auth/reset-password',
        'subjects/departments',
        'subjects/branches',
        'subjects/semesters/distinct',
      ].some((p) => requestPath.startsWith(p));

      const token = localStorage.getItem('token');
      if (token && !isPublicEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;