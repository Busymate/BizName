import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import {
  initializePayment,
  verifyTransaction,
  isValidWebhookSignature,
  refundTransaction,
} from '../services/flutterwaveService.js';

const PREMIUM_PLAN = { amountNaira: 1000, days: 90 }; // #1000 / 3 months

// POST /api/payments/initialize  (auth required)
export async function initialize(req, res, next) {
  try {
    const user = req.user;
    const tx_ref = `bizname-${user.id}-${uuidv4()}`;

    const { data: txRow, error: insertErr } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        tx_ref,
        amount: PREMIUM_PLAN.amountNaira,
        currency: 'NGN',
        status: 'pending',
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    const fwResponse = await initializePayment({
      tx_ref,
      amount: PREMIUM_PLAN.amountNaira,
      currency: 'NGN',
      customer: { email: user.email, name: user.full_name || user.email },
      redirect_url: `${process.env.CLIENT_URL}/payment/callback`,
      meta: { user_id: user.id, plan: 'premium_quarterly' },
    });

    return res.status(200).json({ ...fwResponse, tx_ref, transaction_id: txRow.id });
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/verify/:transactionId  (auth required)
// Called by the frontend after Flutterwave redirects back — re-checks the
// truth with Flutterwave itself rather than trusting the redirect params.
export async function verify(req, res, next) {
  try {
    const { transactionId } = req.params;
    const result = await verifyTransaction(transactionId);
    const successful =
      result?.status === 'success' &&
      result?.data?.status === 'successful' &&
      result?.data?.amount >= PREMIUM_PLAN.amountNaira &&
      result?.data?.currency === 'NGN';

    const tx_ref = result?.data?.tx_ref;
    if (!tx_ref) return res.status(400).json({ error: 'No tx_ref returned by Flutterwave' });

    await applyVerifiedTransaction({ tx_ref, transactionId, successful, raw: result?.data });

    return res.status(200).json({ successful, data: result?.data });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/webhook  (no auth — verified via verif-hash header)
export async function webhook(req, res, next) {
  try {
    const signature = req.headers['verif-hash'];
    if (!isValidWebhookSignature(signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (event.event === 'charge.completed' && event.data) {
      const { tx_ref, id: transactionId, status, amount, currency } = event.data;
      const successful = status === 'successful' && amount >= PREMIUM_PLAN.amountNaira && currency === 'NGN';
      // Always re-verify server-to-server before trusting the webhook body.
      const verified = await verifyTransaction(transactionId);
      const doubleChecked = verified?.data?.status === 'successful' && successful;
      await applyVerifiedTransaction({ tx_ref, transactionId, successful: doubleChecked, raw: event.data });
    }

    // Flutterwave just needs a 200 to stop retrying.
    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

// Shared by verify + webhook so a transaction is never applied twice and
// both paths agree on what "success" means.
async function applyVerifiedTransaction({ tx_ref, transactionId, successful, raw }) {
  const { data: txRow } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('tx_ref', tx_ref)
    .single();
  if (!txRow || txRow.status === 'successful') return; // already processed or unknown tx_ref

  await supabaseAdmin
    .from('transactions')
    .update({
      status: successful ? 'successful' : 'failed',
      flw_transaction_id: transactionId,
      raw_response: raw || null,
      verified_at: new Date().toISOString(),
    })
    .eq('tx_ref', tx_ref);

  if (successful) {
    const expiresAt = new Date(Date.now() + PREMIUM_PLAN.days * 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'premium', premium_expires_at: expiresAt })
      .eq('id', txRow.user_id);
  }
}

// GET /api/payments/history  (auth required)
export async function history(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ transactions: data });
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/status/:tx_ref  (auth required)
export async function status(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('status, amount, currency, created_at, verified_at')
      .eq('tx_ref', req.params.tx_ref)
      .eq('user_id', req.user.id)
      .single();
    if (error) return res.status(404).json({ error: 'Transaction not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/refund/:transactionId  (admin only)
export async function refund(req, res, next) {
  try {
    const result = await refundTransaction(req.params.transactionId, req.body?.amount);
    await supabaseAdmin
      .from('transactions')
      .update({ status: 'refunded' })
      .eq('flw_transaction_id', req.params.transactionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
