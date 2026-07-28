import usePayment from '../hooks/usePayment';
import Button from './Button';

// Drop this anywhere a logged-in free user should see an upgrade CTA
// (₦1000 / 3 months, per the plan enforced server-side in paymentController.js).
export default function PaymentButton() {
  const { startPayment, loading, error } = usePayment();

  return (
    <div>
      <Button variant="primary" onClick={startPayment} disabled={loading}>
        {loading ? 'Redirecting to payment…' : 'Upgrade to Premium — ₦1000 / 3 months'}
      </Button>
      {error && <p className="bn-newsletter-error">{error}</p>}
    </div>
  );
}
