import React, { useEffect, useState, useCallback } from 'react';
import { adminListPayments, adminConfirmPayment, adminRejectPayment } from '../api';

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem('adminKey') || '');
  const [statusFilter, setStatusFilter] = useState('awaiting_confirmation');
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminListPayments(adminKey, statusFilter || undefined);
      setPayments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments. Check your admin key.');
    } finally {
      setLoading(false);
    }
  }, [adminKey, statusFilter]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [load]);

  function handleKeySubmit(e) {
    e.preventDefault();
    sessionStorage.setItem('adminKey', adminKey);
    load();
  }

  async function handleConfirm(id) {
    await adminConfirmPayment(adminKey, id);
    load();
  }

  async function handleReject(id) {
    await adminRejectPayment(adminKey, id);
    load();
  }

  return (
    <div style={styles.container}>
      <h2>Admin: Confirm Payments</h2>

      <form onSubmit={handleKeySubmit} style={styles.keyForm}>
        <input
          type="password"
          placeholder="Admin key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Load</button>
      </form>

      <div style={styles.filters}>
        {['pending', 'awaiting_confirmation', 'confirmed', 'rejected', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            style={{
              ...styles.filterButton,
              background: statusFilter === s ? '#1a73e8' : '#eee',
              color: statusFilter === s ? '#fff' : '#333',
            }}
          >
            {s || 'all'}
          </button>
        ))}
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p>Loading...</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Ref</th>
            <th>Amount</th>
            <th>Donor</th>
            <th>Note</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.referenceId}</td>
              <td>₹{p.amount}</td>
              <td>{p.donorName}</td>
              <td>{p.note}</td>
              <td>{p.status}</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
              <td style={styles.actions}>
                {p.status !== 'confirmed' && (
                  <button onClick={() => handleConfirm(p.id)} style={styles.confirmBtn}>Confirm</button>
                )}
                {p.status !== 'rejected' && (
                  <button onClick={() => handleReject(p.id)} style={styles.rejectBtn}>Reject</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && payments.length === 0 && <p>No payments found for this filter.</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '0 auto' },
  keyForm: { display: 'flex', gap: 8, marginBottom: 16 },
  input: { padding: 8, fontSize: 14, borderRadius: 6, border: '1px solid #ccc', flex: 1 },
  button: { padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1a73e8', color: '#fff', cursor: 'pointer' },
  filters: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterButton: { padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13 },
  error: { color: '#d93025' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  actions: { display: 'flex', gap: 6 },
  confirmBtn: { background: '#188038', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' },
  rejectBtn: { background: '#d93025', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' },
};
