/**
 * SABLE API Client
 *
 * To switch from the mock service layer to a real Express/MERN API:
 * 1. Set VITE_USE_MOCK=false and VITE_API_URL=https://your-api.com/api/v1 in .env
 *    (or flip USE_MOCK below to false).
 * 2. Every function in src/api/*.js returns the standard REST envelope: { data, meta }.
 */

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function simulateLatency(min = 300, max = 600) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createResponse(data, meta = {}) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      source: USE_MOCK ? 'mock' : 'api',
      ...meta,
    },
  };
}

export function getAuthToken() {
  const direct = window.localStorage.getItem('sable_token');
  if (direct) return direct;
  try {
    const raw = window.localStorage.getItem('sable-auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.state?.token || null;
    }
  } catch {}
  return null;
}

export async function httpRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}
