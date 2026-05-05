import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const userId = localStorage.getItem('demoUserId') || import.meta.env.VITE_DEMO_USER_ID || '';
  if (userId) {
    config.headers['x-demo-user-id'] = userId;
  }
  return config;
});

export default client;
