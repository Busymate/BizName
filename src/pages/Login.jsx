import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Supabase's client persists sessions to localStorage by default, so
    // "remember me" is effectively always on at the SDK level. We record
    // the user's preference so a future session-expiry check (or a
    // custom storage adapter) can honor "don't remember me" by switching
    // to sessionStorage instead. Safe no-op today, useful hook later.
    try {
      window.localStorage.setItem('bn-remember-me', remember ? '1' : '0');
    } catch {
      /* ignore — private browsing etc. */
    }
    const { error: signInError } = await login(email, password);
    setLoading(false);
    if (signInError) return setError(signInError.message);
    navigate('/dashboard');
  };


  return (
    <>
      <SEO title="Log In" description="Log in to your BizName account." path="/login" />
      <AuthLayout
        variant="login"
        title="Welcome back"
        subtitle="Login to access your saved tools and dashboard, right where you left off."
      >
        <h1 className="bn-auth-form-title">Welcome back!</h1>
        <p className="bn-auth-subtitle">Login to your account to continue using BizName.</p>

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
          <div className="bn-input-group bn-input-icon-group">
            <i className="fa-solid fa-lock" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="bn-input-toggle" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
              <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>

          <div className="bn-auth-row-between">
            <label className="bn-checkbox-label">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" className="bn-auth-inline-link">Forgot password?</Link>
          </div>

          {error && <p className="bn-newsletter-error">{error}</p>}

          <button type="submit" className="bn-auth-submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="bn-auth-footer-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </AuthLayout>
    </>
  );
}
