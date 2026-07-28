import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { KEYS } from '../utils/storage';
import { sendNewsletterConfirmation } from '../utils/emailClient';
import { APP_VERSION, BUILD_NUMBER } from '../config/version';
import '../styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const [subscribed, setSubscribed] = useLocalStorage(KEYS.NEWSLETTER_SUBSCRIBED, false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await sendNewsletterConfirmation(trimmed);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      // Surface the real failure instead of pretending it worked — a
      // silent catch here was the bug: it showed "You're subscribed"
      // even when EmailJS never actually sent anything.
      setError(err.message || 'Could not subscribe right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="bn-footer">
      <div className="bn-footer-inner">
        <div className="bn-footer-col bn-footer-brand">
          <div className="bn-logo">
            <span className="bn-logo-badge">B</span>
            <span className="bn-logo-text">BizName</span>
          </div>
          <p>Everything small businesses need in one place — 100% free business tools, templates and an AI assistant.</p>
          <div className="bn-footer-badges">
            <span><i className="fa-solid fa-circle-check" /> 100% Free</span>
            <span><i className="fa-solid fa-lock" /> Secure by Supabase</span>
          </div>
          <div className="bn-social-links">
            <a href="https://www.instagram.com/bizname_free/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
            <a href="https://x.com/bizname_" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i className="fa-brands fa-x-twitter" /></a>
            <a href="https://www.youtube.com/channel/UCxnF3mZ1PH2rYxCiZwanwrg" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
          </div>
        </div>

        <div className="bn-footer-col">
          <h4>Product</h4>
          <Link to="/">Home</Link>
          <Link to="/tools">All Tools</Link>
          <Link to="/templates">Templates</Link>
          <Link to="/ai-assistant">AI Business Assistant</Link>
          <Link to="/business-tips">Business Tips</Link>
          <Link to="/blog">Blog</Link>
        </div>

        <div className="bn-footer-col">
          <h4>Categories</h4>
          <Link to="/tools?category=Financial%20Tools">Financial Tools</Link>
          <Link to="/tools?category=Invoice%20%26%20Documents">Invoice &amp; Documents</Link>
          <Link to="/tools?category=Marketing%20Tools">Marketing Tools</Link>
          <Link to="/tools?category=QR%20%26%20Barcode%20Tools">QR Tools</Link>
          <Link to="/tools">All Categories</Link>
        </div>

        <div className="bn-footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/contact#faq">FAQ</Link>
          <Link to="/support">Support</Link>
          <Link to="/referrals">Referral Program</Link>
          <Link to="/whats-new">What's New</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Use</Link>
          <a href="/sitemap.xml">Sitemap</a>
        </div>

        <div className="bn-footer-col bn-footer-newsletter">
          <h4>Newsletter</h4>
          <p>Get the latest tips and tools straight to your inbox.</p>
          {subscribed ? (
            <div className="bn-newsletter-success">
              <i className="fa-solid fa-circle-check" /> You're subscribed. Thanks!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="bn-newsletter-form" noValidate>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                required
              />
              <button type="submit" disabled={sending}>{sending ? 'Subscribing…' : 'Subscribe'}</button>
            </form>
          )}
          {error && <p className="bn-newsletter-error">{error}</p>}
        </div>
      </div>

      <div className="bn-footer-bottom">
        <span>© {year} BizName. All rights reserved.</span>
        <div className="bn-footer-bottom-links">
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Use</Link>
        </div>
        <Link to="/whats-new" className="bn-footer-version" title="View changelog">
          v{APP_VERSION} <span className="bn-footer-build">· Build {BUILD_NUMBER}</span>
        </Link>
      </div>
    </footer>
  );
}
