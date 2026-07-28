import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { createSavedItem, deleteSavedItem, listSavedItemsForTool } from '../lib/savedItems';
import useRealtimeTable from './useRealtimeTable';

// Saved results for one tool page (Invoice Generator, Receipt Generator,
// every calculator, etc.), backed by the real `saved_items` Supabase
// table — see server/migrations/002_business_suite.sql.
//
// BUG FIX (business suite): this used to write to localStorage with no
// login check, so a signed-out visitor could "save" unlimited results
// that only ever lived in their own browser and never showed up
// anywhere else (not on the dashboard, not searchable, not on another
// device). `save()` still requires login; the entry itself is a real row
// other pages (Dashboard's Recent Invoices, Saved Items) can read, and
// stays in sync with them via Realtime.
//
// BizName is free for everyone right now — save() still calls
// consumeQuota() so the Dashboard's "Daily Usage" counters stay
// accurate, but nothing here blocks the save; there's no daily cap.
export default function useSavedCalculations(toolSlug, { nameFor, typeFor = 'calculation' } = {}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!session) {
      setEntries([]);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const rows = await listSavedItemsForTool(toolSlug);
      setEntries(rows);
    } catch {
      setEntries([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toolSlug, session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: saving/renaming/deleting this tool's results from the
  // Saved Items page, another tab, or another device updates this
  // tool's own "recent" list here too, without a refresh.
  useRealtimeTable('saved_items', session?.user?.id, () => refresh({ silent: true }));

  const save = async (data) => {
    if (!session) {
      return { ok: false, reason: 'login_required' };
    }
    try {
      await api.consumeQuota('tool_save');
    } catch {
      // Usage tracking failed (network/server hiccup) — not a limit,
      // there isn't one. Don't block the save over it.
    }
    try {
      const name = nameFor ? nameFor(data) : toolSlug;
      const item = await createSavedItem({ type: typeFor, toolSlug, name, payload: data });
      setEntries((prev) => [item, ...prev]);
      return { ok: true, entry: item };
    } catch (err) {
      return { ok: false, reason: 'save_failed', message: err.message };
    }
  };

  const remove = async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteSavedItem(id);
    } catch {
      refresh(); // put it back if the delete actually failed server-side
    }
  };

  // `entries[i].data` matches the old localStorage shape so existing
  // tool pages (InvoiceGenerator, ReceiptGenerator, etc.) that read
  // `e.data.foo` keep working unchanged — `payload` is aliased to `data`.
  const shaped = entries.map((e) => ({ ...e, data: e.payload, savedAt: e.created_at }));

  return { entries: shaped, save, remove, loading };
}
