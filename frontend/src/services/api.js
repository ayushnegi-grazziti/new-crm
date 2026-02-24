import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles this in Vite
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Add JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle authentication errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only handle 401 if it's NOT a login attempt itself
        const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/firebase-login');

        if (error.response?.status === 401 && !isLoginRequest) {
            console.error('Session expired or invalid. Clearing storage and redirecting.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login to force fresh session. 
            // The ?expired=true can be used to show a message on the login page.
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
