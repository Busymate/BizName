import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { KEYS } from '../utils/storage';
import '../styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const [subscribed, setSubscribed] = useLocalStorage(KEYS.NEWSLETTER_SUBSCRIBED, false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bn-footer">
      <div className="bn-footer-inner">
        <div className="bn-footer-col bn-footer-brand">
          <div className="bn-logo">
            <span className="bn-logo-badge">B</span>
            <span className="bn-logo-text">BizName</span>
          </div>
          <p>Everything small businesses need in one place. 100% free business tools for success.</p>
          <div className="bn-social-links">
            <a href="https://www.instagram.com/bizname_free/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
            <a href="https://x.com/bizname_" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i className="fa-brands fa-x-twitter" /></a>
            <a href="https://www.youtube.com/channel/UCxnF3mZ1PH2rYxCiZwanwrg" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
          </div>
        </div>

        <div className="bn-footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/tools">All Tools</Link>
          <Link to="/templates">Templates</Link>
          <Link to="/business-tips">Business Tips</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/about">About Us</Link>
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
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Use</Link>
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
              <button type="submit">Subscribe</button>
            </form>
          )}
          {error && <p className="bn-newsletter-error">{error}</p>}
        </div>
      </div>

      <div className="bn-footer-bottom">
        <span>© {year} BizName. All rights reserved.</span>
        <div>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
