import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { checkAdmin, claimFirstAdmin } from "@/lib/content.functions";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Inbox,
  Layers,
  FolderKanban,
  Award,
  Settings,
  Blocks,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Pannello amministrativo — Zicca Servizi" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/lead", label: "Richieste", icon: Inbox },
  { to: "/admin/settori", label: "Settori", icon: Layers },
  { to: "/admin/referenze", label: "Referenze", icon: FolderKanban },
  { to: "/admin/certificazioni", label: "Certificazioni", icon: Award },
  { to: "/admin/sezioni", label: "Sezioni custom", icon: Blocks },
  { to: "/admin/contenuti", label: "Contenuti sito", icon: Settings },
];


function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const checkAdminFn = useServerFn(checkAdmin);
  const claimFn = useServerFn(claimFirstAdmin);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const adminQuery = useQuery({
    queryKey: ["admin-check", user?.id],
    enabled: !!user,
    queryFn: () => checkAdminFn(),
  });

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await claimFn();
      if (res.claimed) {
        toast.success("Sei stato nominato amministratore");
        adminQuery.refetch();
      } else {
        toast.error("Esiste già un amministratore. Chiedi a lui di abilitarti.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Errore");
    } finally {
      setClaiming(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (loading || !user || adminQuery.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-white">
        <Loader2 className="h-8 w-8 animate-spin text-electric" />
      </div>
    );
  }

  if (!adminQuery.data?.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-white px-6">
        <div className="max-w-md text-center rounded-2xl border border-white/10 bg-white/5 p-10">
          <ShieldCheck className="h-12 w-12 mx-auto text-electric mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Account non abilitato</h1>
          <p className="text-white/70 text-sm mb-6">
            Il tuo account <strong>{user.email}</strong> non ha i permessi di amministratore.
            {" "}Se sei il primo utente del sistema puoi auto-nominarti amministratore.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="rounded-md bg-electric text-electric-foreground font-semibold py-3 hover:shadow-glow disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
              Diventa amministratore
            </button>
            <button onClick={logout} className="text-sm text-white/60 hover:text-white py-2">
              Esci
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary">
      <aside className="hidden lg:flex w-64 flex-col bg-ink text-white sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-md gradient-electric grid place-items-center font-display font-bold">Z</span>
            <div>
              <div className="font-display font-bold leading-none">ZICCA</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Admin</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <a
                key={item.to}
                href={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  active ? "bg-electric/15 text-electric border border-electric/30" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/50 truncate">{user.email}</div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden bg-ink text-white px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="font-display font-bold">ZICCA Admin</Link>
          <button onClick={logout} className="text-sm text-white/70">Esci</button>
        </header>
        <nav className="lg:hidden flex overflow-x-auto bg-ink text-white/80 border-t border-white/10">
          {nav.map((i) => (
            <a key={i.to} href={i.to} className="px-4 py-3 text-xs whitespace-nowrap">
              {i.label}
            </a>
          ))}
        </nav>
        <main className="p-6 lg:p-10 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
