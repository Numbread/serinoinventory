// api.js: Centralized Axios instance for communicating with the Express backend
import axios from 'axios';

// When running local Vite dev server (port 5173), point to backend port 5000.
// When deployed online (e.g. on Render), use relative URL '' so frontend and backend work on the same domain without CORS!
const backendURL =
  window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:5000'
    : '';

const api = axios.create({
  baseURL: backendURL
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
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
