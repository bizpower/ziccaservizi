import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminDeleteProject,
  adminListProjects,
  adminSaveProject,
} from "@/lib/content.functions";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/referenze")({
  component: AdminProjects,
});

type P = {
  id?: string;
  title: string;
  client: string;
  category: string;
  year: number | null;
  location: string;
  description: string;
  image_url: string;
  sort_order: number;
  published: boolean;
};

const empty: P = {
  title: "",
  client: "",
  category: "",
  year: new Date().getFullYear(),
  location: "",
  description: "",
  image_url: "",
  sort_order: 0,
  published: true,
};

function AdminProjects() {
  const listFn = useServerFn(adminListProjects);
  const saveFn = useServerFn(adminSaveProject);
  const delFn = useServerFn(adminDeleteProject);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<P | null>(null);

  const q = useQuery({ queryKey: ["admin-projects"], queryFn: () => listFn() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-projects"] });

  const save = async () => {
    if (!editing) return;
    try {
      await saveFn({
        data: {
          ...editing,
          client: editing.client || null,
          category: editing.category || null,
          location: editing.location || null,
          description: editing.description || null,
          year: editing.year || null,
        } as any,
      });
      toast.success("Referenza salvata");
      setEditing(null);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Errore");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare questa referenza?")) return;
    await delFn({ data: { id } });
    toast.success("Eliminata");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Referenze</h1>
          <p className="text-muted-foreground mt-1">Progetti e cantieri mostrati sul sito.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, sort_order: (q.data?.length ?? 0) + 1 })}
          className="inline-flex items-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold px-4 py-2.5 hover:shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nuova referenza
        </button>
      </div>

      {q.isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-electric" />
      ) : (
        <div className="grid gap-3">
          {(q.data ?? []).map((p: any) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-16 w-24 object-cover rounded-md" />
              ) : (
                <div className="h-16 w-24 rounded-md bg-muted grid place-items-center text-muted-foreground text-xs">no img</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-sm text-muted-foreground truncate">{[p.client, p.category, p.year].filter(Boolean).join(" · ")}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${p.published ? "bg-electric/10 text-electric" : "bg-muted text-muted-foreground"}`}>
                {p.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {p.published ? "Online" : "Bozza"}
              </span>
              <button onClick={() => setEditing(p)} className="p-2 rounded-md hover:bg-muted">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive">
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
              <h2 className="font-display text-xl font-bold">{editing.id ? "Modifica referenza" : "Nuova referenza"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <Field label="Titolo del progetto">
                <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Cliente">
                  <input className={inputCls} value={editing.client} onChange={(e) => setEditing({ ...editing, client: e.target.value })} />
                </Field>
                <Field label="Categoria (es. Industriale, Retail, Healthcare)">
                  <input className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Anno">
                  <input type="number" className={inputCls} value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value ? Number(e.target.value) : null })} />
                </Field>
                <Field label="Località">
                  <input className={inputCls} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
                </Field>
              </div>
              <Field label="Descrizione">
                <textarea rows={4} className={inputCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              <MediaUpload
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="projects"
                label="Foto principale"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ordine">
                  <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </Field>
                <Field label="Stato">
                  <select className={inputCls} value={String(editing.published)} onChange={(e) => setEditing({ ...editing, published: e.target.value === "true" })}>
                    <option value="true">Pubblicato</option>
                    <option value="false">Bozza</option>
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
