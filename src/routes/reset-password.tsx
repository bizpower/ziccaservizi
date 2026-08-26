import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

/**
 * Pagina di impostazione della nuova password.
 *
 * Ci si arriva dal link ricevuto via email: Supabase apre la pagina con un
 * token nel frammento dell'URL e il client lo trasforma in una sessione di
 * recupero (`detectSessionInUrl`, attivo per default). Da lì si può cambiare
 * la password con `updateUser`.
 */
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nuova password — Zicca Servizi" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);
  const [valido, setValido] = useState(false);
  const [password, setPassword] = useState("");
  const [conferma, setConferma] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // La sessione di recupero può arrivare subito o poco dopo, quando il client
    // ha finito di leggere il token dall'URL: si ascoltano entrambi i casi.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setValido(true);
        setPronto(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setValido(!!data.session);
      setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La password deve essere di almeno 8 caratteri");
      return;
    }
    if (password !== conferma) {
      toast.error("Le due password non coincidono");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password aggiornata");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-ink text-white px-6 py-24">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8"
        >
          ← Torna all'accesso
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-elegant">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-10 w-10 rounded-md gradient-electric grid place-items-center">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Area riservata</div>
              <div className="font-display text-xl font-bold">Nuova password</div>
            </div>
          </div>

          {!pronto ? (
            <div className="py-6 grid place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-electric" />
            </div>
          ) : !valido ? (
            <p className="text-sm text-white/70 leading-relaxed">
              Questo link non è più valido: i link di recupero scadono dopo poco tempo e
              possono essere usati una volta sola. Torna all'accesso e richiedine uno nuovo.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60">
                  Nuova password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-electric"
                  placeholder="almeno 8 caratteri"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60">
                  Conferma password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={conferma}
                  onChange={(e) => setConferma(e.target.value)}
                  className="mt-1 w-full rounded-md bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-electric"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold py-3 hover:shadow-glow transition disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Salva la nuova password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
