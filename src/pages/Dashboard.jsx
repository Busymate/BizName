import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { listSavedItems } from '../lib/savedItems';
import { getDashboardStats } from '../lib/dashboardStats';
import { getUsageOverview } from '../lib/usageStats';
import { listConversations } from '../lib/aiConversations';
import { getSiteContext } from '../lib/businessContext';
import useRealtimeTable from '../hooks/useRealtimeTable';
import useFavoriteTools from '../hooks/useFavoriteTools';
import tools from '../data/tools';
import { supabase } from '../lib/supabaseClient';
import { askAI } from '../lib/ai';
import UsageChart from '../components/UsageChart';
import SEO from '../components/SEO';
import { APP_VERSION } from '../config/version';
import '../styles/Auth.css';
import '../styles/BusinessSuite.css';
import '../styles/Dashboard.css';

function toolMeta(slug) {
  const t = tools.find((x) => x.slug === slug);
  return { name: t?.name || (slug ? slug.replace(/-/g, ' ') : 'Tool'), icon: t?.icon || 'file', slug };
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function ChangeBadge({ value }) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const up = value >= 0;
  return (
    <span className={`bn-kpi-change ${up ? 'bn-kpi-up' : 'bn-kpi-down'}`}>
      <i className={`fa-solid ${up ? 'fa-arrow-up' : 'fa-arrow-down'}`} /> {Math.abs(value)}%
    </span>
  );
}

