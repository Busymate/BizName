import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { exportRowsToCsv } from '../utils/csvExport';
import {
  deleteSavedItem,
  downloadSavedItem,
  duplicateSavedItem,
  getSavedItemCounts,
  listSavedItems,
  renameSavedItem,
  touchSavedItem,
} from '../lib/savedItems';
import '../styles/BusinessSuite.css';
import '../styles/SavedItems.css';

const TYPE_ROUTE = {
  receipt: '/receipt-generator',
  template: '/templates',
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'receipt', label: 'Receipts' },
  { key: 'document', label: 'Documents' },
  { key: 'calculation', label: 'Calculations' },
  { key: 'template', label: 'Templates' },
];

const PAGE_SIZE = 10;

function SortHeader({ label, field, sortBy, sortDir, onSort }) {
  const active = sortBy === field;
  return (
    <th onClick={() => onSort(field)}>
      {label}
      {active && <i className={`fa-solid fa-arrow-${sortDir === 'asc' ? 'up' : 'down'}`} />}
    </th>
  );
}

function PreviewModal({ item, onClose }) {
  if (!item) return null;
  const d = item.payload || {};
  return (
    <div className="bn-modal-backdrop" onClick={onClose}>
      <div className="bn-modal bn-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bn-preview-modal-head">
          <div>
            <span className={`bn-badge bn-badge-${item.type}`}>{item.type}</span>
            <h3>{item.name}</h3>
          </div>
          <button className="bn-icon-btn" onClick={onClose} aria-label="Close preview" type="button">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="bn-preview-meta">
          <span>Created {new Date(item.created_at).toLocaleString()}</span>
          <span>Last opened {new Date(item.last_opened_at).toLocaleString()}</span>
        </div>
        {(item.type === 'invoice' || item.type === 'receipt') && d.total !== undefined ? (
          <div className="bn-preview-summary">
            {d.client?.name && <p><strong>Customer:</strong> {d.client.name}</p>}
            {d.status && <p><strong>Status:</strong> <span className={`bn-badge bn-badge-${d.status.toLowerCase()}`}>{d.status}</span></p>}
            <p><strong>Total:</strong> {d.currency || '₦'}{Number(d.total || 0).toLocaleString()}</p>
            {Array.isArray(d.items) && d.items.length > 0 && (
              <ul className="bn-preview-line-items">
                {d.items.slice(0, 6).map((li, i) => (
                  <li key={i}>{li.description || 'Item'} — {li.qty || 1} × {Number(li.price || 0).toLocaleString()}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <pre className="bn-preview-json">{JSON.stringify(d, null, 2).slice(0, 2000)}</pre>
        )}
        <div className="bn-modal-actions">
          <button className="bn-quick-action" onClick={() => downloadSavedItem(item)} type="button">
            <i className="fa-solid fa-download" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

function RenameModal({ item, onClose, onRenamed }) {
  const [name, setName] = useState(item?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updated = await renameSavedItem(item.id, name);
      onRenamed(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bn-modal-backdrop" onClick={onClose}>
      <div className="bn-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Rename item</h3>
        <form onSubmit={handleSave}>
          <div className="bn-input-group">
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          {error && <p className="bn-newsletter-error">{error}</p>}
          <div className="bn-modal-actions">
            <button type="button" className="bn-quick-action" onClick={onClose}>Cancel</button>
            <button type="submit" className="bn-auth-submit" style={{ width: 'fit-content' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SavedItems() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [previewItem, setPreviewItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [{ items: rows, total: count }, freshCounts] = await Promise.all([
        listSavedItems({ search, sortBy, sortDir, type, page, pageSize: PAGE_SIZE }),
        getSavedItemCounts(),
      ]);
      setItems(rows);
      setTotal(count);
      setCounts(freshCounts);
    } catch (err) {
      setError(err.message || 'Could not load Saved Items.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, sortBy, sortDir, page]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, type]);

  // Realtime: if this item was renamed/deleted from another tab or
  // device, or a new one was saved from a tool page, the table catches
  // up on its own — silent so a background change doesn't flash a
  // "Loading…" state over what the user is currently looking at.
  useRealtimeTable('saved_items', profile?.id, () => load({ silent: true }));

  const setType = (nextType) => {
    if (nextType === 'all') setSearchParams({});
    else setSearchParams({ type: nextType });
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('desc'); }
  };

  const handleOpen = async (item) => {
    try { await touchSavedItem(item.id); } catch { /* non-critical */ }
    if (item.type === 'invoice') { navigate(`/invoice/${item.id}`); return; }
    const route = TYPE_ROUTE[item.type];
    if (route) navigate(route);
    else setPreviewItem(item);
  };

  const handleDuplicate = async (item) => {
    try { await duplicateSavedItem(item); load(); }
    catch (err) { setError(err.message || 'Could not duplicate this item.'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try { await deleteSavedItem(item.id); setTotal((t) => t - 1); }
    catch (err) { setError(err.message || 'Could not delete this item.'); load(); }
  };

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected item${selected.size === 1 ? '' : 's'}? This can't be undone.`)) return;
    const ids = [...selected];
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    try {
      await Promise.all(ids.map((id) => deleteSavedItem(id)));
      setTotal((t) => Math.max(0, t - ids.length));
    } catch (err) {
      setError(err.message || 'Some items could not be deleted.');
      load();
    }
  };

  const handleBulkDownload = () => {
    items.filter((i) => selected.has(i.id)).forEach((i) => downloadSavedItem(i));
  };

  const handleExportCsv = () => {
    const rows = selected.size > 0 ? items.filter((i) => selected.has(i.id)) : items;
    exportRowsToCsv('saved-items', [
      { label: 'Type', value: 'type' },
      { label: 'Name', value: 'name' },
      { label: 'Created', value: (r) => new Date(r.created_at).toLocaleString() },
      { label: 'Last Opened', value: (r) => new Date(r.last_opened_at).toLocaleString() },
    ], rows);
  };

  const tabs = useMemo(() => TABS.map((t) => ({ ...t, count: counts ? counts[t.key] : null })), [counts]);
  const allSelected = items.length > 0 && selected.size === items.length;

  return (
    <div className="bn-container bn-saved-items-page" style={{ maxWidth: 1100, margin: 0, padding: 0 }}>
      <SEO title="Saved Items" description="Every invoice, receipt, calculation, and template you've saved to your BizName account." path="/saved-items" />

      <h1 style={{ marginBottom: '0.25rem' }}>Saved Items</h1>
      <p style={{ color: 'var(--bn-text-secondary)', marginBottom: '1.25rem' }}>
        All your saved invoices, receipts, documents, and calculations.
      </p>

      <div className="bn-saved-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`bn-saved-tab ${type === t.key ? 'is-active' : ''}`}
            onClick={() => setType(t.key)}
            type="button"
          >
            {t.label} {t.count !== null && <span>({t.count})</span>}
          </button>
        ))}
      </div>

      <div className="bn-table-toolbar">
        <div className="bn-table-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input type="text" placeholder="Search saved items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="bn-table-toolbar-right">
          <button className="bn-table-export-btn" onClick={handleExportCsv} type="button" disabled={items.length === 0}>
            <i className="fa-solid fa-file-csv" /> Export CSV
          </button>
          {selected.size > 0 && (
            <div className="bn-bulk-actions">
              <span>{selected.size} selected</span>
              <button onClick={handleBulkDownload} type="button"><i className="fa-solid fa-download" /> Download</button>
              <button onClick={handleBulkDelete} type="button" className="bn-bulk-delete"><i className="fa-solid fa-trash" /> Delete</button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="bn-newsletter-error">{error}</p>}

      <div className="bn-table-wrap">
        <table className="bn-table">
          <thead>
            <tr>
              <th className="bn-checkbox-cell">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
              </th>
              <th>Type</th>
              <SortHeader label="Name" field="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Created" field="created_at" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Last Opened" field="last_opened_at" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="bn-table-empty">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="bn-table-empty">No saved items yet — use "Save Result" on any tool to see it here.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={selected.has(item.id) ? 'is-selected' : ''}>
                  <td className="bn-checkbox-cell">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`Select ${item.name}`} />
                  </td>
                  <td><span className={`bn-badge bn-badge-${item.type}`}>{item.type}</span></td>
                  <td><button className="bn-link-btn" onClick={() => setPreviewItem(item)}>{item.name}</button></td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>{new Date(item.last_opened_at).toLocaleDateString()}</td>
                  <td>
                    <div className="bn-table-actions">
                      <button onClick={() => setPreviewItem(item)} aria-label="Preview" title="Preview"><i className="fa-solid fa-eye" /></button>
                      <button onClick={() => handleOpen(item)} aria-label="Open" title="Open"><i className="fa-solid fa-up-right-from-square" /></button>
                      <button onClick={() => setRenameItem(item)} aria-label="Rename" title="Rename"><i className="fa-solid fa-pen" /></button>
                      <button onClick={() => handleDuplicate(item)} aria-label="Duplicate" title="Duplicate"><i className="fa-solid fa-copy" /></button>
                      <button onClick={() => downloadSavedItem(item)} aria-label="Download" title="Download"><i className="fa-solid fa-download" /></button>
                      <button onClick={() => handleDelete(item)} aria-label="Delete" title="Delete"><i className="fa-solid fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bn-pagination">
        <span>Showing {items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + items.length} of {total}</span>
        <div className="bn-pagination-buttons">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ padding: '0.4rem 0.4rem' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      <RenameModal
        key={renameItem?.id || 'none'}
        item={renameItem}
        onClose={() => setRenameItem(null)}
        onRenamed={(updated) => {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          setRenameItem(null);
        }}
      />
    </div>
  );
}
