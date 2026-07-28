import { supabase } from './supabaseClient';
import { api } from './api';

// Thin wrapper around the `ai-assistant` Supabase Edge Function. Every AI
// feature in the app (Invoice Assistant, Profit Advisor, Customer
// Intelligence, Business Advisor, Business Tips, the dashboard chat box,
// etc.) goes through this one function — see
// supabase/functions/ai-assistant/index.ts for the system prompts.
//
// The Groq API key never touches the browser: supabase.functions.invoke
// forwards the user's Supabase access token, the edge function verifies
// it server-side, then calls Groq with a key that only exists in
// Supabase Secrets.
export async function askAI({ feature, prompt = '', context = {}, history = [] }) {
  // Every real question (not the silent business_tips background job)
  // counts as one "AI Request" — this is what feeds the dashboard's AI
  // Requests KPI, This Week Overview, and Analytics Overview. Fire and
  // forget: a logging hiccup should never block the actual AI reply.
  if (feature !== 'business_tips') {
    api.consumeQuota('ai_request').catch(() => {});
  }

  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { feature, prompt, context, history },
  });

  if (error) {
    // supabase-js wraps non-2xx responses in a generic FunctionsHttpError;
    // try to surface the real message the edge function returned.
    let message = error.message || 'AI request failed';
    try {
      const body = await error.context?.json?.();
      if (body?.error) message = body.error;
    } catch {
      /* response body wasn't JSON — fall back to the generic message */
    }
    throw new Error(message);
  }

  if (data?.error) throw new Error(data.error);
  return data.reply;
}
