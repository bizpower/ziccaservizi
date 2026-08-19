import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSiteSettings, upsertSiteSetting } from "@/lib/content.functions";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";

export const Route = createFileRoute("/admin/contenuti")({
  component: AdminSettings,
});

function AdminSettings() {
  const fetchFn = useServerFn(getSiteSettings);
  const saveFn = useServerFn(upsertSiteSetting);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["site-settings-admin"], queryFn: () => fetchFn() });
  const [hero, setHero] = useState<any>({});
  const [stats, setStats] = useState<any[]>([]);
  const [contact, setContact] = useState<any>({});

  useEffect(() => {
    if (q.data) {
      setHero(q.data.hero ?? {});
      setStats(q.data.stats ?? []);
      setContact(q.data.contact ?? {});
    }
  }, [q.data]);

  const save = async (key: string, value: any) => {
    try {
      await saveFn({ data: { key, value } });
      toast.success("Salvato");
      qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e: any) { toast.error(e?.message ?? "Errore"); }
  };

  if (q.isLoading) return <Loader2 className="h-6 w-6 animate-spin text-electric" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Contenuti del sito</h1>
        <p className="text-muted-foreground mt-1">Modifica i testi della homepage e i dati di contatto.</p>
      </div>

      {/* HERO */}
      <Card title="Hero homepage" onSave={() => save("hero", hero)}>
        <Field label="Etichetta sopra il titolo">
          <input className={inputCls} value={hero.eyebrow ?? ""} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
        </Field>
        <Field label="Titolo principale">
          <textarea rows={2} className={inputCls} value={hero.title ?? ""} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
        </Field>
        <Field label="Sottotitolo">
          <textarea rows={3} className={inputCls} value={hero.subtitle ?? ""} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Testo CTA principale"><input className={inputCls} value={hero.cta_primary ?? ""} onChange={(e) => setHero({ ...hero, cta_primary: e.target.value })} /></Field>
          <Field label="Testo CTA secondaria"><input className={inputCls} value={hero.cta_secondary ?? ""} onChange={(e) => setHero({ ...hero, cta_secondary: e.target.value })} /></Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <MediaUpload
              label="Video di sfondo (mp4, opzionale)"
              accept="video/mp4,video/webm"
              folder="hero"
              value={hero.video_url ?? ""}
              onChange={(url) => setHero({ ...hero, video_url: url })}
            />
            <p className="text-xs text-muted-foreground mt-2">Consigliato: mp4/webm max 10MB, 1920x1080, muted, senza audio. Autoplay + loop.</p>
          </div>
          <div>
            <MediaUpload
              label="Poster / fallback image"
              accept="image/*"
              folder="hero"
              value={hero.poster_url ?? ""}
              onChange={(url) => setHero({ ...hero, poster_url: url })}
            />
            <p className="text-xs text-muted-foreground mt-2">Mostrata durante il caricamento del video, o al posto del video su mobile / connessioni lente.</p>
          </div>
        </div>
      </Card>

      {/* STATS */}
      <Card title="Numeri animati" onSave={() => save("stats", stats)}>
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_80px_60px_auto] gap-2 items-end">
              <Field label="Etichetta">
                <input className={inputCls} value={s.label ?? ""} onChange={(e) => updateArr(stats, setStats, i, { ...s, label: e.target.value })} />
              </Field>
              <Field label="Valore">
                <input type="number" className={inputCls} value={s.value ?? 0} onChange={(e) => updateArr(stats, setStats, i, { ...s, value: Number(e.target.value) })} />
              </Field>
              <Field label="Suffisso">
                <input className={inputCls} value={s.suffix ?? ""} onChange={(e) => updateArr(stats, setStats, i, { ...s, suffix: e.target.value })} />
              </Field>
              <button onClick={() => setStats(stats.filter((_, k) => k !== i))} className="h-9 w-9 rounded-md hover:bg-destructive/10 text-destructive grid place-items-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => setStats([...stats, { label: "", value: 0, suffix: "" }])} className="inline-flex items-center gap-2 text-sm text-electric hover:underline">
            <Plus className="h-4 w-4" /> Aggiungi numero
          </button>
        </div>
      </Card>

      {/* CONTACT */}
      <Card title="Contatti azienda" onSave={() => save("contact", contact)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Telefono"><input className={inputCls} value={contact.phone ?? ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
          <Field label="WhatsApp (es. +393…)"><input className={inputCls} value={contact.whatsapp ?? ""} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} /></Field>
          <Field label="Email"><input className={inputCls} value={contact.email ?? ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
          <Field label="PEC"><input className={inputCls} value={contact.pec ?? ""} onChange={(e) => setContact({ ...contact, pec: e.target.value })} /></Field>
          <Field label="Partita IVA"><input className={inputCls} value={contact.piva ?? ""} onChange={(e) => setContact({ ...contact, piva: e.target.value })} /></Field>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <fieldset className="rounded-lg border border-border p-4 space-y-2">
            <legend className="text-xs uppercase tracking-wider text-muted-foreground px-2">Sede di Milano</legend>
            <Field label="Etichetta"><input className={inputCls} value={contact.sede_milano?.label ?? ""} onChange={(e) => setContact({ ...contact, sede_milano: { ...contact.sede_milano, label: e.target.value } })} /></Field>
            <Field label="Indirizzo"><input className={inputCls} value={contact.sede_milano?.address ?? ""} onChange={(e) => setContact({ ...contact, sede_milano: { ...contact.sede_milano, address: e.target.value } })} /></Field>
          </fieldset>
          <fieldset className="rounded-lg border border-border p-4 space-y-2">
            <legend className="text-xs uppercase tracking-wider text-muted-foreground px-2">Sede di Torino</legend>
            <Field label="Etichetta"><input className={inputCls} value={contact.sede_torino?.label ?? ""} onChange={(e) => setContact({ ...contact, sede_torino: { ...contact.sede_torino, label: e.target.value } })} /></Field>
            <Field label="Indirizzo"><input className={inputCls} value={contact.sede_torino?.address ?? ""} onChange={(e) => setContact({ ...contact, sede_torino: { ...contact.sede_torino, address: e.target.value } })} /></Field>
          </fieldset>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn URL"><input className={inputCls} value={contact.social?.linkedin ?? ""} onChange={(e) => setContact({ ...contact, social: { ...contact.social, linkedin: e.target.value } })} /></Field>
          <Field label="Instagram URL"><input className={inputCls} value={contact.social?.instagram ?? ""} onChange={(e) => setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } })} /></Field>
        </div>
      </Card>
    </div>
  );
}

function updateArr<T>(arr: T[], setter: (v: T[]) => void, i: number, value: T) {
  const next = [...arr];
  next[i] = value;
  setter(next);
}

function Card({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => void }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <button onClick={onSave} className="inline-flex items-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold px-4 py-2 hover:shadow-glow">
          <Save className="h-4 w-4" /> Salva
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const inputCls = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-electric";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
