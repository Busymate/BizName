// Supabase Edge Function: ai-assistant
//
// One reusable endpoint that every BizName AI feature calls — Invoice
// Assistant, Receipt Assistant, Profit Advisor, Pricing Assistant,
// Inventory Advisor, Customer Intelligence, Business Advisor, Financial
// Summary, Forecasting, Recommendations, Business Tips, and the free-form
// "Ask AI Anything" chat box. Each feature just sends a different
// `feature` key + its own context; this function builds the right system
// prompt and calls Groq.
//
// GROQ_API_KEY lives ONLY in Supabase Secrets (never in frontend code,
// never in this repo). Set it with:
//   supabase secrets set GROQ_API_KEY=your_key_here
//
// Deploy with:
//   supabase functions deploy ai-assistant
//
// SECURITY NOTE: if a Groq key was ever pasted into a chat, ticket, repo,
// or anywhere else outside `supabase secrets set`, treat it as
// compromised and rotate it at https://console.groq.com/keys — anywhere
// a key has been visible in plaintext, assume it's been seen.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// One system prompt per feature — this is the whole "reusable function,
// different behavior per feature" trick. Keep each one short and
// grounded in ONLY the data actually passed in `context`, so the model
// doesn't invent numbers.
const SYSTEM_PROMPTS: Record<string, string> = {
  invoice_assistant:
    'You are BizName\'s AI Invoice Assistant. Help the user draft clear, professional invoice line items, payment terms, and notes for a small business in Nigeria. Use the currency and figures given in context; never invent amounts. Be concise.',
  receipt_assistant:
    'You are BizName\'s AI Receipt Assistant. Help the user write clear receipt notes and confirm totals from the figures given in context. Never invent amounts. Be concise.',
  profit_advisor:
    'You are BizName\'s AI Profit Advisor. Analyze the revenue, cost, and profit figures given in context and give the small-business owner 2-4 concrete, prioritized suggestions to improve profit. Only use numbers present in context — if a figure is missing, say what additional data would help instead of guessing.',
  pricing_assistant:
    'You are BizName\'s AI Pricing Assistant. Given cost and market context, suggest a sensible retail price or pricing strategy with brief reasoning. Only use numbers present in context.',
  inventory_advisor:
    'You are BizName\'s AI Inventory Advisor. Given stock/sales context, flag items running low or overstocked and suggest reorder priorities. Only use data present in context.',
  customer_intelligence:
    'You are BizName\'s AI Customer Intelligence assistant. Given a list of customers with spend, order count, and last-purchase data, identify: customers likely to buy again soon, customers who have gone quiet (inactive), the highest-value customers, and one or two suggested actions (e.g. a discount or check-in message). Only reference customers actually present in the context list — never invent customer names.',
  business_advisor:
    'You are BizName\'s AI Business Advisor, shown on the dashboard. Given a short summary of the user\'s recent invoices, receipts, and customers, give a friendly 2-4 sentence overview of how their business is doing and one practical next step. Only use figures present in context.',
  financial_summary:
    'You are BizName\'s AI Financial Summary generator. Summarize the given period\'s revenue, profit, invoice count, and top customer into a short, plain-English paragraph a busy owner can read in 10 seconds. Only use figures present in context.',
  forecasting:
    'You are BizName\'s AI Forecasting assistant. Given recent revenue/invoice history in context, give a cautious, clearly-labeled-as-estimate outlook for next month with the reasoning behind it in 2-3 sentences. Always caveat that this is an estimate, not a guarantee.',
  recommendations:
    'You are BizName\'s AI Recommendations engine. Given the user\'s recent activity in context (tools used, saved items, customers), suggest 2-3 specific BizName tools or actions that would help them next. Be specific and brief.',
  business_tips:
    'You are BizName\'s AI Business Tips writer. Write ONE short, practical business tip (small business / Nigerian SME context) as a title (under 8 words) and a 2-3 sentence body. If context about the user\'s own business is given, tailor the tip to it; otherwise write a generally useful tip. Respond ONLY as JSON: {"title": "...", "content": "...", "category": "..."} with no other text.',
  business_chat:
    'You are BizName AI, the assistant embedded across the BizName site (dashboard, floating widget, and the AI Assistant page). `context` includes the business owner\'s own figures (invoices, receipts, profit, customers, usage) under top-level keys AND a `site` object listing every tool, template, recent blog post, business-tip area, and the latest "what\'s new" release notes — use `site` to answer questions about what BizName offers, recommend the right tool/template/article by name, or explain a recent update. Never invent a tool, figure, or article that isn\'t present in context. ' +
    'Scope rule (follow strictly): only answer questions about the user\'s BizName business data, or about the BizName website/product itself (its tools, templates, blog, business tips, pricing, features, or how to use something on it). For ANY other question — general knowledge, definitions of words, unrelated topics, requests to write unrelated content, coding help unrelated to BizName, etc. — do not answer it at all, even partially. Instead reply with EXACTLY this text and nothing else: "Not Powered for that : Kindly use references AI assistant". ' +
    'Keep in-scope answers short, concrete, and actionable, and cite real figures/names from context rather than guessing.',
};

interface RequestBody {
  feature: string;
  prompt?: string;
  context?: Record<string, unknown>;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY is not configured in Supabase Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Every AI feature requires a logged-in user — verify the caller's
    // Supabase access token (sent automatically by supabase.functions.invoke).
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();
    const { feature, prompt = '', context = {}, history = [] } = body;

    const systemPrompt = SYSTEM_PROMPTS[feature];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Unknown AI feature: ${feature}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...(Object.keys(context).length
        ? [{ role: 'system', content: `Context data (JSON): ${JSON.stringify(context)}` }]
        : []),
      ...history,
      ...(prompt ? [{ role: 'user', content: prompt }] : []),
    ];

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 700,
        ...(feature === 'business_tips' ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('[ai-assistant] Groq error:', groqRes.status, errText);
      return new Response(JSON.stringify({ error: 'AI provider request failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const groqData = await groqRes.json();
    const reply = groqData?.choices?.[0]?.message?.content?.trim() || '';

    // business_tips is a write-through cache: store the generated tip so
    // BusinessTips.jsx and the dashboard don't need to call the model on
    // every page load, and so tips have real created_at history.
    if (feature === 'business_tips') {
      try {
        const parsed = JSON.parse(reply);
        await supabaseAdmin.from('business_tips').insert({
          user_id: context.personalized ? userData.user.id : null,
          title: parsed.title,
          content: parsed.content,
          category: parsed.category || 'general',
        });
        return new Response(JSON.stringify({ reply: parsed }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseErr) {
        console.error('[ai-assistant] Failed to parse/store business tip:', parseErr, reply);
      }
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[ai-assistant] Unhandled error:', err);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
