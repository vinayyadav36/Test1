import axios from 'axios';

const LOCAL_FALLBACK_URL = 'http://localhost:4000';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function resolveApiBaseUrl(value?: string): string {
  const raw = value?.trim();
  if (!raw) {
    return LOCAL_FALLBACK_URL;
  }

  if (raw.startsWith('/')) {
    return raw;
  }

  try {
    const parsedUrl = new URL(raw);
    if (LOCAL_HOSTS.has(parsedUrl.hostname)) {
      return raw;
    }
  } catch (error) {
    void error;
  }

  return LOCAL_FALLBACK_URL;
}

const BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL);
let demoUserId = localStorage.getItem('demoUserId') || import.meta.env.VITE_DEMO_USER_ID || '';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  if (demoUserId) {
    config.headers['x-demo-user-id'] = demoUserId;
  }
  return config;
});

export function setDemoUserId(value: string): void {
  demoUserId = value;
  localStorage.setItem('demoUserId', value);
}

export function getDemoUserId(): string {
  return demoUserId;
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
