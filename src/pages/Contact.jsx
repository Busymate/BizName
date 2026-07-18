import { useState } from 'react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import '../styles/Contact.css';

const FAQS = [
  { q: 'Is BizName really free to use?', a: 'Yes. Every tool and template on BizName is 100% free, with no sign-up required and no hidden charges.' },
  { q: 'Is my data safe?', a: 'All calculations run in your browser and are stored only on your device using local storage. We never see or store your business data on a server.' },
  { q: 'Do I need to create an account?', a: 'No account is required to use any tool. Some optional features, like saving favorites across devices, may require an account in the future.' },
  { q: 'Can I use BizName on my phone?', a: 'Yes, BizName is fully responsive and works on desktop, tablet and mobile devices.' },
  { q: 'How do I request a new tool?', a: 'Use the feedback form below or the "Request a Tool" button on the Tools page to tell us what you need.' },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportSubmitted(true);
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

      <div className="bn-contact-grid">
        <div className="bn-card">
          <h3><i className="fa-solid fa-headset" /> Email Support</h3>
          {supportSubmitted ? (
            <div className="bn-form-success"><i className="fa-solid fa-circle-check" /> Thanks! We'll get back to you within 24 hours.</div>
          ) : (
            <form onSubmit={handleSupportSubmit}>
              <div className="bn-input-group">
                <label>Your Name</label>
                <input type="text" required placeholder="John Doe" />
              </div>
              <div className="bn-input-group">
                <label>Email Address</label>
                <input type="email" required placeholder="john@bizname.com" />
              </div>
              <div className="bn-input-group">
                <label>Message</label>
                <textarea rows="4" required placeholder="How can we help?" />
              </div>
              <Button type="submit" variant="primary">Send Message</Button>
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
          <h3><i className="fa-solid fa-clock" /> Business Hours</h3>
          <div className="bn-hours-row"><span>Monday – Friday</span><span>9:00 AM – 6:00 PM</span></div>
          <div className="bn-hours-row"><span>Saturday</span><span>10:00 AM – 2:00 PM</span></div>
          <div className="bn-hours-row"><span>Sunday</span><span>Closed</span></div>
          <p className="bn-hours-note">We typically respond to emails within 24 business hours.</p>
        </div>
      </div>

      <h2 className="bn-tips-subhead">Frequently Asked Questions</h2>
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
