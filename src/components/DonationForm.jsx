import React, { useState } from 'react';
import { createPayment } from '../api';

export default function DonationForm({ onCreated }) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const payment = await createPayment({ amount: numericAmount, donorName, note });
      onCreated(payment);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Make a Donation</h2>

      <label style={styles.label}>
        Amount (INR)
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 500"
          style={styles.input}
          required
        />
      </label>

      <label style={styles.label}>
        Your Name (optional)
        <input
          type="text"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Anonymous"
          style={styles.input}
        />
      </label>

      <label style={styles.label}>
        Message (optional)
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. For the annual fund"
          style={styles.input}
        />
      </label>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Creating...' : 'Continue to Pay'}
      </button>
    </form>
  );
}

const styles = {
  form: { maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 },
  input: { padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc' },
  button: {
    padding: 12,
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    background: '#1a73e8',
    color: '#fff',
    cursor: 'pointer',
  },
  error: { color: '#d93025', fontSize: 14 },
};
