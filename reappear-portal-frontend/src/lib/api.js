import axios from "axios";

const api = axios.create({
  // Changed 5000 to 5001!
  baseURL: 'http://localhost:5001/api', 
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;