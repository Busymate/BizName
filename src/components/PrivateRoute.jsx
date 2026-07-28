import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any route that needs a logged-in user (Dashboard, saved
// invoices/receipts, inventory, CRM, reports, referral dashboard).
// Public tools stay outside this — they're never wrapped in it.
export default function PrivateRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
