// api.js: Centralized Axios instance for communicating with the Express backend
import axios from 'axios';

// Create an Axios instance with the default backend server URL
const api = axios.create({
  baseURL: 'http://localhost:5000'
});

/**
 * Request Interceptor:
 * Before every request is sent to the backend, retrieve the JWT token
 * from browser localStorage and attach it to the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Intercepts responses from the backend. If an endpoint returns 401 Unauthorized
 * (e.g. token expired or invalid), clear localStorage and redirect to /login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If not already on the login page, redirect to /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
