import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RELEASE_HISTORY } from '../config/version';
import { getDashboardStats } from '../lib/dashboardStats';
import { KEYS, getItem, setItem } from '../utils/storage';
import '../styles/BusinessSuite.css';
import '../styles/NotificationsModal.css';

const TABS = [
  { id: 'whats_new', label: "What's New", icon: 'fa-sparkles' },
  { id: 'unpaid', label: 'Customers to Pay', icon: 'fa-money-bill-transfer' },
];

// Notification bell content, shared by the Navbar on every dashboard
// page. Two real feeds, not placeholders:
//   - "What's New" reads RELEASE_HISTORY (config/version.js) — the same
//     data the /whats-new page renders, so it's never out of sync.
//   - "Customers to Pay" reads the overdue-invoice list already computed
//     by getDashboardStats() (an invoice is overdue if it's still
//     Pending and its due date has passed) — the same figure the
//     dashboard and AI Business Advisor both use.
export default function NotificationsModal({ open, onClose, profile }) {
  const [tab, setTab] = useState('whats_new');
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !profile) return;
    setLoading(true);
    getDashboardStats()
      .then((stats) => setOverdue(stats.overdueInvoices || []))
      .catch(() => setOverdue([]))
      .finally(() => setLoading(false));
  }, [open, profile]);

  useEffect(() => {
    if (open) setItem(KEYS.NOTIFICATIONS_SEEN_VERSION, RELEASE_HISTORY[0].version);
  }, [open]);

  if (!open) return null;

  return (
    <div className="bn-modal-backdrop" onClick={onClose}>
      <div className="bn-modal bn-notif-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Notifications">
        <div className="bn-notif-head">
          <h3><i className="fa-solid fa-bell" /> Notifications</h3>
          <button className="bn-notif-close" onClick={onClose} type="button" aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="bn-notif-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`bn-notif-tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <i className={`fa-solid ${t.icon}`} /> {t.label}
              {t.id === 'unpaid' && overdue.length > 0 && <span className="bn-notif-tab-count">{overdue.length}</span>}
            </button>
          ))}
        </div>

        <div className="bn-notif-body">
          {tab === 'whats_new' ? (
            <ul className="bn-notif-list">
              {RELEASE_HISTORY.slice(0, 4).map((release, i) => (
                <li key={release.version} className="bn-notif-item">
                  <div className="bn-notif-icon bn-notif-icon-blue"><i className="fa-solid fa-sparkles" /></div>
                  <div>
                    <p className="bn-notif-title">
                      v{release.version} — {release.name} {i === 0 && <span className="bn-badge bn-badge-paid">Latest</span>}
                    </p>
                    <p className="bn-notif-sub">{release.notes.slice(0, 3).join(' · ')}</p>
                    <p className="bn-notif-date">{new Date(release.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </li>
              ))}
              <li>
                <Link to="/whats-new" className="bn-view-all-link" onClick={onClose}>See full release history <i className="fa-solid fa-arrow-right" /></Link>
              </li>
            </ul>
          ) : loading ? (
            <p className="bn-muted-text" style={{ padding: '0.5rem 0' }}>Loading…</p>
          ) : overdue.length === 0 ? (
            <p className="bn-muted-text" style={{ padding: '0.5rem 0' }}>No customers currently owe you money on an overdue invoice. 🎉</p>
          ) : (
            <ul className="bn-notif-list">
              {overdue.map((row) => {
                const d = row.payload || {};
                const daysLate = d.dueDate ? Math.max(0, Math.round((Date.now() - new Date(d.dueDate).getTime()) / 86400000)) : null;
                return (
                  <li key={row.id} className="bn-notif-item">
                    <div className="bn-notif-icon bn-notif-icon-red"><i className="fa-solid fa-triangle-exclamation" /></div>
                    <div style={{ flex: 1 }}>
                      <p className="bn-notif-title">{d.client?.name || 'Unknown customer'} owes {d.currency || '₦'}{Number(d.total || 0).toLocaleString()}</p>
                      <p className="bn-notif-sub">
                        Invoice {d.invoiceNumber || row.name}{daysLate ? ` · ${daysLate} day${daysLate === 1 ? '' : 's'} overdue` : ''}
                      </p>
                    </div>
                    <div className="bn-notif-actions">
                      <Link to={`/invoice/${row.id}`} onClick={onClose} title="View invoice"><i className="fa-solid fa-eye" /></Link>
                      {d.client?.email && (
                        <a href={`mailto:${d.client.email}?subject=${encodeURIComponent(`Reminder: Invoice ${d.invoiceNumber || row.name}`)}&body=${encodeURIComponent(`Hi ${d.client.name || ''}, just a friendly reminder that invoice ${d.invoiceNumber || row.name} for ${d.currency || '₦'}${Number(d.total || 0).toLocaleString()} is still outstanding. Thank you!`)}`} title="Send reminder email">
                          <i className="fa-solid fa-paper-plane" />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
