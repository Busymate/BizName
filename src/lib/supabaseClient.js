import { createClient } from '@supabase/supabase-js';

// Anon key is safe in the browser — it's meant to be public. RLS policies
// (see server/migrations/001_init.sql) are what actually protect data.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
