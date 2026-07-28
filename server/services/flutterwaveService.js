import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';
const SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

const flw = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${SECRET_KEY}` },
});

// Creates a hosted payment link. amount/currency/customer come from the
// caller; tx_ref must be unique per attempt (controller generates it).
export async function initializePayment({ tx_ref, amount, currency = 'NGN', customer, redirect_url, meta }) {
  const { data } = await flw.post('/payments', {
    tx_ref,
    amount,
    currency,
    redirect_url,
    customer,
    meta,
    payment_options: 'card,banktransfer,ussd',
  });
  return data; // { status, message, data: { link } }
}

// Confirms a transaction server-side after Flutterwave redirects back —
// never trust the redirect query params alone, always re-verify.
export async function verifyTransaction(transactionId) {
  const { data } = await flw.get(`/transactions/${transactionId}/verify`);
  return data;
}

// Flutterwave signs webhook calls with the `verif-hash` header, which must
// equal your FLUTTERWAVE_WEBHOOK_SECRET exactly (not HMAC'd — a direct
// shared-secret match per Flutterwave's webhook docs).
export function isValidWebhookSignature(headerSignature) {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!expected || !headerSignature) return false;
  const a = Buffer.from(headerSignature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function refundTransaction(transactionId, amount) {
  const { data } = await flw.post(`/transactions/${transactionId}/refund`, amount ? { amount } : {});
  return data;
}
