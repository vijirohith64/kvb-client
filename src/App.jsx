import React, { useState } from 'react';
// GitHub Pages doesn't support SPA rewrites, so refresh/direct visits to
// /admin would 404. Use HashRouter so all routes live under /#/... and
// the static host always serves index.html for any path.
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import DonationForm from './components/DonationForm';
import PaymentStatus from './components/PaymentStatus';
import AdminPanel from './components/AdminPanel';

function DonatePage() {
  const [payment, setPayment] = useState(null);

  return (
    <div style={{ padding: '40px 16px' }}>
      {!payment ? (
        <DonationForm onCreated={setPayment} />
      ) : (
        <PaymentStatus payment={payment} onReset={() => setPayment(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Donate</Link>
        <Link to="/admin" style={styles.navLink}>Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<DonatePage />} />
        <Route path="/admin" element={<div style={{ padding: '40px 16px' }}><AdminPanel /></div>} />
      </Routes>
    </HashRouter>
  );
}

const styles = {
  nav: { display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #eee' },
  navLink: { textDecoration: 'none', color: '#1a73e8', fontWeight: 600 },
};
