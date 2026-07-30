import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import AuthLayout from '../components/AuthLayout';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', referred_by: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(form.email, form.password, form.full_name, form.referred_by.trim() || undefined);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <SEO title="Sign Up" description="Create your free BizName account." path="/signup" />
      <AuthLayout
        variant="signup"
        title="Run your business smarter"
        subtitle="Invoices, receipts, calculators and more — all in one place, free to start."
        footer={
          <div className="bn-referral-rewards-box">
            <div className="bn-referral-rewards-icon">
              <i className="fa-solid fa-star" />
            </div>
            <div>
              <strong>Referral Rewards</strong>
              <p>
                For every friend you refer who signs up, you'll get <strong>1 additional tool</strong>,{' '}
                <strong>1 additional article</strong> and <strong>1 additional template</strong> per day added to
                your account limits!
              </p>
            </div>
          </div>
        }
      >
        <h1 className="bn-auth-form-title">Create your account</h1>
        <p className="bn-auth-subtitle">Join thousands of business owners using BizName to grow smarter.</p>

        <form onSubmit={handleSubmit}>
          <div className="bn-input-group bn-input-icon-group">
            <i className="fa-regular fa-user" />
            <input
              type="text"
              autoComplete="name"
              required
              placeholder="Full Name"
              value={form.full_name}
              onChange={update('full_name')}
            />
          </div>
          <div className="bn-input-group bn-input-icon-group">
            <i className="fa-regular fa-envelope" />
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={update('email')}
            />
          </div>
          <div className="bn-input-group bn-input-icon-group">
            <i className="fa-solid fa-lock" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
            />
            <button type="button" className="bn-input-toggle" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
              <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          <div className="bn-input-group bn-input-icon-group">
            <i className="fa-solid fa-lock" />
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={update('confirm_password')}
            />
            <button type="button" className="bn-input-toggle" onClick={() => setShowConfirm((s) => !s)} aria-label="Toggle confirm password visibility">
              <i className={`fa-regular ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>

          <div className="bn-referral-inline-box">
            <div className="bn-input-group bn-input-icon-group">
              <i className="fa-solid fa-gift" />
              <input
                type="text"
                placeholder="Enter referral code (e.g. JOHN2025)"
                value={form.referred_by}
                onChange={update('referred_by')}
              />
            </div>
            <p>Referral Code (Optional) — if you have a referral code, enter it here to unlock rewards.</p>
          </div>

          {error && <p className="bn-newsletter-error">{error}</p>}

          <button type="submit" className="bn-auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="bn-auth-footer-link">Already have an account? <Link to="/login">Login</Link></p>
      </AuthLayout>
    </>
  );
}
