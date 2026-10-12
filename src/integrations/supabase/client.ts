import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configured entirely through environment variables (see .env).
// The previous hardcoded fallback pointed at a Supabase project that no longer
// resolves, which surfaced as a silent "failed to load" instead of a clear error.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "TriageLM: missing Supabase configuration. Set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_PUBLISHABLE_KEY in your .env, then restart the dev server. " +
      "For a local stack, run `supabase start` and use the printed API URL and anon key."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
