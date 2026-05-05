import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-side client using service role key (bypasses RLS).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export { createClient };
