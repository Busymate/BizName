import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { askAI } from '../lib/ai';
import { getBusinessContext } from '../lib/businessContext';
import {
  clearConversationMessages,
  createConversation,
  deleteConversation,
  exportConversation,
  listConversations,
  renameConversation,
  saveMessages,
  togglePinConversation,
} from '../lib/aiConversations';
import tools, { getToolBySlug } from '../data/tools';
import SEO from '../components/SEO';
import '../styles/AIAssistant.css';

// Quick Actions shown on the Assistant hub. Each entry either deep-links
// straight to a real tool page (sourced from the central tool registry
// in data/tools.js — never a hardcoded route) or fires a prompt at
// BizName AI itself for things that aren't a single-purpose tool (a
// market analysis or financial report is a conversation, not a form).
const QUICK_ACTIONS = [
  { label: 'Create Invoice', subtitle: 'Generate invoices', icon: 'file-invoice', color: 'blue', toolSlug: 'invoice-generator' },
  { label: 'Calculate VAT', subtitle: 'Calculate VAT & totals', icon: 'percent', color: 'green', toolSlug: 'vat-calculator' },
  { label: 'Business Plan', subtitle: 'Create business plans', icon: 'file-lines', color: 'orange', prompt: 'Help me put together a simple business plan outline for my business.' },
  { label: 'Business Names', subtitle: 'Find perfect names', icon: 'lightbulb', color: 'pink', toolSlug: 'business-name-generator' },
  { label: 'Market Analysis', subtitle: 'Analyze your market', icon: 'chart-line', color: 'indigo', prompt: 'Give me a quick market analysis based on my business data.' },
  { label: 'Financial Report', subtitle: 'Generate reports', icon: 'file-invoice-dollar', color: 'teal', prompt: 'Generate a financial summary report for my business.' },
]
  .map((a) => (a.toolSlug ? { ...a, tool: getToolBySlug(a.toolSlug) } : a))
  .filter((a) => a.prompt || a.tool); // drop an action silently if its tool slug ever goes missing

const SUGGESTED_PROMPTS = [
  'Create an invoice for John Enterprises',
  'Calculate VAT for ₦150,000',
  'Generate 10 unique business names',
  'Help me create a business plan',
];

// Loose keyword match against the real tool registry so an assistant
// reply can offer a one-click "Open <Tool>" shortcut without any
// per-tool hardcoding — add a tool to data/tools.js and it's
// automatically eligible here too.
function findRelatedTool(text = '') {
  const lower = text.toLowerCase();
  for (const tool of tools) {
    const words = tool.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => lower.includes(w))) return tool;
  }
  return null;
}

