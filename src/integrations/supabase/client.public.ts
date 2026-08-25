// Client Supabase usato dalle server function per le operazioni pubbliche:
// letture dei contenuti pubblicati e invio di una richiesta dal form contatti.
//
// Usa la chiave publishable (anon), quindi è soggetto alle policy RLS: legge
// solo le righe pubblicate e non può in alcun modo scrivere sulle tabelle.
// A differenza del client di `client.ts` non tiene sessione: gira sul server,
// dove una sessione condivisa fra richieste diverse sarebbe un errore.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config";

function createSupabasePublicClient() {
  return createClient<Database, "zicca">(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    db: { schema: "zicca" },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabasePublic: ReturnType<typeof createSupabasePublicClient> | undefined;

export const supabasePublic = new Proxy({} as ReturnType<typeof createSupabasePublicClient>, {
  get(_, prop, receiver) {
    if (!_supabasePublic) _supabasePublic = createSupabasePublicClient();
    return Reflect.get(_supabasePublic, prop, receiver);
  },
});
