import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';
let userId = localStorage.getItem('sme_userId') || '';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  if (userId) {
    config.headers['x-demo-user-id'] = userId;
  }
  return config;
});

export function setUserId(value: string): void {
  userId = value;
  localStorage.setItem('sme_userId', value);
}

export function getUserId(): string {
  return userId;
}

export async function getJson<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await client.get<T>(url, { params });
  return response.data;
}

export async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await client.post<T>(url, payload);
  return response.data;
}

export async function patchJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await client.patch<T>(url, payload);
  return response.data;
}
