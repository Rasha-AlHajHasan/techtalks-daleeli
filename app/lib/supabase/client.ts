import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Singleton pattern — only one instance is ever created ──────────────────
let instance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Bypasses the Web Lock API to prevent lock conflicts
          // Safe because we use a singleton — no concurrent instances
          lock: async (
            _name: string,
            _acquireTimeout: number,
            fn: () => Promise<unknown>
          ) => fn(),
        },
      }
    );
  }
  return instance;
}

// Named export for convenience — same instance every time
export const supabase = getSupabaseClient();

export { createClient };
