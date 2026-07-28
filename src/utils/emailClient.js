// Thin wrapper around EmailJS so Contact.jsx and Footer.jsx don't each
// duplicate config/error handling. Requires the following Vite env vars
// (see .env.example): VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID,
// VITE_EMAILJS_TEMPLATE_ID (support form) and
// VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID (subscriber confirmation).
// Sign up free at https://www.emailjs.com to get these values.
import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const SUPPORT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const NEWSLETTER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID;

// Where every Contact-page message gets delivered.
export const SUPPORT_INBOX = 'bizname.com.ng@gmail.com';

function assertConfigured(templateId, label) {
  if (!PUBLIC_KEY || !SERVICE_ID || !templateId) {
    throw new Error(
      `EmailJS is not configured (${label}). Add VITE_EMAILJS_PUBLIC_KEY, ` +
      `VITE_EMAILJS_SERVICE_ID and the relevant template id to client/.env`
    );
  }
}

// EmailJS's SDK rejects with an object shaped like { status, text }, not a
// standard Error with .message — so err.message was showing as
// "undefined" or generic in the UI even when EmailJS gave a specific,
// useful reason (e.g. "The recipients address is empty" — the exact
// message EmailJS returns when a template's "To Email" field isn't set).
// This normalizes it to a real Error so callers' err.message always works.
async function sendViaEmailJs(templateId, params) {
  try {
    return await emailjs.send(SERVICE_ID, templateId, params, { publicKey: PUBLIC_KEY });
  } catch (err) {
    const reason = err?.text || err?.message || 'Unknown EmailJS error';
    console.error('[EmailJS] send failed:', { status: err?.status, text: err?.text, raw: err });
    throw new Error(reason);
  }
}

// Sends whatever the user typed straight to bizname.com.ng@gmail.com.
// Your EmailJS template should reference {{from_name}}, {{from_email}},
// {{message}}, {{to_email}}.
export async function sendSupportMessage({ name, email, message }) {
  assertConfigured(SUPPORT_TEMPLATE_ID, 'support template');
  return sendViaEmailJs(SUPPORT_TEMPLATE_ID, { from_name: name, from_email: email, message, to_email: SUPPORT_INBOX });
}

// Sends a confirmation email back to the person who just subscribed.
// Template should reference {{to_email}}.
export async function sendNewsletterConfirmation(subscriberEmail) {
  assertConfigured(NEWSLETTER_TEMPLATE_ID, 'newsletter template');
  return sendViaEmailJs(NEWSLETTER_TEMPLATE_ID, { to_email: subscriberEmail });
}
