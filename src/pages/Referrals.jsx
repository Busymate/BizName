import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { getReferralLeaderboard, groupReferralsByMonth, listReferralHistory } from '../lib/referrals';
import { exportRowsToCsv } from '../utils/csvExport';
import useRealtimeTable from '../hooks/useRealtimeTable';
import SEO from '../components/SEO';
import '../styles/Auth.css';
import '../styles/BusinessSuite.css';
import '../styles/Referrals.css';

export default function Referrals() {
  const { profile } = useAuth();
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [quota, setQuota] = useState(null);

  const loadAll = ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    return Promise.all([
      listReferralHistory().catch((err) => {
        setError(err.message || 'Could not load referral history.');
        return [];
      }),
      api.getQuota().catch(() => null),
      getReferralLeaderboard(10).catch(() => []),
    ]).then(([rows, q, board]) => {
      setHistory(rows);
      setQuota(q);
      setLeaderboard(board);
      if (!silent) setLoading(false);
    });
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: a new referral (someone signing up with your code) shows
  // up immediately. The leaderboard is cross-user, so it doesn't get a
  // live subscription (RLS means you can only ever receive realtime
  // events for your own rows) — it's re-pulled alongside history here
  // instead, which is enough since it's a "roughly where you rank" view,
  // not a live ticker.
  useRealtimeTable('referral_events', profile?.id, () => loadAll({ silent: true }), 'referrer_id');

  if (!profile) return <div className="bn-container" style={{ margin: '3rem auto', textAlign: 'center' }}>Loading…</div>;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const bonus = quota?.referralBonus ?? profile.referral_rewards ?? 0;
  const monthly = groupReferralsByMonth(history);
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.count));
  const myRank = leaderboard.findIndex((row) => row.total_referrals <= profile.total_referrals);

  return (
    <div className="bn-container" style={{ maxWidth: 1000, margin: 0, padding: 0 }}>
      <SEO title="Referral Dashboard" description="Your BizName referral code, history, and rewards." path="/referrals" />

      <h1 style={{ marginBottom: '0.25rem' }}>Referral Dashboard</h1>
      <p style={{ color: 'var(--bn-text-secondary)', marginBottom: '1.75rem' }}>
        Share your code — every friend who signs up with it gives you +1 extra tool save, article read, and template save per day, forever.
      </p>

      <div className="bn-dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="bn-dashboard-card">
          <h3><i className="fa-solid fa-gift" /> Your Referral Code</h3>
          <div className="bn-referral-code-box">
            <span>{profile.referral_code}</span>
            <button onClick={copyCode} type="button" aria-label="Copy referral code">
              <i className={`fa-${copied ? 'solid fa-check' : 'regular fa-copy'}`} />
            </button>
          </div>
        </div>
        <div className="bn-dashboard-card">
          <h3><i className="fa-solid fa-users" /> Total Referrals</h3>
          <p className="bn-stat-value">{profile.total_referrals}</p>
        </div>
        <div className="bn-dashboard-card">
          <h3><i className="fa-solid fa-bolt" /> Active Referrals</h3>
          <p className="bn-stat-value">{history.length}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--bn-text-secondary)' }}>Signed up using your code</p>
        </div>
        <div className="bn-dashboard-card">
          <h3><i className="fa-solid fa-battery-full" /> Referral Rewards Earned</h3>
          <p className="bn-stat-value">+{bonus}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--bn-text-secondary)' }}>Everything's already free — this is just a thank-you badge for spreading the word</p>
        </div>
      </div>

      {error && <p className="bn-newsletter-error">{error}</p>}

      <div className="bn-referrals-two-col">
        <div>
          <div className="bn-referrals-subhead-row">
            <h2 className="bn-referrals-subhead">Referral Activity</h2>
            <button
              className="bn-table-export-btn"
              type="button"
              disabled={history.length === 0}
              onClick={() => exportRowsToCsv('referral-history', [
                { label: 'Referred User', value: 'referred_email' },
                { label: 'Reward', value: () => 'Referral reward' },
                { label: 'Date', value: (r) => new Date(r.created_at).toLocaleDateString() },
              ], history)}
            >
              <i className="fa-solid fa-file-csv" /> Export CSV
            </button>
          </div>
          <div className="bn-table-wrap">
            <table className="bn-table">
              <thead>
                <tr>
                  <th>Referred User</th>
                  <th>Reward</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="bn-table-empty">Loading…</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={3} className="bn-table-empty">No referrals yet — share your code above to start earning daily bonuses.</td></tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id}>
                      <td>{row.referred_email}</td>
                      <td><span className="bn-badge bn-badge-paid">Referral reward</span></td>
                      <td>{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h2 className="bn-referrals-subhead" style={{ marginTop: '1.75rem' }}>Monthly Rewards</h2>
          <div className="bn-dashboard-card">
            {monthly.length === 0 ? (
              <p className="bn-muted-text">No referrals yet — monthly totals will show up here once you have some.</p>
            ) : (
              <div className="bn-monthly-bars">
                {monthly.map((m) => (
                  <div key={m.key} className="bn-monthly-bar-row">
                    <span className="bn-monthly-bar-label">{m.label}</span>
                    <div className="bn-monthly-bar-track">
                      <div className="bn-monthly-bar-fill" style={{ width: `${Math.max(6, (m.count / maxMonthly) * 100)}%` }} />
                    </div>
                    <span className="bn-monthly-bar-value">{m.count} referral{m.count === 1 ? '' : 's'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="bn-referrals-subhead">Leaderboard</h2>
          <div className="bn-dashboard-card">
            {loading ? (
              <p className="bn-muted-text">Loading…</p>
            ) : leaderboard.length === 0 ? (
              <p className="bn-muted-text">Nobody has referred anyone yet — be the first!</p>
            ) : (
              <ol className="bn-leaderboard-list">
                {leaderboard.map((row, i) => (
                  <li key={i} className={i < 3 ? 'bn-leaderboard-top' : ''}>
                    <span className="bn-leaderboard-rank">{i + 1}</span>
                    <span className="bn-leaderboard-name">{row.display_name}</span>
                    <span className="bn-leaderboard-count">{row.total_referrals}</span>
                  </li>
                ))}
              </ol>
            )}
            {myRank >= 0 && profile.total_referrals > 0 && (
              <p className="bn-muted-text" style={{ marginTop: '0.85rem' }}>
                You're around rank #{myRank + 1} with {profile.total_referrals} referral{profile.total_referrals === 1 ? '' : 's'}.
              </p>
            )}
          </div>

          {quota && (
            <>
              <h2 className="bn-referrals-subhead" style={{ marginTop: '1.75rem' }}>Usage Today</h2>
              <div className="bn-dashboard-card">
                <p className="bn-muted-text" style={{ marginBottom: '0.75rem' }}>
                  Everything's free — no limits. This is just today's usage count, for your own visibility.
                </p>
                <div className="bn-bonus-usage-row">
                  <span>Tools</span>
                  <span>{quota.used.tool_save}</span>
                </div>
                <div className="bn-bonus-usage-row">
                  <span>Articles</span>
                  <span>{quota.used.article_view}</span>
                </div>
                <div className="bn-bonus-usage-row">
                  <span>Templates</span>
                  <span>{quota.used.template_save}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
