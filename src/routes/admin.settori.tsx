import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminDeleteSector,
  adminListSectors,
  adminSaveSector,
} from "@/lib/content.functions";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/settori")({
  component: AdminSectors,
});

type Sector = {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  image_url: string;
  bullets: string[];
  sort_order: number;
  published: boolean;
};

const empty: Sector = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  icon: "Zap",
  image_url: "",
  bullets: [],
  sort_order: 0,
  published: true,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function AdminSectors() {
  const listFn = useServerFn(adminListSectors);
  const saveFn = useServerFn(adminSaveSector);
  const delFn = useServerFn(adminDeleteSector);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Sector | null>(null);

  const q = useQuery({ queryKey: ["admin-sectors"], queryFn: () => listFn() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-sectors"] });

  const save = async () => {
    if (!editing) return;
    try {
      await saveFn({
        data: {
          ...editing,
          slug: editing.slug || slugify(editing.title),
          tagline: editing.tagline || null,
          description: editing.description || null,
          icon: editing.icon || null,
        } as any,
      });
      toast.success("Settore salvato");
      setEditing(null);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Errore salvataggio");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare questo settore?")) return;
    await delFn({ data: { id } });
    toast.success("Eliminato");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Settori operativi</h1>
          <p className="text-muted-foreground mt-1">Gestisci i settori mostrati sul sito.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, sort_order: (q.data?.length ?? 0) + 1 })}
          className="inline-flex items-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold px-4 py-2.5 hover:shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nuovo settore
        </button>
      </div>

      {q.isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-electric" />
      ) : (
        <div className="grid gap-3">
          {(q.data ?? []).map((s: any) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              {s.image_url ? (
                <img src={s.image_url} alt="" className="h-16 w-24 object-cover rounded-md" />
              ) : (
                <div className="h-16 w-24 rounded-md bg-muted grid place-items-center text-muted-foreground text-xs">no img</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-muted-foreground truncate">{s.tagline}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">/{s.slug} · ordine {s.sort_order}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${s.published ? "bg-electric/10 text-electric" : "bg-muted text-muted-foreground"}`}>
                {s.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {s.published ? "Online" : "Bozza"}
              </span>
              <button onClick={() => setEditing(s)} className="p-2 rounded-md hover:bg-muted" title="Modifica">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(s.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive" title="Elimina">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background rounded-2xl border border-border max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">{editing.id ? "Modifica settore" : "Nuovo settore"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <Field label="Titolo">
                <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              </Field>
              <Field label="Slug URL (auto)">
                <input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
              </Field>
              <Field label="Sottotitolo breve">
                <input className={inputCls} value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
              </Field>
              <Field label="Descrizione completa">
                <textarea rows={4} className={inputCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              <Field label="Punti chiave (uno per riga)">
                <textarea rows={4} className={inputCls} value={editing.bullets.join("\n")} onChange={(e) => setEditing({ ...editing, bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
              </Field>
              <Field label="Icona (Zap, Wrench, Building2, ShieldCheck, Cpu, Lightbulb)">
                <input className={inputCls} value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
              </Field>
              <MediaUpload
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="sectors"
                label="Immagine di copertina"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ordine di visualizzazione">
                  <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </Field>
                <Field label="Stato">
                  <select className={inputCls} value={String(editing.published)} onChange={(e) => setEditing({ ...editing, published: e.target.value === "true" })}>
                    <option value="true">Pubblicato</option>
                    <option value="false">Bozza (nascosto)</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-border">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md hover:bg-muted">Annulla</button>
              <button onClick={save} className="px-4 py-2 rounded-md bg-electric text-electric-foreground font-semibold hover:shadow-glow">Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-electric";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
