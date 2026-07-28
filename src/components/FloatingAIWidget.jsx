import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { askAI } from '../lib/ai';
import { getBusinessContext } from '../lib/businessContext';
import { createConversation, listConversations, saveMessages } from '../lib/aiConversations';
import '../styles/FloatingAIWidget.css';

const SUGGESTED_PROMPTS = ['How is my business doing?', 'Any overdue invoices?', 'Give me a quick business tip'];

/**
 * Persistent floating chat bubble, rendered globally in Layout.jsx so
 * it's available on every tool page, article, and public page — not
 * just the dedicated /ai-assistant page. Reuses the exact same
 * ai_conversations storage (lib/aiConversations.js) as that full page,
 * so anything asked here shows up in the full conversation history too
 * — this is intentionally NOT a separate, disconnected mini-chatbot.
 *
 * Logged-out visitors still see the bubble (so it's discoverable while
 * browsing free tools/articles) but get a sign-in prompt instead of a
 * live chat, since the AI edge function requires an authenticated user.
 */
export default function FloatingAIWidget() {
  const { session, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [businessContext, setBusinessContext] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  // Load the most recent conversation (if any) the first time the
  // widget is opened, so it picks up where the full AI Assistant page
  // left off instead of always starting blank.
  useEffect(() => {
    if (!open || !profile || conversation) return;
    setLoadingHistory(true);
    listConversations({})
      .then((rows) => setConversation(rows[0] || null))
      .catch(() => setConversation(null))
      .finally(() => setLoadingHistory(false));
  }, [open, profile, conversation]);

  useEffect(() => {
    if (!open || !profile || businessContext) return;
    getBusinessContext(profile).then(setBusinessContext).catch(() => setBusinessContext(null));
  }, [open, profile, businessContext]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages?.length, open]);

  const messages = conversation?.messages || [];

  const send = async (text) => {
    const prompt = (text ?? input).trim();
    if (!prompt || sending || !profile) return;
    setInput('');
    setError('');
    setSending(true);
    try {
      let conv = conversation;
      if (!conv) conv = await createConversation(prompt);

      const userMessage = { role: 'user', content: prompt, at: new Date().toISOString() };
      const messagesWithUser = [...(conv.messages || []), userMessage];
      setConversation({ ...conv, messages: messagesWithUser });

      const reply = await askAI({
        feature: 'business_chat',
        prompt,
        context: businessContext || { plan: profile?.plan },
        history: messagesWithUser.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = { role: 'assistant', content: reply, at: new Date().toISOString() };
      const finalMessages = [...messagesWithUser, assistantMessage];
      const saved = await saveMessages(conv.id, finalMessages);
      setConversation(saved);
    } catch (err) {
      setError(err.message || "BizName AI isn't available right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bn-float-ai">
      {open && (
        <div className="bn-float-ai-panel" role="dialog" aria-label="AI Business Assistant">
          <div className="bn-float-ai-head">
            <div className="bn-float-ai-head-title">
              <i className="fa-solid fa-wand-magic-sparkles" /> BizName AI
            </div>
            <div className="bn-float-ai-head-actions">
              {session && (
                <Link to="/ai-assistant" title="Open full Assistant" onClick={() => setOpen(false)}>
                  <i className="fa-solid fa-expand" />
                </Link>
              )}
              <button onClick={() => setOpen(false)} type="button" aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>

          {!session ? (
            <div className="bn-float-ai-signin">
              <i className="fa-solid fa-lock" />
              <p>Log in to ask BizName AI about your invoices, customers, and business performance.</p>
              <div className="bn-float-ai-signin-actions">
                <Link to="/login" className="bn-float-ai-btn-outline">Log In</Link>
                <Link to="/signup" className="bn-float-ai-btn-solid">Sign Up Free</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="bn-float-ai-messages" ref={scrollRef}>
                {loadingHistory ? (
                  <p className="bn-float-ai-empty">Loading…</p>
                ) : messages.length === 0 ? (
                  <div className="bn-float-ai-empty">
                    <p>Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! Ask me anything about your business.</p>
                    <div className="bn-float-ai-suggestions">
                      {SUGGESTED_PROMPTS.map((s) => (
                        <button key={s} onClick={() => send(s)} type="button">{s}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`bn-float-ai-msg ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
                      {m.role === 'user' ? m.content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>}
                    </div>
                  ))
                )}
                {sending && (
                  <div className="bn-float-ai-msg is-assistant bn-float-ai-typing">
                    <span /><span /><span />
                  </div>
                )}
              </div>

              {error && <p className="bn-float-ai-error">{error}</p>}

              <form className="bn-float-ai-input-row" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input
                  placeholder="Ask about your business…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !input.trim()} aria-label="Send">
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        className="bn-float-ai-bubble"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={open}
      >
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-wand-magic-sparkles'}`} />
      </button>
    </div>
  );
}