// Groq gives us the full reply in one response (see
// supabase/functions/ai-assistant/index.ts) — there's no token-by-token
// stream from the server today. This reveals the already-complete reply
// a chunk at a time so the UI still feels like a live chat instead of a
// long pause then a wall of text. It is NOT real server-sent streaming;
// swap this for an actual ReadableStream consumer if the edge function
// is ever changed to stream.
function useTypingReveal(fullText, active) {
  const [revealed, setRevealed] = useState(active ? '' : fullText);

  useEffect(() => {
    if (!active) { setRevealed(fullText); return; }
    setRevealed('');
    let i = 0;
    const chunkSize = Math.max(2, Math.round(fullText.length / 120));
    const interval = setInterval(() => {
      i += chunkSize;
      setRevealed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText, active]);

  return revealed;
}

function MessageBubble({ message, typing, relatedTool }) {
  const revealed = useTypingReveal(message.content, !!typing);
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const done = !typing || revealed.length >= message.content.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard permission denied — silently ignore */ }
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bizname-ai-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bn-chat-msg-row ${isUser ? 'is-user' : 'is-assistant'}`}>
      {!isUser && (
        <div className="bn-chat-avatar bn-chat-avatar-ai">
          <i className="fa-solid fa-wand-magic-sparkles" />
        </div>
      )}
      <div className="bn-chat-bubble-wrap">
        <div className="bn-chat-bubble">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="bn-chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{revealed}</ReactMarkdown>
              {typing && !done && <span className="bn-chat-cursor" />}
            </div>
          )}
        </div>
        {!isUser && done && (
          <div className="bn-chat-msg-actions">
            <button type="button" onClick={handleCopy}>
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} /> {copied ? 'Copied' : 'Copy Result'}
            </button>
            <button type="button" onClick={handleDownload}>
              <i className="fa-solid fa-download" /> Download
            </button>
            {relatedTool && (
              <Link to={`/${relatedTool.slug}`}>
                <i className="fa-solid fa-arrow-up-right-from-square" /> Open {relatedTool.name}
              </Link>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="bn-chat-avatar bn-chat-avatar-user">
          <i className="fa-solid fa-user" />
        </div>
      )}
    </div>
  );
}

function ConversationListItem({ conv, active, onSelect, onRename, onDelete, onTogglePin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const lastMessage = conv.messages?.[conv.messages.length - 1];

  return (
    <div className={`bn-conv-item ${active ? 'is-active' : ''}`}>
      <button className="bn-conv-item-main" onClick={onSelect} type="button">
        <div className="bn-conv-item-title-row">
          {conv.pinned && <i className="fa-solid fa-thumbtack bn-conv-pin-icon" />}
          <span className="bn-conv-item-title">{conv.title}</span>
        </div>
        {lastMessage && <span className="bn-conv-item-snippet">{lastMessage.content.slice(0, 48)}</span>}
      </button>
      <div className="bn-conv-item-menu-wrap">
        <button className="bn-conv-item-menu-btn" onClick={() => setMenuOpen((o) => !o)} type="button" aria-label="Conversation options">
          <i className="fa-solid fa-ellipsis-vertical" />
        </button>
        {menuOpen && (
          <div className="bn-conv-item-menu" onMouseLeave={() => setMenuOpen(false)}>
            <button onClick={() => { onTogglePin(); setMenuOpen(false); }} type="button">
              <i className="fa-solid fa-thumbtack" /> {conv.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button onClick={() => { onRename(); setMenuOpen(false); }} type="button">
              <i className="fa-solid fa-pen" /> Rename
            </button>
            <button onClick={() => { onDelete(); setMenuOpen(false); }} type="button" className="bn-conv-item-menu-danger">
              <i className="fa-solid fa-trash" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [justSentId, setJustSentId] = useState(null); // which assistant message should type-reveal
  const [hubTab, setHubTab] = useState('assistant'); // 'assistant' hub view, or 'history' conversation list
  const [businessContext, setBusinessContext] = useState(null);
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;

  const refreshBusinessContext = () => {
    if (!profile) return;
    getBusinessContext(profile).then(setBusinessContext).catch(() => setBusinessContext(null));
  };

  useEffect(() => {
    refreshBusinessContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Keep the AI's view of the business current — same tables the rest
  // of the app already subscribes to (see useRealtimeTable usages in
  // Dashboard/Customers/SavedItems). Silent: this shouldn't interrupt
  // anything the person is typing.
  useRealtimeTable('saved_items', profile?.id, refreshBusinessContext);
  useRealtimeTable('customers', profile?.id, refreshBusinessContext);

  const loadList = async () => {
    setLoadingList(true);
    try {
      const rows = await listConversations({ search });
      setConversations(rows);
      if (!activeId && rows.length > 0) setActiveId(rows[0].id);
    } catch (err) {
      setError(err.message || 'Could not load your conversations.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Realtime: new/renamed/pinned/deleted conversations from another tab
  // or device show up automatically — including the currently open
  // conversation's messages, so a reply sent from your phone appears
  // here too. The one guard: while THIS tab has a send in flight
  // (`sending`), skip overwriting the active conversation's messages
  // with the background read, since that local optimistic state is
  // momentarily ahead of what's saved server-side and a lagging refetch
  // could otherwise clobber the message this tab just added. Every
  // other conversation still updates normally; the active one catches
  // up on the very next realtime event once sending finishes.
  useRealtimeTable('ai_conversations', profile?.id, async () => {
    try {
      const rows = await listConversations({ search });

      // Tell "this is just the echo of the save this tab already made"
      // apart from "a genuinely different device/tab changed this
      // conversation" by comparing message counts — cheap and good
      // enough at this scale (a handful of messages per conversation).
      const localActive = conversations.find((p) => p.id === activeId);
      const incomingActive = rows.find((r) => r.id === activeId);
      const isExternalChange =
        incomingActive && localActive && incomingActive.messages?.length !== localActive.messages?.length;
      if (isExternalChange && !sending) setJustSentId(null);

      setConversations((prev) =>
        rows.map((row) =>
          row.id === activeId && sending
            ? { ...row, messages: prev.find((p) => p.id === row.id)?.messages ?? row.messages }
            : row
        )
      );
    } catch {
      /* background sync — a failed refresh here isn't worth surfacing an error for */
    }
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active?.messages?.length]);

  const updateActiveMessages = (messages) => {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, messages } : c)));
  };

  const send = async (text) => {
    const prompt = (text ?? input).trim();
    if (!prompt || sending) return;
    setInput('');
    setError('');
    setSending(true);

    try {
      let conv = active;
      if (!conv) {
        conv = await createConversation(prompt);
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
      }

      const userMessage = { role: 'user', content: prompt, at: new Date().toISOString() };
      const messagesWithUser = [...(conv.messages || []), userMessage];
      updateActiveMessages(messagesWithUser);

      const reply = await askAI({
        feature: 'business_chat',
        prompt,
        context: businessContext || { plan: profile?.plan },
        history: messagesWithUser.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = { role: 'assistant', content: reply, at: new Date().toISOString() };
      const finalMessages = [...messagesWithUser, assistantMessage];
      updateActiveMessages(finalMessages);
      setJustSentId(finalMessages.length - 1);

      const saved = await saveMessages(conv.id, finalMessages);
      setConversations((prev) => prev.map((c) => (c.id === conv.id ? saved : c)));
    } catch (err) {
      setError(err.message || 'AI Business Assistant is unavailable right now.');
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = () => {
    setActiveId(null);
    setInput('');
    setError('');
    setSidebarOpen(false);
    setJustSentId(null);
  };

  const handleDelete = async (conv) => {
    if (!window.confirm(`Delete "${conv.title}"? This can't be undone.`)) return;
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    if (activeId === conv.id) setActiveId(null);
    try { await deleteConversation(conv.id); }
    catch (err) { setError(err.message || 'Could not delete this conversation.'); loadList(); }
  };

  const handleTogglePin = async (conv) => {
    try {
      const updated = await togglePinConversation(conv.id, !conv.pinned);
      setConversations((prev) => prev.map((c) => (c.id === conv.id ? updated : c)).sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updated_at) - new Date(a.updated_at);
      }));
    } catch (err) {
      setError(err.message || 'Could not update this conversation.');
    }
  };

  const startRename = (conv) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const submitRename = async (e) => {
    e.preventDefault();
    if (!renamingId) return;
    try {
      const updated = await renameConversation(renamingId, renameValue);
      setConversations((prev) => prev.map((c) => (c.id === renamingId ? updated : c)));
    } catch (err) {
      setError(err.message || 'Could not rename this conversation.');
    } finally {
      setRenamingId(null);
    }
  };

  const handleClearChat = async () => {
    if (!active) return;
    if (!window.confirm('Clear all messages in this conversation? This can\'t be undone.')) return;
    updateActiveMessages([]);
    try { await clearConversationMessages(active.id); }
    catch (err) { setError(err.message || 'Could not clear this conversation.'); }
  };

  const messages = active?.messages || [];

  return (
    <div className="bn-assistant-page">
      <SEO title="AI Business Assistant" description="Chat with BizName's AI about your invoices, receipts, and customers." path="/ai-assistant" />

      <aside className={`bn-assistant-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="bn-assistant-hub-head">
          <div className="bn-assistant-hub-title">
            <i className="fa-solid fa-wand-magic-sparkles" />
            <div>
              <h2>AI Assistant</h2>
              <p>Your intelligent business partner. Ask anything about your business.</p>
            </div>
          </div>
          <button className="bn-icon-btn bn-assistant-sidebar-close" onClick={() => setSidebarOpen(false)} type="button" aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="bn-assistant-hub-tabs">
          <button type="button" className={hubTab === 'assistant' ? 'is-active' : ''} onClick={() => setHubTab('assistant')}>
            <i className="fa-solid fa-sparkles" /> Assistant
          </button>
          <button type="button" className={hubTab === 'history' ? 'is-active' : ''} onClick={() => setHubTab('history')}>
            <i className="fa-solid fa-clock-rotate-left" /> History{conversations.length > 0 ? ` (${conversations.length})` : ''}
          </button>
        </div>

        {hubTab === 'assistant' ? (
          <div className="bn-assistant-hub-body">
            

            <button className="bn-assistant-new-chat" onClick={handleNewChat} type="button">
              <i className="fa-solid fa-plus" /> New Chat
            </button>

            <h4 className="bn-assistant-hub-section">Quick Actions</h4>
            <div className="bn-assistant-quick-actions">
              {QUICK_ACTIONS.map((a) =>
                a.tool ? (
                  <Link key={a.label} to={`/${a.tool.slug}`} className="bn-quick-action" onClick={() => setSidebarOpen(false)}>
                    <span className={`bn-quick-action-icon is-${a.color}`}><i className={`fa-solid fa-${a.icon}`} /></span>
                    <span className="bn-quick-action-label">{a.label}</span>
                    <span className="bn-quick-action-subtitle">{a.subtitle}</span>
                  </Link>
                ) : (
                  <button key={a.label} type="button" className="bn-quick-action" onClick={() => send(a.prompt)}>
                    <span className={`bn-quick-action-icon is-${a.color}`}><i className={`fa-solid fa-${a.icon}`} /></span>
                    <span className="bn-quick-action-label">{a.label}</span>
                    <span className="bn-quick-action-subtitle">{a.subtitle}</span>
                  </button>
                )
              )}
            </div>

            <h4 className="bn-assistant-hub-section">Suggested Prompts</h4>
            <div className="bn-assistant-hub-prompts">
              {SUGGESTED_PROMPTS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  <span>{s}</span>
                  <i className="fa-solid fa-arrow-right" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            
            <div className="bn-conv-list">
              {loadingList ? (
                <p className="bn-muted-text" style={{ padding: '0 0.5rem' }}>Loading…</p>
              ) : conversations.length === 0 ? (
                <p className="bn-muted-text" style={{ padding: '0 0.5rem' }}>No conversations yet — start one from the Assistant tab.</p>
              ) : (
                conversations.map((conv) =>
                  renamingId === conv.id ? (
                    <form key={conv.id} className="bn-conv-rename-form" onSubmit={submitRename}>
                      <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus onBlur={submitRename} />
                    </form>
                  ) : (
                    <ConversationListItem
                      key={conv.id}
                      conv={conv}
                      active={conv.id === activeId}
                      onSelect={() => { setActiveId(conv.id); setSidebarOpen(false); setJustSentId(null); }}
                      onRename={() => startRename(conv)}
                      onDelete={() => handleDelete(conv)}
                      onTogglePin={() => handleTogglePin(conv)}
                    />
                  )
                )
              )}
            </div>
          </>
        )}
      </aside>

      {sidebarOpen && <div className="bn-assistant-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="bn-assistant-chat">
        <div className="bn-assistant-chat-head">
          <button className="bn-assistant-hamburger" onClick={() => setSidebarOpen(true)} type="button" aria-label="Show chat history">
            <i className="fa-solid fa-clock-rotate-left" />
          </button>
          <h1>{active?.title || 'AI Business Assistant'}</h1>
          {active && (
            <div className="bn-assistant-chat-head-actions">
              <button onClick={() => exportConversation(active)} type="button" title="Export"><i className="fa-solid fa-file-export" /></button>
              <button onClick={handleClearChat} type="button" title="Clear chat"><i className="fa-solid fa-broom" /></button>
            </div>
          )}
        </div>

        <div className="bn-assistant-messages" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="bn-assistant-empty">
              <div className="bn-assistant-empty-icon"><i className="fa-solid fa-wand-magic-sparkles" /></div>
              <h2>Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! I'm your AI Business Assistant</h2>
              <p>I can help you analyze your business, answer questions and give you smart recommendations.</p>
              <div className="bn-assistant-suggestions">
                {SUGGESTED_PROMPTS.map((s) => (
                  <button key={s} onClick={() => send(s)} type="button">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageBubble
                key={i}
                message={m}
                typing={!sending && i === justSentId}
                relatedTool={m.role === 'assistant' ? findRelatedTool(`${messages[i - 1]?.content || ''} ${m.content}`) : null}
              />
            ))
          )}
          {sending && (
            <div className="bn-chat-msg-row is-assistant">
              <div className="bn-chat-avatar bn-chat-avatar-ai"><i className="fa-solid fa-wand-magic-sparkles" /></div>
              <div className="bn-chat-bubble bn-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {error && <p className="bn-newsletter-error bn-assistant-error">{error}</p>}

        <form
          className="bn-assistant-input-row"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <div className="bn-assistant-input-tools">
            <button type="button" disabled title="Attachments coming soon"><i className="fa-solid fa-paperclip" /></button>
            <button type="button" disabled title="Images coming soon"><i className="fa-solid fa-image" /></button>
            <button type="button" disabled title="Templates coming soon"><i className="fa-solid fa-table-cells" /></button>
          </div>
          <input
            placeholder="Ask me anything about your business…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="bn-assistant-send-btn" disabled={sending || !input.trim()}>
            {sending ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-paper-plane" />}
          </button>
        </form>
        <p className="bn-ai-disclaimer">AI can make mistakes. Please verify important information.</p>
      </div>
    </div>
  );
}
