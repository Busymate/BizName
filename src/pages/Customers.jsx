import { useEffect, useMemo, useState } from 'react';
import SEO from '../components/SEO';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { createCustomer, deleteCustomer, listCustomers, segmentCustomers } from '../lib/customers';
import { askAI } from '../lib/ai';
import { exportRowsToCsv } from '../utils/csvExport';
import '../styles/BusinessSuite.css';
import '../styles/Dashboard.css';
import '../styles/Customers.css';

function AddCustomerModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paid, setPaid] = useState(true);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const customer = await createCustomer({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        initialAmount: amount,
        paid,
      });
      onCreated(customer);
    } catch (err) {
      setError(err.message || 'Could not add this customer.');
    } finally {
      setSaving(false);
    }
  };

  const hasAmount = Number(amount) > 0;

  return (
    <div className="bn-modal-backdrop" onClick={onClose}>
      <div className="bn-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Customer</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div className="bn-input-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" required />
          </div>
          <div className="bn-input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
          </div>
          <div className="bn-input-group">
            <label>Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          </div>

          <div className="bn-add-customer-order-row">
            <div className="bn-input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Amount (optional — first order)</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="bn-input-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select value={paid ? 'paid' : 'unpaid'} onChange={(e) => setPaid(e.target.value === 'paid')} disabled={!hasAmount}>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          {hasAmount && (
            <p className="bn-muted-text" style={{ margin: '-0.4rem 0 0' }}>
              {paid
                ? 'This counts as 1 order and adds to their total spent.'
                : "This counts as 1 order but won't count as revenue until marked paid — it'll show as an outstanding balance."}
            </p>
          )}

          {/* Orders and Last Purchase aren't separate inputs — they're
              derived automatically from the amount/status above (and
              from every future purchase), same as the rest of the app's
              customer data. Shown here so it's clear what will happen. */}
          <div className="bn-add-customer-preview">
            <span>Orders: {hasAmount ? 1 : 0}</span>
            <span>Last Purchase: {hasAmount ? 'Today' : '—'}</span>
          </div>

          {error && <p className="bn-newsletter-error">{error}</p>}
          <div className="bn-modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Adding…' : 'Add Customer'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Instant, deterministic insight bullets computed straight from
// `segments` — no AI call, no waiting, always available. These are the
// arithmetic facts; the "Generate AI Insights" button below adds a
// model-written narrative summary on top of the same data.
function useQuickInsights(segments, topCustomer) {
  return useMemo(() => {
    const list = [];
    if (segments.likelyToPurchaseSoon.length > 0) {
      list.push({
        icon: 'fa-clock-rotate-left',
        tone: 'good',
        text: `${segments.likelyToPurchaseSoon.length} customer${segments.likelyToPurchaseSoon.length === 1 ? ' is' : 's are'} likely to make a purchase soon`,
      });
    }
    if (segments.inactive.length > 0) {
      list.push({
        icon: 'fa-user-clock',
        tone: 'warn',
        text: `${segments.inactive.length} customer${segments.inactive.length === 1 ? ' hasn\u2019t' : 's haven\u2019t'} purchased in 30+ days`,
      });
    }
    if (topCustomer) {
      list.push({
        icon: 'fa-crown',
        tone: 'good',
        text: `${topCustomer.name} is your highest value customer — ₦${Number(topCustomer.total_spent || 0).toLocaleString()} total spent`,
      });
    }
    if (segments.suggestedDiscounts.length > 0) {
      list.push({
        icon: 'fa-tag',
        tone: 'warn',
        text: `Consider a win-back discount for ${segments.suggestedDiscounts.length} repeat customer${segments.suggestedDiscounts.length === 1 ? '' : 's'} who've gone quiet`,
      });
    }
    return list;
  }, [segments, topCustomer]);
}

const TABS = [
  { key: 'all', label: 'All Customers' },
  { key: 'insights', label: 'Customer Insights' },
  { key: 'segments', label: 'Segments' },
];

export default function Customers() {
  const { session } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      setCustomers(await listCustomers());
    } catch (err) {
      setError(err.message || 'Could not load customers.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Realtime: a customer added/edited/deleted on another device (or by
  // an invoice/receipt tool crediting a purchase) shows up here without
  // a manual refresh.
  useRealtimeTable('customers', session?.user?.id, () => load({ silent: true }));

  const segments = useMemo(() => segmentCustomers(customers), [customers]);
  const topCustomer = segments.topByRevenue[0];
  const quickInsights = useQuickInsights(segments, topCustomer);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter((c) => `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(q));
  }, [customers, search]);

  const maxRevenue = segments.topByRevenue[0]?.total_spent || 1;

  const handleExportCsv = () => {
    exportRowsToCsv('customers', [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Status', value: (c) => (Number(c.outstanding_balance || 0) > 0 ? 'Unpaid' : c.orders_count > 0 ? 'Paid' : 'No orders') },
      { label: 'Outstanding Balance', value: (c) => Number(c.outstanding_balance || 0) },
      { label: 'Total Spent', value: (c) => Number(c.total_spent || 0) },
      { label: 'Orders', value: 'orders_count' },
      { label: 'Last Purchase', value: (c) => (c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : '') },
    ], filteredCustomers);
  };

  const runAiInsights = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const reply = await askAI({
        feature: 'customer_intelligence',
        prompt: 'Analyze my customers and give me insights.',
        context: {
          customers: customers.map((c) => ({
            name: c.name,
            total_spent: c.total_spent,
            orders_count: c.orders_count,
            last_purchase_at: c.last_purchase_at,
          })),
        },
      });
      setAiSummary(reply);
    } catch (err) {
      setAiError(err.message || 'Could not generate AI insights right now.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bn-container" style={{ maxWidth: 700, margin: '3rem auto', textAlign: 'center' }}>
        <SEO title="Customers" description="AI-powered customer insights and management." path="/customers" />
        <h2>Log in to see your Customer Intelligence dashboard</h2>
        <p>Track spend, repeat customers, and get AI-generated insights once you're signed in.</p>
      </div>
    );
  }

  return (
    <div className="bn-container" style={{ maxWidth: 1100, margin: 0, padding: 0 }}>
      <SEO title="Customers" description="AI-powered customer insights and management." path="/customers" />

      <div className="bn-cust-header">
        <div>
          <h1><i className="fa-solid fa-address-book" /> Customers</h1>
          <p>AI-powered customer insights and relationship management.</p>
        </div>
        <Button variant="primary" icon="fa-plus" onClick={() => setShowAdd(true)}>Add Customer</Button>
      </div>

      {error && <p className="bn-newsletter-error">{error}</p>}

      <div className="bn-cust-kpi-row" style={{ marginBottom: '1.5rem' }}>
        <div className="bn-cust-kpi bn-cust-kpi-blue">
          <div className="bn-cust-kpi-ring"><i className="fa-solid fa-users" /></div>
          <div>
            <p className="bn-cust-kpi-value">{segments.total}</p>
            <p className="bn-cust-kpi-label">Total Customers</p>
          </div>
        </div>
        <div className="bn-cust-kpi bn-cust-kpi-green">
          <div className="bn-cust-kpi-ring"><i className="fa-solid fa-user-check" /></div>
          <div>
            <p className="bn-cust-kpi-value">{segments.active}</p>
            <p className="bn-cust-kpi-label">Active Customers</p>
          </div>
        </div>
        <div className="bn-cust-kpi bn-cust-kpi-amber">
          <div className="bn-cust-kpi-ring"><i className="fa-solid fa-user-clock" /></div>
          <div>
            <p className="bn-cust-kpi-value">{segments.inactive.length}</p>
            <p className="bn-cust-kpi-label">Inactive (30+ days)</p>
          </div>
        </div>
        <div className="bn-cust-kpi bn-cust-kpi-violet">
          <div className="bn-cust-kpi-ring"><i className="fa-solid fa-repeat" /></div>
          <div>
            <p className="bn-cust-kpi-value">{segments.repeat.length}</p>
            <p className="bn-cust-kpi-label">Repeat Customers</p>
          </div>
        </div>
      </div>

      <div className="bn-saved-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`bn-saved-tab ${tab === t.key ? 'is-active' : ''}`} onClick={() => setTab(t.key)} type="button">
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <>
          <div className="bn-table-toolbar" style={{ marginTop: '1rem' }}>
            <div className="bn-table-search">
              <i className="fa-solid fa-magnifying-glass" />
              <input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="bn-table-toolbar-right">
              <button className="bn-table-export-btn" onClick={handleExportCsv} type="button" disabled={filteredCustomers.length === 0}>
                <i className="fa-solid fa-file-csv" /> Export CSV
              </button>
            </div>
          </div>
          <div className="bn-table-wrap">
            <table className="bn-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Total Spent</th>
                  <th>Orders</th>
                  <th>Last Purchase</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="bn-table-empty">Loading…</td></tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr><td colSpan={7} className="bn-table-empty">
                    {customers.length === 0 ? 'No customers yet — click "Add Customer" to start tracking.' : 'No customers match your search.'}
                  </td></tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email || c.phone || '—'}</td>
                      <td>
                        {Number(c.outstanding_balance || 0) > 0 ? (
                          <span className="bn-badge bn-badge-pending" title={`₦${Number(c.outstanding_balance).toLocaleString()} owed`}>Unpaid</span>
                        ) : c.orders_count > 0 ? (
                          <span className="bn-badge bn-badge-paid">Paid</span>
                        ) : (
                          <span className="bn-badge bn-badge-document">No orders</span>
                        )}
                      </td>
                      <td>₦{Number(c.total_spent).toLocaleString()}</td>
                      <td>{c.orders_count}</td>
                      <td>{c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="bn-table-actions">
                          <button
                            aria-label="Delete"
                            title="Delete"
                            onClick={async () => {
                              if (!window.confirm(`Remove ${c.name}?`)) return;
                              setCustomers((prev) => prev.filter((x) => x.id !== c.id));
                              try { await deleteCustomer(c.id); } catch { load(); }
                            }}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'insights' && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="bn-dashboard-card">
            <div className="bn-card-head">
              <h3 style={{ color: 'var(--bn-text)' }}><i className="fa-solid fa-bolt" /> AI Insights</h3>
              <Button variant="outline" size="sm" icon="fa-wand-magic-sparkles" onClick={runAiInsights} disabled={aiLoading || customers.length === 0}>
                {aiLoading ? 'Analyzing…' : 'Generate Full Report'}
              </Button>
            </div>

            {quickInsights.length === 0 ? (
              <p className="bn-muted-text">Add customers and record purchases to see insights here.</p>
            ) : (
              <ul className="bn-advisor-insight-list">
                {quickInsights.map((insight, i) => (
                  <li key={i} className={`bn-advisor-insight bn-advisor-insight-${insight.tone}`}>
                    <i className={`fa-solid ${insight.icon}`} />
                    <span>{insight.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {aiError && <p className="bn-newsletter-error">{aiError}</p>}
            {aiSummary && (
              <div className="bn-ai-summary-box">
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', margin: 0 }}>{aiSummary}</p>
              </div>
            )}
            {customers.length === 0 && <p className="bn-muted-text">Add a customer first to generate a full AI report.</p>}
          </div>

          <div className="bn-dashboard-card">
            <div className="bn-card-head">
              <h3 style={{ color: 'var(--bn-text)' }}><i className="fa-solid fa-chart-column" /> Revenue by Customer</h3>
            </div>
            {segments.topByRevenue.length === 0 ? (
              <p className="bn-muted-text">No purchases recorded yet.</p>
            ) : (
              <div className="bn-revenue-bars">
                {segments.topByRevenue.map((c) => (
                  <div key={c.id} className="bn-revenue-bar-row">
                    <span className="bn-revenue-bar-label">{c.name}</span>
                    <div className="bn-revenue-bar-track">
                      <div className="bn-revenue-bar-fill" style={{ width: `${Math.max(4, (Number(c.total_spent || 0) / maxRevenue) * 100)}%` }} />
                    </div>
                    <span className="bn-revenue-bar-value">₦{Number(c.total_spent || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'segments' && (
        <div className="bn-insight-grid" style={{ marginTop: '1rem' }}>
          <div className="bn-insight-card">
            <h4><i className="fa-solid fa-crown" /> Top by Revenue</h4>
            {segments.topByRevenue.length === 0 ? (
              <p className="bn-insight-empty">No purchases recorded yet.</p>
            ) : (
              <ul>
                {segments.topByRevenue.map((c) => (
                  <li key={c.id}><span>{c.name}</span><strong>₦{Number(c.total_spent).toLocaleString()}</strong></li>
                ))}
              </ul>
            )}
          </div>
          <div className="bn-insight-card">
            <h4><i className="fa-solid fa-clock-rotate-left" /> Likely to Buy Again Soon</h4>
            {segments.likelyToPurchaseSoon.length === 0 ? (
              <p className="bn-insight-empty">Nobody flagged right now.</p>
            ) : (
              <ul>
                {segments.likelyToPurchaseSoon.map((c) => (
                  <li key={c.id}><span>{c.name}</span><span>{c.orders_count} orders</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="bn-insight-card">
            <h4><i className="fa-solid fa-repeat" /> Repeat Customers</h4>
            {segments.repeat.length === 0 ? (
              <p className="bn-insight-empty">No repeat customers yet.</p>
            ) : (
              <ul>
                {segments.repeat.map((c) => (
                  <li key={c.id}><span>{c.name}</span><span>{c.orders_count} orders</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="bn-insight-card">
            <h4><i className="fa-solid fa-triangle-exclamation" /> Inactive (30+ days)</h4>
            {segments.inactive.length === 0 ? (
              <p className="bn-insight-empty">Everyone's been active recently.</p>
            ) : (
              <ul>
                {segments.inactive.map((c) => (
                  <li key={c.id}><span>{c.name}</span><span>{new Date(c.last_purchase_at).toLocaleDateString()}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="bn-insight-card">
            <h4><i className="fa-solid fa-user-slash" /> At Churn Risk <span className="bn-heuristic-tag">rule-based</span></h4>
            {segments.atChurnRisk.length === 0 ? (
              <p className="bn-insight-empty">No repeat customers have gone quiet.</p>
            ) : (
              <ul>
                {segments.atChurnRisk.map((c) => (
                  <li key={c.id}><span>{c.name}</span><span>{new Date(c.last_purchase_at).toLocaleDateString()}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="bn-insight-card">
            <h4><i className="fa-solid fa-tag" /> Suggested Discounts <span className="bn-heuristic-tag">rule-based</span></h4>
            {segments.suggestedDiscounts.length === 0 ? (
              <p className="bn-insight-empty">No win-back suggestions right now.</p>
            ) : (
              <ul>
                {segments.suggestedDiscounts.map(({ customer, pct }) => (
                  <li key={customer.id}><span>{customer.name}</span><strong>{pct}% off</strong></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onCreated={(customer) => {
            setCustomers((prev) => [customer, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
