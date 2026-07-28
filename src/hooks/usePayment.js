import { useState } from 'react';
import { api } from '../lib/api';

// Drives the "Upgrade to Premium" flow: initialize on the server, redirect
// to Flutterwave's hosted page, then verify on return. The public key is
// only needed here if you switch to Flutterwave's inline modal instead of
// the hosted redirect — this hook uses the redirect flow, so no key is
// needed on the frontend at all.
export default function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startPayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.initializePayment();
      if (res?.data?.link) {
        window.location.href = res.data.link; // Flutterwave hosted checkout
      } else {
        throw new Error('Flutterwave did not return a payment link');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return { startPayment, loading, error };
}
