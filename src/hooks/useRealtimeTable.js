import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Subscribes to Postgres changes on `table` (via Supabase Realtime,
 * enabled in server/migrations/006_realtime.sql) filtered to rows owned
 * by the current user, and calls `onChange` whenever a row is inserted,
 * updated, or deleted.
 *
 * This intentionally does NOT try to merge the changed row into local
 * state itself — every caller already has a `load()`/refetch function
 * from its normal data-fetching, and re-running that is simpler and
 * more correct than hand-rolling insert/update/delete reducers in every
 * page (which is an easy place for subtle bugs — duplicate rows, stale
 * sort order, missed deletes). Re-fetching a small "my own records"
 * query is cheap enough that this trade-off is worth the simplicity.
 *
 * @param {string} table - table name, must be in the supabase_realtime publication
 * @param {string|null} userId - current user's id; hook no-ops until this is set
 * @param {() => void} onChange - called after any insert/update/delete
 * @param {string} [userColumn] - column that stores the owning user id
 */
export default function useRealtimeTable(table, userId, onChange, userColumn = 'user_id') {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!userId) return undefined;

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, userColumn]);
}
