import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getPayment, markPaid } from '../api';

const STATUS_LABELS = {
  pending: { text: 'Waiting for payment', color: '#e37400' },
  awaiting_confirmation: { text: 'Payment claimed — awaiting admin confirmation', color: '#e37400' },
  confirmed: { text: 'Payment confirmed. Thank you!', color: '#188038' },
  rejected: { text: 'Payment not confirmed. Please contact us.', color: '#d93025' },
};

export default function PaymentStatus({ payment: initialPayment, onReset }) {
  const [payment, setPayment] = useState(initialPayment);
  const [marking, setMarking] = useState(false);

  const poll = useCallback(async () => {
    try {
      const latest = await getPayment(initialPayment.id);
      setPayment(latest);
    } catch (err) {
      // silently ignore transient poll errors
    }
  }, [initialPayment.id]);

  useEffect(() => {
    if (payment.status === 'confirmed' || payment.status === 'rejected') return;
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [poll, payment.status]);

  async function handleMarkPaid() {
    setMarking(true);
    try {
      const updated = await markPaid(payment.id);
      setPayment(updated);
    } finally {
      setMarking(false);
    }
  }

  const statusInfo = STATUS_LABELS[payment.status] || STATUS_LABELS.pending;

  return (
    <div style={styles.container}>
      <h2>Scan or Tap to Pay</h2>
      <p style={styles.amount}>₹{payment.amount}</p>

      <div style={styles.qrWrap}>
        <QRCodeSVG value={payment.upiLink} size={220} />
      </div>

      <a href={payment.upiLink} style={styles.payButton}>
        Pay with UPI App (Google Pay / any)
      </a>

      <p style={styles.hint}>
        On a phone, tap the button above to open Google Pay or your UPI app directly. On desktop,
        scan the QR code with any UPI app.
      </p>

      <div style={{ ...styles.statusBox, borderColor: statusInfo.color }}>
        <strong style={{ color: statusInfo.color }}>{statusInfo.text}</strong>
        <div style={styles.refRow}>Reference: {payment.referenceId}</div>
      </div>

      {payment.status === 'pending' && (
        <button onClick={handleMarkPaid} disabled={marking} style={styles.confirmButton}>
          {marking ? 'Submitting...' : "I've Paid"}
        </button>
      )}

      <p style={styles.note}>
        Note: this is a manual-confirmation flow. There is no automatic payment verification —
        once you tap "I've Paid", an admin will check their bank/UPI statement for this amount and
        reference, then confirm it here.
      </p>

      <button onClick={onReset} style={styles.linkButton}>
        Start a new donation
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: 420, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 },
  amount: { fontSize: 28, fontWeight: 700, margin: 0 },
  qrWrap: { display: 'flex', justifyContent: 'center', padding: 16, background: '#fff', borderRadius: 8 },
  payButton: {
    display: 'inline-block',
    padding: '12px 20px',
    background: '#1a73e8',
    color: '#fff',
    borderRadius: 6,
    textDecoration: 'none',
    fontWeight: 600,
  },
  hint: { fontSize: 13, color: '#5f6368' },
  statusBox: { border: '1px solid', borderRadius: 8, padding: 12 },
  refRow: { fontSize: 12, color: '#5f6368', marginTop: 4 },
  confirmButton: {
    padding: 12,
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    background: '#188038',
    color: '#fff',
    cursor: 'pointer',
  },
  note: { fontSize: 12, color: '#5f6368' },
  linkButton: { background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline' },
};