function KpiCard({ icon, iconClass, label, value, sub, change }) {
  return (
    <div className="bn-kpi-card">
      <div className={`bn-kpi-icon ${iconClass}`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="bn-kpi-body">
        <h3>{label}</h3>
        <p className="bn-kpi-value">{value}</p>
        <div className="bn-kpi-meta">
          <span>{sub}</span>
          <ChangeBadge value={change} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Welcome hero — greeting, 3 quick-action buttons, illustration.
 * ---------------------------------------------------------------- */
function WelcomeHero({ profile }) {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="bn-dashboard-card bn-hero-card">
      <div className="bn-hero-text">
        <h1>Welcome back, {profile.full_name || profile.email.split('@')[0]}! 👋</h1>
        <p>Here's what's happening with your business today.</p>
        <div className="bn-hero-actions">
          <Link to="/invoice-generator" className="bn-hero-btn bn-hero-btn-solid"><i className="fa-solid fa-file-invoice" /> Create Invoice</Link>
          <Link to="/receipt-generator" className="bn-hero-btn bn-hero-btn-outline"><i className="fa-solid fa-receipt" /> Generate Receipt</Link>
          <Link to="/ai-assistant" className="bn-hero-btn bn-hero-btn-outline"><i className="fa-solid fa-wand-magic-sparkles" /> Ask AI Assistant</Link>
        </div>
      </div>
      <div className="bn-hero-illustration" aria-hidden="true">
        <i className="fa-solid fa-chart-line" />
        <span className="bn-date-pill"><i className="fa-regular fa-calendar" /> {today}</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * This Week Overview — compact list version of the same 4 numbers
 * shown in the KPI row below, so both always agree exactly.
 * ---------------------------------------------------------------- */
function WeekOverviewCard({ overview }) {
  const rows = overview
    ? [
        { label: 'Tools Used', value: overview.tools.count, change: overview.tools.change },
        { label: 'Documents Saved', value: overview.documents.count, change: overview.documents.change },
        { label: 'AI Requests', value: overview.aiRequests.count, change: overview.aiRequests.change },
        { label: 'Time Saved', value: `${overview.hoursSaved.value} hrs`, change: overview.hoursSaved.change },
      ]
    : [];
  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head"><h3>This Week Overview</h3></div>
      {!overview ? (
        <p className="bn-muted-text">Loading…</p>
      ) : (
        <div className="bn-week-overview-list">
          {rows.map((r) => (
            <div className="bn-week-overview-row" key={r.label}>
              <span>{r.label}</span>
              <strong>{r.value}</strong>
              <ChangeBadge value={r.change} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
 * Ask BizName AI — compact quick-question widget, top of the aside
 * column. Same askAI('business_chat') feature as the full AI
 * Assistant page and the floating widget, so history/behavior match.
 * ---------------------------------------------------------------- */
function AskAIQuickCard({ context }) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = ['How do I create a professional invoice?', 'Explain VAT for small businesses', 'Generate a business name for a tech startup'];

  const send = async (text) => {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;
    setInput('');
    setReply('');
    setError('');
    setLoading(true);
    try {
      const res = await askAI({ feature: 'business_chat', prompt, context });
      setReply(res);
    } catch (err) {
      setError(err.message || 'BizName AI is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head"><h3><i className="fa-solid fa-wand-magic-sparkles" /> Ask BizName AI</h3></div>
      <p className="bn-muted-text" style={{ marginBottom: '0.85rem' }}>Get instant help for your business needs.</p>

      {reply && <div className="bn-ai-quick-reply">{reply}</div>}
      {error && <p className="bn-newsletter-error" style={{ margin: '0 0 0.75rem' }}>{error}</p>}

      {!reply && (
        <div className="bn-ai-quick-suggestions">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} disabled={loading}>
              {s} <i className="fa-solid fa-arrow-right" />
            </button>
          ))}
        </div>
      )}

      <div className="bn-ai-input-row">
        <input
          placeholder="Type your question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={loading} type="button">
          {loading ? '…' : <i className="fa-solid fa-paper-plane" />}
        </button>
      </div>
      <Link to="/ai-assistant" className="bn-view-all-link" style={{ display: 'inline-block', marginTop: '0.6rem' }}>Open full AI Assistant <i className="fa-solid fa-arrow-right" /></Link>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Analytics Overview — weekly usage chart + total + most-used tool.
 * ---------------------------------------------------------------- */
function AnalyticsOverviewCard({ overview }) {
  const mostUsed = overview?.mostUsedToolSlug ? toolMeta(overview.mostUsedToolSlug).name : '—';
  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head">
        <h3>Analytics Overview</h3>
        <Link to="/analytics" className="bn-view-all-link">This Week</Link>
      </div>
      <div className="bn-analytics-stats">
        <div>
          <p className="bn-referral-stat-value">{overview ? overview.totalUsage : '—'}</p>
          <p className="bn-referral-stat-label">Total Usage</p>
        </div>
        <div>
          <p className="bn-analytics-most-used">{mostUsed}</p>
          <p className="bn-referral-stat-label">Most Used Tool</p>
        </div>
      </div>
      {overview && <UsageChart days={overview.days} />}
    </div>
  );
}

const QUICK_ACTIONS = [
  { slug: 'invoice-generator', to: '/invoice-generator', label: 'Create Invoice', icon: 'fa-file-invoice', color: 'bn-qa-blue' },
  { slug: 'receipt-generator', to: '/receipt-generator', label: 'Generate Receipt', icon: 'fa-receipt', color: 'bn-qa-green' },
  { slug: 'business-name-generator', to: '/business-name-generator', label: 'Business Name Generator', icon: 'fa-lightbulb', color: 'bn-qa-purple' },
  { slug: 'vat-calculator', to: '/vat-calculator', label: 'VAT Calculator', icon: 'fa-percent', color: 'bn-qa-orange' },
  { slug: 'profit-calculator', to: '/profit-calculator', label: 'Profit Calculator', icon: 'fa-chart-line', color: 'bn-qa-teal' },
  { slug: 'quotation-generator', to: '/quotation-generator', label: 'Quotation Generator', icon: 'fa-file-signature', color: 'bn-qa-pink' },
];

function QuickActionsCard() {
  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head"><h3><i className="fa-solid fa-bolt" /> Quick Actions</h3></div>
      <div className="bn-quick-actions-grid">
        {QUICK_ACTIONS.map((qa) => (
          <Link key={qa.slug} to={qa.to} className={`bn-qa-tile ${qa.color}`}>
            <i className={`fa-solid ${qa.icon}`} />
            <span>{qa.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Recent Documents — every saved item (any tool), newest first.
 * ---------------------------------------------------------------- */
const DOC_PAGE_SIZE = 5;

function RecentDocumentsCard({ userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    return listSavedItems({ sortBy: 'created_at', sortDir: 'desc', page: 1, pageSize: DOC_PAGE_SIZE })
      .then(({ items }) => setRows(items))
      .catch(() => setRows([]))
      .finally(() => !silent && setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useRealtimeTable('saved_items', userId, () => load({ silent: true }));

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head">
        <h3><i className="fa-solid fa-file-lines" /> Recent Documents</h3>
        <Link to="/saved-items" className="bn-view-all-link">View all</Link>
      </div>
      <div className="bn-table-wrap">
        <table className="bn-table">
          <thead>
            <tr><th>Document</th><th>Type</th><th>Last Edited</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="bn-table-empty">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="bn-table-empty">Nothing saved yet — try a tool from Quick Actions.</td></tr>
            ) : (
              rows.map((row) => {
                const meta = toolMeta(row.tool_slug);
                return (
                  <tr key={row.id}>
                    <td><i className={`fa-solid fa-${meta.icon} bn-doc-icon`} /> {row.name}</td>
                    <td>{meta.name}</td>
                    <td>{timeAgo(row.created_at)}</td>
                    <td><span className="bn-badge bn-badge-paid">Saved</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Recent Activity — saved items + the latest AI question answered,
 * merged into one chronological feed.
 * ---------------------------------------------------------------- */
function RecentActivityCard({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      listSavedItems({ sortBy: 'created_at', sortDir: 'desc', page: 1, pageSize: 5 }).then((r) => r.items).catch(() => []),
      listConversations({}).catch(() => []),
    ]).then(([savedRows, conversations]) => {
      const savedActivity = savedRows.map((row) => ({
        icon: 'fa-file-lines',
        color: 'bn-activity-blue',
        text: <>You saved <strong>{row.name}</strong> ({toolMeta(row.tool_slug).name})</>,
        at: row.created_at,
      }));

      const aiActivity = [];
      conversations.slice(0, 3).forEach((c) => {
        const lastUser = [...(c.messages || [])].reverse().find((m) => m.role === 'user');
        const lastAssistant = [...(c.messages || [])].reverse().find((m) => m.role === 'assistant');
        if (lastUser && lastAssistant) {
          aiActivity.push({
            icon: 'fa-wand-magic-sparkles',
            color: 'bn-activity-purple',
            text: <>AI Assistant answered a question <br /><span className="bn-activity-quote">"{lastUser.content.slice(0, 80)}"</span></>,
            at: lastAssistant.at || c.updated_at,
          });
        }
      });

      const merged = [...savedActivity, ...aiActivity]
        .filter((a) => a.at)
        .sort((a, b) => new Date(b.at) - new Date(a.at))
        .slice(0, 5);
      setItems(merged);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useRealtimeTable('saved_items', userId, load);

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head"><h3><i className="fa-solid fa-clock-rotate-left" /> Recent Activity</h3></div>
      {loading ? (
        <p className="bn-muted-text">Loading…</p>
      ) : items.length === 0 ? (
        <p className="bn-muted-text">No activity yet — start by saving a document or asking BizName AI something.</p>
      ) : (
        <ul className="bn-activity-list">
          {items.map((item, i) => (
            <li key={i}>
              <div className={`bn-activity-icon ${item.color}`}><i className={`fa-solid ${item.icon}`} /></div>
              <div>
                <p className="bn-activity-text">{item.text}</p>
                <p className="bn-activity-time">{timeAgo(item.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
 * Favorite Tools — starred tools (fallback: a sensible default set)
 * ---------------------------------------------------------------- */
const DEFAULT_FAVORITES = ['invoice-generator', 'vat-calculator', 'profit-calculator', 'receipt-generator', 'quotation-generator', 'business-name-generator'];

function FavoriteToolsCard() {
  const { favorites, toggleFavorite } = useFavoriteTools();
  const slugs = (favorites.length ? favorites : DEFAULT_FAVORITES).slice(0, 6);

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head">
        <h3><i className="fa-solid fa-heart" /> Favorite Tools</h3>
        <Link to="/favorites" className="bn-view-all-link">View all</Link>
      </div>
      <div className="bn-fav-tools-grid">
        {slugs.map((slug) => {
          const meta = toolMeta(slug);
          return (
            <div key={slug} className="bn-fav-tool-tile">
              <button
                type="button"
                className="bn-fav-tool-star"
                onClick={() => toggleFavorite(slug)}
                aria-label="Toggle favorite"
              >
                <i className="fa-solid fa-star" />
              </button>
              <Link to={`/${slug}`}>
                <i className={`fa-solid fa-${meta.icon}`} />
                <span>{meta.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReferralOverviewCard({ profile }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore, code is still visible to copy manually */
    }
  };

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head">
        <h3><i className="fa-solid fa-gift" /> Referral Overview</h3>
      </div>
      <p className="bn-referral-label">Your Referral Code</p>
      <div className="bn-referral-code-box" style={{ marginBottom: '1.1rem' }}>
        <span>{profile.referral_code}</span>
        <button onClick={copyCode} type="button" aria-label="Copy referral code">
          <i className={`fa-${copied ? 'solid fa-check' : 'regular fa-copy'}`} />
        </button>
      </div>
      <div className="bn-referral-stat-row">
        <div>
          <p className="bn-referral-stat-value">{profile.total_referrals || 0}</p>
          <p className="bn-referral-stat-label">Total Referrals</p>
        </div>
        <div>
          <p className="bn-referral-stat-value">{profile.referral_rewards || 0}</p>
          <p className="bn-referral-stat-label">Active Referrals</p>
        </div>
      </div>
      <Link to="/referrals" className="bn-auth-submit bn-referral-cta">View Referral Dashboard</Link>
    </div>
  );
}

function BusinessTipsCard() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('business_tips')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setTips(data || []))
      .catch(() => setTips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head">
        <h3><i className="fa-solid fa-lightbulb" /> Business Tips</h3>
        <Link to="/business-tips" className="bn-view-all-link">View all</Link>
      </div>
      {loading ? (
        <p className="bn-muted-text">Loading…</p>
      ) : tips.length === 0 ? (
        <p className="bn-muted-text">No tips yet — check the Business Tips page.</p>
      ) : (
        <ul className="bn-tip-list">
          {tips.map((tip) => (
            <li key={tip.id}>
              <div className="bn-tip-icon"><i className="fa-solid fa-newspaper" /></div>
              <div>
                <p className="bn-tip-title">{tip.title}</p>
                <p className="bn-tip-date">{new Date(tip.created_at).toLocaleDateString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AiAdvisorCard({ stats }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const insights = useMemo(() => {
    if (!stats) return [];
    const list = [];
    if (stats.overdueInvoices?.length) {
      const totalOverdue = stats.overdueInvoices.reduce((s, r) => s + Number(r.payload?.total || 0), 0);
      list.push({ icon: 'fa-triangle-exclamation', tone: 'warn', text: `${stats.overdueInvoices.length} invoice${stats.overdueInvoices.length === 1 ? '' : 's'} overdue: ₦${totalOverdue.toLocaleString()}` });
    }
    if (stats.profit?.change !== undefined) {
      const up = stats.profit.change >= 0;
      list.push({ icon: up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down', tone: up ? 'good' : 'warn', text: `Your profit is ${Math.abs(stats.profit.change)}% ${up ? 'higher' : 'lower'} than last month` });
    }
    if (stats.inactiveCustomers?.length) {
      list.push({ icon: 'fa-user-clock', tone: 'warn', text: `${stats.inactiveCustomers.length} customer${stats.inactiveCustomers.length === 1 ? '' : 's'} haven't purchased in 60+ days` });
    }
    return list.slice(0, 3);
  }, [stats]);

  const send = async (text) => {
    const prompt = text ?? input;
    if (!prompt.trim() || loading) return;
    setInput('');
    setError('');
    const nextMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const reply = await askAI({ feature: 'business_chat', prompt, context: stats, history: nextMessages.slice(-6) });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'AI Business Advisor is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['How is my business performing this month?', 'Which customers should I follow up with?', "What's a quick win to improve profit?"];

  return (
    <div className="bn-dashboard-card">
      <div className="bn-card-head">
        <h3><i className="fa-solid fa-wand-magic-sparkles" /> AI Business Advisor</h3>
        <span className="bn-ai-badge">New insights for you</span>
      </div>

      {insights.length > 0 && (
        <ul className="bn-advisor-insight-list">
          {insights.map((insight, i) => (
            <li key={i} className={`bn-advisor-insight bn-advisor-insight-${insight.tone}`}>
              <i className={`fa-solid ${insight.icon}`} />
              <span>{insight.text}</span>
            </li>
          ))}
        </ul>
      )}

      {messages.length > 0 && (
        <div className="bn-ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`bn-ai-msg bn-ai-msg-${m.role}`}>{m.content}</div>
          ))}
        </div>
      )}
      {error && <p className="bn-newsletter-error" style={{ margin: 0 }}>{error}</p>}

      {messages.length === 0 && (
        <div className="bn-ai-suggestion-row">
          {suggestions.map((s) => (
            <button key={s} className="bn-ai-suggestion" onClick={() => send(s)} type="button">{s}</button>
          ))}
        </div>
      )}

      <div className="bn-ai-input-row">
        <input
          placeholder="Ask AI anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={() => send()} disabled={loading} type="button">
          {loading ? '…' : <i className="fa-solid fa-paper-plane" />}
        </button>
      </div>

      <p className="bn-ai-disclaimer">AI can make mistakes. Verify important information.</p>
    </div>
  );
}

export default function Dashboard() {
  const { profile, profileError, logout } = useAuth();
  const [quota, setQuota] = useState(null);
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);

  const refreshQuota = () => api.getQuota().then(setQuota).catch(() => {});
  const refreshStats = () => {
    if (!profile) return;
    getDashboardStats().then(setStats).catch(() => setStats(null));
  };
  const refreshOverview = () => {
    if (!profile) return;
    getUsageOverview(profile.id).then(setOverview).catch(() => setOverview(null));
  };

  useEffect(() => {
    refreshQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshStats();
    refreshOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Realtime: creating/paying an invoice, saving any document/tool
  // result, asking the AI anything, or gaining a customer — anywhere
  // else in the app, this tab or another one — updates the KPI cards,
  // This Week Overview, Analytics Overview, Recent Documents and
  // Recent Activity here without a manual refresh. This is what keeps
  // every section of the dashboard "in sync" with each other.
  useRealtimeTable('saved_items', profile?.id, () => { refreshStats(); refreshQuota(); refreshOverview(); });
  useRealtimeTable('customers', profile?.id, refreshStats);
  useRealtimeTable('usage_events', profile?.id, refreshOverview);

  const aiContext = useMemo(() => (stats ? { ...stats, plan: profile?.plan, site: getSiteContext() } : {}), [stats, profile]);

  if (profileError) {
    return (
      <div className="bn-container" style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
        <h2>Couldn't load your account</h2>
        <p className="bn-newsletter-error">{profileError}</p>
        <p>Make sure the Express server (server/) is running on the URL set in VITE_API_BASE_URL.</p>
      </div>
    );
  }

  if (!profile) return <div className="bn-container" style={{ margin: '3rem auto', textAlign: 'center' }}>Loading your dashboard…</div>;

  return (
    <div className="bn-container bn-dashboard-page">
      <SEO title="Dashboard" description="Your BizName account dashboard." path="/dashboard" showVersion />

      <WelcomeHero profile={profile} />

      <div className="bn-kpi-grid">
        <KpiCard icon="fa-screwdriver-wrench" iconClass="bn-kpi-blue" label="Tools Used" value={overview ? overview.tools.count : '—'} sub="This Week" change={overview?.tools.change} />
        <KpiCard icon="fa-file-lines" iconClass="bn-kpi-green" label="Saved Documents" value={overview ? overview.documents.count : '—'} sub="This Week" change={overview?.documents.change} />
        <KpiCard icon="fa-wand-magic-sparkles" iconClass="bn-kpi-purple" label="AI Requests" value={overview ? overview.aiRequests.count : '—'} sub="This Week" change={overview?.aiRequests.change} />
        <KpiCard icon="fa-clock" iconClass="bn-kpi-orange" label="Time Saved" value={overview ? `${overview.hoursSaved.value} hrs` : '—'} sub="Estimated" change={overview?.hoursSaved.change} />
      </div>

      <div className="bn-dashboard-two-col">
        <QuickActionsCard />
        <WeekOverviewCard overview={overview} />
      </div>

      <div className="bn-dashboard-two-col">
        <RecentDocumentsCard userId={profile?.id} />
        <RecentActivityCard userId={profile?.id} />
      </div>

      <div className="bn-dashboard-two-col">
        <FavoriteToolsCard />
        <AnalyticsOverviewCard overview={overview} />
      </div>

      <AskAIQuickCard context={aiContext} />

      

      <div className="bn-dashboard-two-col">
        <ReferralOverviewCard profile={profile} />
        <BusinessTipsCard />
      </div>

      <AiAdvisorCard stats={aiContext} />

      <button className="bn-dashboard-logout" onClick={logout}>Log out</button>
      <p className="bn-dashboard-version">BizName v{APP_VERSION}</p>
    </div>
  );
}
