/**
 * Configurazione del progetto Supabase.
 *
 * URL e chiave publishable (anon) sono **pubblici per definizione**: finiscono
 * comunque nel bundle JavaScript servito al browser. Tenerli qui come default
 * significa che il sito funziona appena deployato, senza dover configurare
 * variabili d'ambiente sull'hosting.
 *
 * Restano sovrascrivibili da variabili d'ambiente per puntare a un altro
 * progetto (staging, fork del cliente) senza toccare il codice.
 *
 * Non esiste alcuna chiave segreta: l'applicazione non usa la service role.
 * Le autorizzazioni sono interamente demandate alle policy RLS dello schema
 * `zicca` e alle funzioni SECURITY DEFINER `submit_lead` / `claim_first_admin`.
 */

const DEFAULT_SUPABASE_URL = "https://mrbkuvbxqhwrtnhmpxum.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmt1dmJ4cWh3cnRuaG1weHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDA4ODksImV4cCI6MjEwMjQ3Njg4OX0.qJXKAFzW3liJgiaHVBRvbJFndXWkTt07Hew1G2yygWo";

/** `import.meta.env` in browser/build, `process.env` in SSR. */
function readEnv(viteKey: string, nodeKey: string): string | undefined {
  const fromVite = (import.meta.env as Record<string, string | undefined>)[viteKey];
  if (fromVite) return fromVite;
  if (typeof process !== "undefined" && process.env) return process.env[nodeKey];
  return undefined;
}

export const SUPABASE_URL =
  readEnv("VITE_SUPABASE_URL", "SUPABASE_URL") || DEFAULT_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  readEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY") ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;
