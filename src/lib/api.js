import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // A bare "Failed to fetch" tells the user nothing. This almost always
    // means one of: the Express server (server/) isn't running, it's
    // running on a different port than VITE_API_BASE_URL, or CORS is
    // blocking it — so say that explicitly instead of the raw browser error.
    throw new Error(
      `Could not reach the API at ${API_BASE}${path}. Is the backend running ` +
      `(cd server && npm run dev)? Check VITE_API_BASE_URL in your .env matches ` +
      `where it's actually listening.`
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  initializePayment: () => request('/payments/initialize', { method: 'POST' }),
  verifyPayment: (transactionId) => request(`/payments/verify/${transactionId}`),
  paymentHistory: () => request('/payments/history'),
  paymentStatus: (txRef) => request(`/payments/status/${txRef}`),
  getQuota: () => request('/quota'),
  consumeQuota: (kind) => request('/quota/consume', { method: 'POST', body: { kind } }),
};
