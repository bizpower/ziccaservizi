import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Accesso area riservata — Zicca Servizi" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [recupero, setRecupero] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Accesso effettuato");
    router.invalidate();
    navigate({ to: "/admin" });
  };

  // Invio del link di recupero. L'indirizzo di ritorno deve essere fra le
  // "Redirect URLs" consentite in Supabase -> Authentication -> URL Configuration.
  const onRecupero = async () => {
    if (!email) {
      toast.error("Inserisci prima la tua email");
      return;
    }
    setRecupero(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: absoluteUrl("/reset-password"),
    });
    setRecupero(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Non si conferma se l'indirizzo esiste: eviterebbe di rivelare quali
    // email sono registrate.
    toast.success("Se l'indirizzo è registrato, riceverai un'email con il link");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-ink text-white px-6 py-24">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8"
        >
          ← Torna al sito
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-elegant">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-10 w-10 rounded-md gradient-electric grid place-items-center">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Area riservata</div>
              <div className="font-display text-xl font-bold">Zicca Admin</div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-white/60">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-electric"
                placeholder="nome@azienda.it"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-white/60">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Accedi
            </button>
          </form>
          <button
            type="button"
            onClick={onRecupero}
            disabled={recupero}
            className="mt-4 text-sm text-white/60 hover:text-white underline underline-offset-4 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {recupero && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Password dimenticata?
          </button>
          <p className="mt-6 text-xs text-white/50 leading-relaxed">
            Accesso riservato al personale autorizzato di Zicca Servizi. Per richiedere le
            credenziali contatta l'amministratore IT.
          </p>
        </div>
      </div>
    </div>
  );
}
