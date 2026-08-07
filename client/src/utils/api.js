import axios from 'axios';

import { Capacitor } from '@capacitor/core';

const getBaseUrl = () => {
  if (Capacitor.isNativePlatform()) {
    // If using a physical device on the same Wi-Fi network, use the computer's IP address
    return 'http://192.168.137.1:5000/api';
    
    // Alternatively, if using the Android Emulator, use:
    // return 'http://10.0.2.2:5000/api';
    
    // Alternatively, if using your localtunnel, use:
    // return 'https://ripe-games-shake.loca.lt/api';
  }
  return 'http://127.0.0.1:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to home
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
