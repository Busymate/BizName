import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendSupportMessage } from '../utils/emailClient';
import SEO from '../components/SEO';
import '../styles/BusinessSuite.css';

export default function Support() {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendSupportMessage({ name: profile?.full_name || 'BizName user', email: profile?.email, message });
      setSent(true);
      setMessage('');
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bn-container" style={{ maxWidth: 640, margin: 0, padding: 0 }}>
      <SEO title="Support" description="Get help with your BizName account." path="/support" />
      <h1 style={{ marginBottom: '0.25rem' }}>Support</h1>
      <p style={{ color: 'var(--bn-text-secondary)', marginBottom: '1.75rem' }}>
        Have a question or ran into an issue? Send us a message and we'll reply to {profile?.email || 'your account email'}.
      </p>

      <div className="bn-dashboard-card">
        {sent ? (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--bn-success)', fontSize: '1.2rem' }} />
            <p style={{ margin: 0 }}>Thanks — we've received your message and will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div className="bn-input-group">
              <label>How can we help?</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue…"
                required
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10, border: '1.5px solid var(--bn-border)', background: 'var(--bn-bg)', color: 'var(--bn-text)', fontFamily: 'inherit', fontSize: '0.95rem' }}
              />
            </div>
            {error && <p className="bn-newsletter-error">{error}</p>}
            <button type="submit" className="bn-auth-submit" style={{ width: 'fit-content' }} disabled={sending}>
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>

      <p style={{ marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--bn-text-secondary)' }}>
        Looking for FAQs? Visit the <Link to="/contact">Contact &amp; Help</Link> page.
      </p>
    </div>
  );
}
