import axios from 'axios';

// The React app is hosted on GitHub Pages and the API runs on a separate
// host (Render / Railway / Fly / etc.). Set REACT_APP_API_URL in the
// client repo (e.g. via `.env.production` or `.env.local`) to the
// deployed backend URL. For local dev, run `npm run dev` in `server/`
// alongside `npm start` in `client/`.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: API_URL });

export function createPayment({ amount, donorName, note }) {
  return api.post('/api/payments', { amount, donorName, note }).then((r) => r.data);
}

export function getPayment(id) {
  return api.get(`/api/payments/${id}`).then((r) => r.data);
}

export function markPaid(id) {
  return api.post(`/api/payments/${id}/mark-paid`).then((r) => r.data);
}

export function adminListPayments(adminKey, status) {
  return api
    .get('/api/payments/admin/list', {
      headers: { 'x-admin-key': adminKey },
      params: status ? { status } : {},
    })
    .then((r) => r.data);
}

export function adminConfirmPayment(adminKey, id) {
  return api
    .post(`/api/payments/admin/${id}/confirm`, null, { headers: { 'x-admin-key': adminKey } })
    .then((r) => r.data);
}

export function adminRejectPayment(adminKey, id) {
  return api
    .post(`/api/payments/admin/${id}/reject`, null, { headers: { 'x-admin-key': adminKey } })
    .then((r) => r.data);
}

export default api;
