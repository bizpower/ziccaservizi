// Client Supabase per browser e SSR: usa la chiave publishable (anon) e passa
// quindi dalle policy RLS dello schema `zicca`.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config";

function createSupabaseClient() {
  return createClient<Database, "zicca">(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    // Le tabelle del sito vivono nello schema dedicato `zicca` (il progetto
    // Supabase ospita anche altre applicazioni).
    db: { schema: "zicca" },
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
