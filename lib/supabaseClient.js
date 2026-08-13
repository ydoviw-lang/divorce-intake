import { createClient } from '@supabase/supabase-js';

// IMPORTANT: this client uses the service role key and must only ever be
// imported from files under /pages/api — never from client-side components.
// The service role key bypasses row-level security, which is why it's kept
// server-only and never sent to the browser.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
