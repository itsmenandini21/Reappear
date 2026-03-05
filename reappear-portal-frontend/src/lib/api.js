import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        //Every request will carry the token automatically instead of manual writing
      config.headers.Authorization = `Bearer ${token}`; //token format
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;