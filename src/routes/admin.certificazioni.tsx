import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminDeleteCertification,
  adminListCertifications,
  adminSaveCertification,
} from "@/lib/content.functions";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Eye, EyeOff, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/certificazioni")({
  component: AdminCerts,
});

type C = {
  id?: string;
  title: string;
  issuer: string;
  year: number | null;
  description: string;
  pdf_url: string;
  logo_url: string;
  sort_order: number;
  published: boolean;
};

const empty: C = {
  title: "", issuer: "", year: new Date().getFullYear(), description: "",
  pdf_url: "", logo_url: "", sort_order: 0, published: true,
};

function AdminCerts() {
  const listFn = useServerFn(adminListCertifications);
  const saveFn = useServerFn(adminSaveCertification);
  const delFn = useServerFn(adminDeleteCertification);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<C | null>(null);

  const q = useQuery({ queryKey: ["admin-certs"], queryFn: () => listFn() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-certs"] });

  const save = async () => {
    if (!editing) return;
    try {
      await saveFn({ data: {
        ...editing,
        issuer: editing.issuer || null,
        description: editing.description || null,
        year: editing.year || null,
      } as any });
      toast.success("Certificazione salvata");
      setEditing(null);
      refresh();
    } catch (e: any) { toast.error(e?.message ?? "Errore"); }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare?")) return;
    await delFn({ data: { id } });
    toast.success("Eliminata");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Certificazioni</h1>
          <p className="text-muted-foreground mt-1">ISO, SOA e altre certificazioni dell'azienda.</p>
        </div>
        <button onClick={() => setEditing({ ...empty, sort_order: (q.data?.length ?? 0) + 1 })}
          className="inline-flex items-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold px-4 py-2.5 hover:shadow-glow">
          <Plus className="h-4 w-4" /> Nuova certificazione
        </button>
      </div>

      {q.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-electric" /> : (
        <div className="grid gap-3">
          {(q.data ?? []).map((c: any) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              {c.logo_url ? (
                <img src={c.logo_url} alt="" className="h-12 w-12 object-contain" />
              ) : (
                <div className="h-12 w-12 rounded-md bg-muted grid place-items-center text-muted-foreground"><FileText className="h-5 w-5" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-muted-foreground truncate">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>
              </div>
              {c.pdf_url && <a href={c.pdf_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted">PDF</a>}
              <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${c.published ? "bg-electric/10 text-electric" : "bg-muted text-muted-foreground"}`}>
                {c.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {c.published ? "Online" : "Bozza"}
              </span>
              <button onClick={() => setEditing(c)} className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(c.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background rounded-2xl border border-border max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">{editing.id ? "Modifica certificazione" : "Nuova certificazione"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <Field label="Titolo (es. ISO 9001:2015)">
                <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ente certificatore">
                  <input className={inputCls} value={editing.issuer} onChange={(e) => setEditing({ ...editing, issuer: e.target.value })} />
                </Field>
                <Field label="Anno">
                  <input type="number" className={inputCls} value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value ? Number(e.target.value) : null })} />
                </Field>
              </div>
              <Field label="Descrizione">
                <textarea rows={3} className={inputCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              <MediaUpload value={editing.logo_url} onChange={(url) => setEditing({ ...editing, logo_url: url })} folder="certifications/logos" label="Logo ente" />
              <MediaUpload value={editing.pdf_url} onChange={(url) => setEditing({ ...editing, pdf_url: url })} folder="certifications/pdf" accept="application/pdf" label="PDF certificato (opzionale)" />
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
  return <label className="block"><span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
