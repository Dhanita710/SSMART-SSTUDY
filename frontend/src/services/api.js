import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Request interceptor to add Firebase token
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('firebase_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Just log the error, don't redirect
        if (error.response?.status === 401) {
            console.log('API 401 error:', error.response);
        }
        return Promise.reject(error);
    }
);

export default api;
