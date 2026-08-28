import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminDeleteLead, adminListLeads, adminUpdateLead } from "@/lib/content.functions";
import { toast } from "sonner";
import { Mail, Phone, Trash2, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/admin/lead")({
  component: AdminLeads,
});

function AdminLeads() {
  const listFn = useServerFn(adminListLeads);
  const updFn = useServerFn(adminUpdateLead);
  const delFn = useServerFn(adminDeleteLead);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  // Note interne alla richiesta: la colonna e la server function esistevano già,
  // mancava solo il campo per compilarle.
  const [note, setNote] = useState("");
  const [salvandoNote, setSalvandoNote] = useState(false);

  const q = useQuery({ queryKey: ["leads"], queryFn: () => listFn() });
  const leads = q.data ?? [];
  const current = leads.find((l: any) => l.id === selected) ?? leads[0];

  const refresh = () => qc.invalidateQueries({ queryKey: ["leads"] });

  // Ricarica le note quando cambia la richiesta selezionata.
  useEffect(() => {
    setNote(current?.notes ?? "");
  }, [current?.id, current?.notes]);

  const salvaNote = async () => {
    if (!current) return;
    setSalvandoNote(true);
    try {
      await updFn({ data: { id: current.id, notes: note.trim() || null } });
      toast.success("Note salvate");
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Errore nel salvataggio");
    } finally {
      setSalvandoNote(false);
    }
  };

  const setStatus = async (id: string, status: "new" | "in_progress" | "closed") => {
    await updFn({ data: { id, status } });
    toast.success("Stato aggiornato");
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare definitivamente questa richiesta?")) return;
    await delFn({ data: { id } });
    toast.success("Richiesta eliminata");
    setSelected(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Richieste ricevute</h1>
        <p className="text-muted-foreground mt-1">Tutti i contatti arrivati dal form del sito.</p>
      </div>

      {q.isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-electric" />
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Nessuna richiesta ricevuta finora.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden max-h-[70vh] overflow-y-auto">
            {leads.map((l: any) => {
              const active = current?.id === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                  className={`w-full text-left p-4 border-b border-border transition ${active ? "bg-electric/5" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{l.name}</div>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${l.status === "new" ? "bg-electric/10 text-electric" : "bg-muted text-muted-foreground"}`}
                    >
                      {l.status === "new"
                        ? "Nuova"
                        : l.status === "in_progress"
                          ? "Lav."
                          : "Chiusa"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {l.subject || l.message.slice(0, 60)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {new Date(l.created_at).toLocaleString("it-IT")}
                  </div>
                </button>
              );
            })}
          </div>

          {current && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold">{current.name}</h2>
                  {current.company && (
                    <p className="text-sm text-muted-foreground">{current.company}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(current.id)}
                  className="text-destructive hover:bg-destructive/10 rounded-md p-2"
                  title="Elimina"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href={`mailto:${current.email}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 hover:bg-muted"
                >
                  <Mail className="h-3.5 w-3.5" /> {current.email}
                </a>
                {current.phone && (
                  <a
                    href={`tel:${current.phone}`}
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 hover:bg-muted"
                  >
                    <Phone className="h-3.5 w-3.5" /> {current.phone}
                  </a>
                )}
              </div>

              {current.subject && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Oggetto
                  </div>
                  <div className="font-medium">{current.subject}</div>
                </div>
              )}

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Messaggio
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed mt-1">
                  {current.message}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Stato
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["new", "in_progress", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(current.id, s)}
                      className={`text-sm px-3 py-1.5 rounded-md border transition ${
                        current.status === s
                          ? "bg-electric text-electric-foreground border-electric"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {s === "new" ? "Nuova" : s === "in_progress" ? "In lavorazione" : "Chiusa"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Note interne
                  </div>
                  <button
                    onClick={salvaNote}
                    disabled={salvandoNote || note === (current.notes ?? "")}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-electric text-electric-foreground font-semibold hover:shadow-glow disabled:opacity-40"
                  >
                    {salvandoNote ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Salva note
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Appunti sulla lavorazione: chi ha richiamato, quando, esito…"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-electric"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Visibili solo agli amministratori, non vengono inviate a chi ha scritto.
                </p>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                Ricevuta il {new Date(current.created_at).toLocaleString("it-IT")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
