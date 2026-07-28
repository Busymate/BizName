import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../lib/dashboardStats';
import { getUsageOverview } from '../lib/usageStats';
import useRealtimeTable from '../hooks/useRealtimeTable';
import UsageChart from '../components/UsageChart';
import SEO from '../components/SEO';
import tools from '../data/tools';
import '../styles/BusinessSuite.css';
import '../styles/Dashboard.css';

function toolName(slug) {
  return tools.find((t) => t.slug === slug)?.name || (slug ? slug.replace(/-/g, ' ') : '—');
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

// A deeper, single-page view of the exact same real numbers the
// Dashboard's KPI row / This Week Overview / Analytics Overview already
// show — reads from the same getUsageOverview() + getDashboardStats()
// so nothing here can ever disagree with the dashboard.
export default function Analytics() {
  const { profile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);

  const refresh = () => {
    if (!profile) return;
    getUsageOverview(profile.id).then(setOverview).catch(() => setOverview(null));
    getDashboardStats().then(setStats).catch(() => setStats(null));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useRealtimeTable('usage_events', profile?.id, refresh);
  useRealtimeTable('saved_items', profile?.id, refresh);
  useRealtimeTable('customers', profile?.id, refresh);

  return (
    <div className="bn-dashboard-page">
      <SEO title="Analytics" description="A deeper look at your BizName usage and business performance." path="/analytics" />

      <div className="bn-dashboard-topbar">
        <div>
          <h1><i className="fa-solid fa-chart-pie" style={{ marginRight: '0.5rem' }} /> Analytics</h1>
          <p>Real usage and business figures — the same numbers your dashboard summarizes, in more detail.</p>
        </div>
      </div>

      <div className="bn-kpi-grid">
        <div className="bn-kpi-card">
          <div className="bn-kpi-icon bn-kpi-blue"><i className="fa-solid fa-screwdriver-wrench" /></div>
          <div className="bn-kpi-body">
            <h3>Tools Used</h3>
            <p className="bn-kpi-value">{overview ? overview.tools.count : '—'}</p>
            <div className="bn-kpi-meta"><span>This Week</span><ChangeBadge value={overview?.tools.change} /></div>
          </div>
        </div>
        <div className="bn-kpi-card">
          <div className="bn-kpi-icon bn-kpi-green"><i className="fa-solid fa-file-lines" /></div>
          <div className="bn-kpi-body">
            <h3>Saved Documents</h3>
            <p className="bn-kpi-value">{overview ? overview.documents.count : '—'}</p>
            <div className="bn-kpi-meta"><span>This Week</span><ChangeBadge value={overview?.documents.change} /></div>
          </div>
        </div>
        <div className="bn-kpi-card">
          <div className="bn-kpi-icon bn-kpi-purple"><i className="fa-solid fa-wand-magic-sparkles" /></div>
          <div className="bn-kpi-body">
            <h3>AI Requests</h3>
            <p className="bn-kpi-value">{overview ? overview.aiRequests.count : '—'}</p>
            <div className="bn-kpi-meta"><span>This Week</span><ChangeBadge value={overview?.aiRequests.change} /></div>
          </div>
        </div>
        <div className="bn-kpi-card">
          <div className="bn-kpi-icon bn-kpi-orange"><i className="fa-solid fa-clock" /></div>
          <div className="bn-kpi-body">
            <h3>Time Saved</h3>
            <p className="bn-kpi-value">{overview ? `${overview.hoursSaved.value} hrs` : '—'}</p>
            <div className="bn-kpi-meta"><span>Estimated</span><ChangeBadge value={overview?.hoursSaved.change} /></div>
          </div>
        </div>
      </div>

      <div className="bn-dashboard-two-col">
        <div className="bn-dashboard-card">
          <div className="bn-card-head"><h3>Usage — Last 7 Days</h3></div>
          {overview ? <UsageChart days={overview.days} /> : <p className="bn-muted-text">Loading…</p>}
          <p className="bn-muted-text" style={{ marginTop: '0.75rem' }}>
            Combines every tool save, template use, and AI request per day. Total this week: <strong>{overview?.totalUsage ?? '—'}</strong>. Most used tool: <strong>{overview ? toolName(overview.mostUsedToolSlug) : '—'}</strong>.
          </p>
        </div>

        <div className="bn-dashboard-card">
          <div className="bn-card-head"><h3>Business This Month</h3></div>
          {!stats ? (
            <p className="bn-muted-text">Loading…</p>
          ) : (
            <div className="bn-week-overview-list">
              <div className="bn-week-overview-row"><span>Invoices</span><strong>{stats.invoices.count}</strong><ChangeBadge value={stats.invoices.change} /></div>
              <div className="bn-week-overview-row"><span>Receipts</span><strong>{stats.receipts.count}</strong><ChangeBadge value={stats.receipts.change} /></div>
              <div className="bn-week-overview-row"><span>Revenue (paid)</span><strong>₦{stats.profit.total.toLocaleString()}</strong><ChangeBadge value={stats.profit.change} /></div>
              <div className="bn-week-overview-row"><span>Total Customers</span><strong>{stats.customers.total}</strong><ChangeBadge value={stats.customers.change} /></div>
              <div className="bn-week-overview-row"><span>Overdue Invoices</span><strong>{stats.overdueInvoices?.length || 0}</strong></div>
            </div>
          )}
          <Link to="/customers" className="bn-view-all-link" style={{ display: 'inline-block', marginTop: '1rem' }}>
            View Customers <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
}
