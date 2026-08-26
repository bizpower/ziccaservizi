import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListLeads, adminListProjects, adminListSectors } from "@/lib/content.functions";
import { Inbox, FolderKanban, Layers, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const leadsFn = useServerFn(adminListLeads);
  const projectsFn = useServerFn(adminListProjects);
  const sectorsFn = useServerFn(adminListSectors);

  // Le chiavi devono coincidere con quelle che le pagine di modifica invalidano
  // dopo un salvataggio, altrimenti i contatori restano fermi finché non si
  // ricarica la pagina.
  const leads = useQuery({ queryKey: ["leads"], queryFn: () => leadsFn() });
  const projects = useQuery({ queryKey: ["admin-projects"], queryFn: () => projectsFn() });
  const sectors = useQuery({ queryKey: ["admin-sectors"], queryFn: () => sectorsFn() });

  const newLeads = (leads.data ?? []).filter((l: any) => l.status === "new").length;

  const cards = [
    {
      label: "Nuove richieste",
      value: newLeads,
      icon: Inbox,
      accent: "bg-electric/10 text-electric",
    },
    {
      label: "Richieste totali",
      value: leads.data?.length ?? 0,
      icon: TrendingUp,
      accent: "bg-foreground/5 text-foreground",
    },
    {
      label: "Referenze online",
      value: (projects.data ?? []).filter((p: any) => p.published).length,
      icon: FolderKanban,
      accent: "bg-foreground/5 text-foreground",
    },
    {
      label: "Settori attivi",
      value: (sectors.data ?? []).filter((s: any) => s.published).length,
      icon: Layers,
      accent: "bg-foreground/5 text-foreground",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Panoramica del sito e delle richieste ricevute.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-border bg-card p-5">
              <div
                className={`inline-flex h-10 w-10 rounded-lg items-center justify-center mb-4 ${c.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-display font-bold">{c.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Ultime richieste</h2>
        {leads.isLoading ? (
          <p className="text-sm text-muted-foreground">Caricamento…</p>
        ) : (leads.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna richiesta ricevuta finora.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(leads.data ?? []).slice(0, 5).map((l: any) => (
              <li key={l.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {l.name} <span className="text-muted-foreground font-normal">— {l.email}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {l.subject || l.message.slice(0, 80)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${l.status === "new" ? "bg-electric/10 text-electric" : "bg-muted text-muted-foreground"}`}
                >
                  {l.status === "new"
                    ? "Nuova"
                    : l.status === "in_progress"
                      ? "In lavorazione"
                      : "Chiusa"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
