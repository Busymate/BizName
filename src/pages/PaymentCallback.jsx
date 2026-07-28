import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import SEO from '../components/SEO';

// Flutterwave redirects here with ?transaction_id=... — we re-verify
// server-side rather than trusting the query string.
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking | success | failed

  useEffect(() => {
    const transactionId = params.get('transaction_id');
    if (!transactionId) { setStatus('failed'); return; }
    api.verifyPayment(transactionId)
      .then((res) => setStatus(res.successful ? 'success' : 'failed'))
      .catch(() => setStatus('failed'));
  }, [params]);

  return (
    <div className="bn-container" style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
      <SEO title="Payment Status" description="Confirming your BizName premium payment." path="/payment/callback" />
      {status === 'checking' && <p>Confirming your payment…</p>}
      {status === 'success' && <><h2>Payment successful 🎉</h2><p>Your account has been upgraded to Premium.</p></>}
      {status === 'failed' && <><h2>Payment could not be confirmed</h2><p>If you were charged, contact support and we'll sort it out.</p></>}
      <p><Link to="/dashboard">Go to dashboard</Link></p>
    </div>
  );
}
