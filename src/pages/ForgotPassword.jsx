import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await resetPassword(email);
    setLoading(false);
    if (resetError) return setError(resetError.message);
    setSent(true);
  };

  return (
    <>
      <SEO title="Forgot Password" description="Reset your BizName account password." path="/forgot-password" />
      <AuthLayout
        variant="login"
        title="Forgot your password?"
        subtitle="No worries — we'll send a secure reset link to your email."
      >
        <h1 className="bn-auth-form-title">Reset your password</h1>
        <p className="bn-auth-subtitle">Enter the email address linked to your account.</p>

        {sent ? (
          <div className="bn-auth-success-box">
            <i className="fa-solid fa-circle-check" />
            <p>
              If an account exists for <strong>{email}</strong>, a password reset link is on its way. Check your
              inbox (and spam folder).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bn-input-group bn-input-icon-group">
              <i className="fa-regular fa-envelope" />
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="bn-newsletter-error">{error}</p>}
            <button type="submit" className="bn-auth-submit" disabled={loading}>
              {loading ? 'Sending link…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="bn-auth-footer-link">
          <Link to="/login"><i className="fa-solid fa-arrow-left" /> Back to login</Link>
        </p>
      </AuthLayout>
    </>
  );
}
