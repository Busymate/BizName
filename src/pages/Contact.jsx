import { useState } from 'react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import AdSlot from '../components/AdSlot';
import { sendSupportMessage } from '../utils/emailClient';
import '../styles/Contact.css';

const FAQS = [
  { q: 'Is BizName really free to use?', a: 'Yes — every tool, template, article, business tip, and the AI Business Assistant are all completely free, with no premium tier, no usage caps, and no hidden charges.' },
  { q: 'Is my data safe?', a: 'Your invoices, receipts, customers, and saved items are stored securely in our backend (Supabase), protected by row-level security so only you can ever read or write your own data. We never sell or share your business data.' },
  { q: 'Do I need to create an account?', a: 'No account is required to use the calculators and generators. A free account lets you save invoices, receipts, calculations, and templates to Saved Items, access them from any device, and use the Dashboard, Customers, and AI Assistant.' },
  { q: 'Will my data sync across my devices?', a: "Yes. Because everything is stored in our backend instead of your browser, anything you save — invoices, receipts, customers, saved items — is available the moment you log in on any device, and updates live if you have it open in more than one tab." },
  { q: 'What can the AI Business Assistant see about my business?', a: "When you're logged in, the AI Assistant can see a summary of your own invoices, receipts, customers, and saved items to give grounded, specific answers — it never has access to any other user's data." },
  { q: 'Is there a limit to how many tools, templates, or articles I can use?', a: 'No. BizName no longer has daily limits — use as many tools, templates, articles, and business tips as you want. The Dashboard still shows a running count of what you\'ve used today, purely for your own visibility.' },
  { q: 'Can I use BizName on my phone?', a: 'Yes, BizName is fully responsive and works on desktop, tablet and mobile devices.' },
  { q: 'How do I request a new tool?', a: 'Use the feedback form below or the "Request a Tool" button on the Tools page to tell us what you need.' },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSendError('');
    const form = e.target;
    const name = form[0].value;
    const email = form[1].value;
    const message = form[2].value;
    setSending(true);
    try {
      await sendSupportMessage({ name, email, message });
      setSupportSubmitted(true);
    } catch (err) {
      setSendError(err.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  return (
    <div className="bn-container bn-contact-page">
      <SEO title="Contact Us" description="Get in touch with the BizName team — support, feedback, and business hours." path="/contact" />

      <div className="bn-contact-header">
        <h1>Contact <span className="bn-text-accent">Us</span></h1>
        <p>We'd love to hear from you. Reach out with questions, feedback, or ideas.</p>
      </div>

      <AdSlot type="banner" label="Advertisement" />

      <div className="bn-contact-grid">
        <div className="bn-card">
          <h3><i className="fa-solid fa-headset" /> Email Support</h3>
          {supportSubmitted ? (
            <div className="bn-form-success"><i className="fa-solid fa-circle-check" /> Thanks! We reply to every message we receive.</div>
          ) : (
            <form onSubmit={handleSupportSubmit}>
              <div className="bn-input-group">
                <label>Your Name</label>
                <input type="text" required placeholder="John Doe" />
              </div>
              <div className="bn-input-group">
                <label>Email Address</label>
                <input type="email" required placeholder="john@example.com" />
              </div>
              <div className="bn-input-group">
                <label>Message</label>
                <textarea rows="4" required placeholder="How can we help?" />
              </div>
              {sendError && <p className="bn-newsletter-error">{sendError}</p>}
              <Button type="submit" variant="primary" disabled={sending}>
                {sending ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          )}
        </div>

        <div className="bn-card">
          <h3><i className="fa-solid fa-comment-dots" /> Feedback Form</h3>
          {feedbackSubmitted ? (
            <div className="bn-form-success"><i className="fa-solid fa-circle-check" /> Thank you for your feedback!</div>
          ) : (
            <form onSubmit={handleFeedbackSubmit}>
              <div className="bn-input-group">
                <label>What could we improve?</label>
                <textarea rows="3" required placeholder="Share your suggestion..." />
              </div>
              <div className="bn-input-group">
                <label>Rate your experience</label>
                <select>
                  <option>⭐⭐⭐⭐⭐ Excellent</option>
                  <option>⭐⭐⭐⭐ Good</option>
                  <option>⭐⭐⭐ Average</option>
                  <option>⭐⭐ Poor</option>
                </select>
              </div>
              <Button type="submit" variant="outline">Submit Feedback</Button>
            </form>
          )}
        </div>

        <div className="bn-card bn-contact-hours">
          <h3><i className="fa-solid fa-headset" /> We're Always Here</h3>
          <p className="bn-hours-note">There are no fixed business hours — every message you send goes straight to our inbox and we reply to all of them as soon as we can, every day of the week.</p>
        </div>
      </div>

      <h2 className="bn-tips-subhead" id="faq" style={{ scrollMarginTop: '5.5rem' }}>Frequently Asked Questions</h2>
      <div className="bn-faq-list">
        {FAQS.map((faq, i) => (
          <div className="bn-faq-item" key={faq.q}>
            <button className="bn-faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} type="button">
              {faq.q}
              <i className={`fa-solid fa-chevron-${openFaq === i ? 'up' : 'down'}`} />
            </button>
            {openFaq === i && <p className="bn-faq-answer">{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
