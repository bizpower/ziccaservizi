import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  adminDeleteCustomSection,
  adminListCustomSections,
  adminSaveCustomSection,
  PAGE_LOCATIONS,
} from "@/lib/content.functions";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/sezioni")({
  component: AdminCustomSections,
});

type Section = {
  id?: string;
  page_location: string;
  eyebrow: string;
  title: string;
  heading_level: number;
  subtitle: string;
  body: string;
  image_url: string;
  image_position: "left" | "right" | "top" | "background" | "none";
  cta_label: string;
  cta_url: string;
  background_style: "default" | "muted" | "dark" | "gradient";
  sort_order: number;
  published: boolean;
};

const empty: Section = {
  page_location: "home",
  eyebrow: "",
  title: "",
  heading_level: 2,
  subtitle: "",
  body: "",
  image_url: "",
  image_position: "right",
  cta_label: "",
  cta_url: "",
  background_style: "default",
  sort_order: 0,
  published: true,
};

function AdminCustomSections() {
  const listFn = useServerFn(adminListCustomSections);
  const saveFn = useServerFn(adminSaveCustomSection);
  const delFn = useServerFn(adminDeleteCustomSection);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Section | null>(null);

  const q = useQuery({ queryKey: ["admin-custom-sections"], queryFn: () => listFn() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-custom-sections"] });

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const s of q.data ?? []) {
      const arr = map.get(s.page_location) ?? [];
      arr.push(s);
      map.set(s.page_location, arr);
    }
    return map;
  }, [q.data]);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("Inserisci un titolo");
      return;
    }
    try {
      await saveFn({
        data: {
          ...editing,
          eyebrow: editing.eyebrow || null,
          subtitle: editing.subtitle || null,
          body: editing.body || null,
          cta_label: editing.cta_label || null,
          cta_url: editing.cta_url || null,
        } as any,
      });
      toast.success("Sezione salvata");
      setEditing(null);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Errore salvataggio");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare questa sezione?")) return;
    await delFn({ data: { id } });
    toast.success("Eliminata");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Sezioni personalizzate</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Aggiungi blocchi di contenuto liberi (testo, immagine, pulsante) a qualsiasi pagina del sito.
            Scegli la pagina, l'ordine e lo stile.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, sort_order: (q.data?.length ?? 0) + 1 })}
          className="inline-flex items-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold px-4 py-2.5 hover:shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nuova sezione
        </button>
      </div>

      {q.isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-electric" />
      ) : (q.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Nessuna sezione personalizzata. Creane una per arricchire il sito.
        </div>
      ) : (
        <div className="space-y-8">
          {PAGE_LOCATIONS.map((p) => {
            const items = grouped.get(p.value) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={p.value}>
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Pagina: {p.label}
                </h2>
                <div className="grid gap-3">
                  {items.map((s: any) => (
                    <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="h-16 w-24 object-cover rounded-md" />
                      ) : (
                        <div className="h-16 w-24 rounded-md bg-muted grid place-items-center text-muted-foreground text-xs">
                          no img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{s.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{s.subtitle}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          H{s.heading_level} · immagine {s.image_position} · ordine {s.sort_order}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                          s.published ? "bg-electric/10 text-electric" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {s.published ? "Online" : "Bozza"}
                      </span>
                      <button onClick={() => setEditing(s)} className="p-2 rounded-md hover:bg-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="p-2 rounded-md hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background rounded-2xl border border-border max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">
                {editing.id ? "Modifica sezione" : "Nuova sezione"}
              </h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Pagina di destinazione">
                  <select
                    className={inputCls}
                    value={editing.page_location}
                    onChange={(e) => setEditing({ ...editing, page_location: e.target.value })}
                  >
                    {PAGE_LOCATIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Livello del titolo (SEO)">
                  <select
                    className={inputCls}
                    value={editing.heading_level}
                    onChange={(e) => setEditing({ ...editing, heading_level: Number(e.target.value) })}
                  >
                    <option value={2}>H2 — Titolo principale di sezione</option>
                    <option value={3}>H3 — Sottosezione</option>
                    <option value={4}>H4 — Titolo minore</option>
                  </select>
                </Field>
              </div>

              <Field label="Etichetta sopra il titolo (opzionale)">
                <input
                  className={inputCls}
                  placeholder="es. La nostra promessa"
                  value={editing.eyebrow}
                  onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
                />
              </Field>

              <Field label="Titolo">
                <input
                  className={inputCls}
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>

              <Field label="Sottotitolo (opzionale)">
                <input
                  className={inputCls}
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </Field>

              <Field label="Testo (supporta markdown: **grassetto**, - elenchi, [link](url))">
                <textarea
                  rows={8}
                  className={inputCls}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </Field>

              <MediaUpload
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="custom-sections"
                label="Immagine (opzionale)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Posizione immagine">
                  <select
                    className={inputCls}
                    value={editing.image_position}
                    onChange={(e) =>
                      setEditing({ ...editing, image_position: e.target.value as Section["image_position"] })
                    }
                  >
                    <option value="right">A destra del testo</option>
                    <option value="left">A sinistra del testo</option>
                    <option value="top">Sopra il testo</option>
                    <option value="background">Sfondo a tutta larghezza</option>
                    <option value="none">Nessuna immagine</option>
                  </select>
                </Field>
                <Field label="Stile di sfondo">
                  <select
                    className={inputCls}
                    value={editing.background_style}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        background_style: e.target.value as Section["background_style"],
                      })
                    }
                  >
                    <option value="default">Bianco (default)</option>
                    <option value="muted">Grigio chiaro</option>
                    <option value="dark">Scuro</option>
                    <option value="gradient">Gradient brand</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Etichetta pulsante (opzionale)">
                  <input
                    className={inputCls}
                    placeholder="es. Scopri di più"
                    value={editing.cta_label}
                    onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })}
                  />
                </Field>
                <Field label="Link pulsante">
                  <input
                    className={inputCls}
                    placeholder="es. /contatti o https://..."
                    value={editing.cta_url}
                    onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ordine di visualizzazione">
                  <input
                    type="number"
                    className={inputCls}
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Stato">
                  <select
                    className={inputCls}
                    value={String(editing.published)}
                    onChange={(e) => setEditing({ ...editing, published: e.target.value === "true" })}
                  >
                    <option value="true">Pubblicato</option>
                    <option value="false">Bozza (nascosto)</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-border">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md hover:bg-muted">
                Annulla
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-md bg-electric text-electric-foreground font-semibold hover:shadow-glow"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-electric";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
