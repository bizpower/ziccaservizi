import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSiteSettings, upsertSiteSetting } from "@/lib/content.functions";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";

/** Configurazione della notifica email delle richieste dal form contatti. */
type LeadNotification = {
  enabled: boolean;
  to: string[];
  from: string;
  subject_prefix: string;
};

const emptyNotification: LeadNotification = {
  enabled: true,
  to: [],
  from: "Sito Zicca Servizi <noreply@ziccaservizi.it>",
  subject_prefix: "[Sito] Nuova richiesta",
};

function toNotification(value: unknown): LeadNotification {
  const v = (value ?? {}) as Partial<LeadNotification>;
  return {
    enabled: v.enabled !== false,
    to: Array.isArray(v.to) ? v.to.filter((x): x is string => typeof x === "string") : [],
    from: typeof v.from === "string" && v.from ? v.from : emptyNotification.from,
    subject_prefix:
      typeof v.subject_prefix === "string" && v.subject_prefix
        ? v.subject_prefix
        : emptyNotification.subject_prefix,
  };
}

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
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [muVideos, setMuVideos] = useState<VideoEntry[]>([]);
  const [notifica, setNotifica] = useState<LeadNotification>(emptyNotification);

  useEffect(() => {
    if (q.data) {
      setHero(q.data.hero ?? {});
      setStats(q.data.stats ?? []);
      setContact(q.data.contact ?? {});
      setVideos(Array.isArray(q.data.videos) ? q.data.videos : []);
      setMuVideos(Array.isArray(q.data.videos_milano_united) ? q.data.videos_milano_united : []);
      setNotifica(toNotification(q.data.lead_notification));
    }
  }, [q.data]);

  const save = async (key: string, value: any) => {
    try {
      await saveFn({ data: { key, value } });
      toast.success("Salvato");
      qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Errore");
    }
  };

  if (q.isLoading) return <Loader2 className="h-6 w-6 animate-spin text-electric" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Contenuti del sito</h1>
        <p className="text-muted-foreground mt-1">
          Modifica i testi della homepage e i dati di contatto.
        </p>
      </div>

      {/* HERO */}
      <Card title="Hero homepage" onSave={() => save("hero", hero)}>
        <Field label="Etichetta sopra il titolo">
          <input
            className={inputCls}
            value={hero.eyebrow ?? ""}
            onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
          />
        </Field>
        <Field label="Titolo principale">
          <textarea
            rows={2}
            className={inputCls}
            value={hero.title ?? ""}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
          />
        </Field>
        <Field label="Sottotitolo">
          <textarea
            rows={3}
            className={inputCls}
            value={hero.subtitle ?? ""}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Testo CTA principale">
            <input
              className={inputCls}
              value={hero.cta_primary ?? ""}
              onChange={(e) => setHero({ ...hero, cta_primary: e.target.value })}
            />
          </Field>
          <Field label="Testo CTA secondaria">
            <input
              className={inputCls}
              value={hero.cta_secondary ?? ""}
              onChange={(e) => setHero({ ...hero, cta_secondary: e.target.value })}
            />
          </Field>
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
            <p className="text-xs text-muted-foreground mt-2">
              Consigliato: mp4/webm max 10MB, 1920x1080, muted, senza audio. Autoplay + loop.
            </p>
          </div>
          <div>
            <MediaUpload
              label="Poster / fallback image"
              accept="image/*"
              folder="hero"
              value={hero.poster_url ?? ""}
              onChange={(url) => setHero({ ...hero, poster_url: url })}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Mostrata durante il caricamento del video, o al posto del video su mobile /
              connessioni lente.
            </p>
          </div>
        </div>
      </Card>

      {/* STATS */}
      <Card title="Numeri animati" onSave={() => save("stats", stats)}>
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-2 sm:grid-cols-[1fr_80px_60px_auto] gap-2 items-end"
            >
              <Field label="Etichetta">
                <input
                  className={inputCls}
                  value={s.label ?? ""}
                  onChange={(e) => updateArr(stats, setStats, i, { ...s, label: e.target.value })}
                />
              </Field>
              <Field label="Valore">
                <input
                  type="number"
                  className={inputCls}
                  value={s.value ?? 0}
                  onChange={(e) =>
                    updateArr(stats, setStats, i, { ...s, value: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Suffisso">
                <input
                  className={inputCls}
                  value={s.suffix ?? ""}
                  onChange={(e) => updateArr(stats, setStats, i, { ...s, suffix: e.target.value })}
                />
              </Field>
              <button
                onClick={() => setStats(stats.filter((_, k) => k !== i))}
                className="h-9 w-9 rounded-md hover:bg-destructive/10 text-destructive grid place-items-center"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setStats([...stats, { label: "", value: 0, suffix: "" }])}
            className="inline-flex items-center gap-2 text-sm text-electric hover:underline"
          >
            <Plus className="h-4 w-4" /> Aggiungi numero
          </button>
        </div>
      </Card>

      {/* VIDEO HOME */}
      <Card title="Video della homepage" onSave={() => save("videos", videos)}>
        <VideoListEditor
          items={videos}
          onChange={setVideos}
          folder="videos"
          hint="Compaiono nella sezione «I nostri video» della homepage. Se la lista è vuota la sezione non viene mostrata."
        />
      </Card>

      {/* VIDEO MILANO UNITED */}
      <Card title="Video Milano United" onSave={() => save("videos_milano_united", muVideos)}>
        <VideoListEditor
          items={muVideos}
          onChange={setMuVideos}
          folder="videos/milano-united"
          hint="Compaiono nella pagina /milano-united. Se la lista è vuota la sezione non viene mostrata."
        />
      </Card>

      {/* NOTIFICA RICHIESTE */}
      <Card
        title="Notifica email delle richieste"
        onSave={() =>
          save("lead_notification", {
            ...notifica,
            to: notifica.to.map((x) => x.trim()).filter(Boolean),
          })
        }
      >
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Ogni richiesta inviata dal form contatti viene sempre salvata in
          «Richieste». Qui si decide a chi mandarne anche una copia via email.
        </p>

        <label className="flex items-center gap-2 mb-4 text-sm font-medium">
          <input
            type="checkbox"
            checked={notifica.enabled}
            onChange={(e) => setNotifica({ ...notifica, enabled: e.target.checked })}
          />
          Invia una email a ogni nuova richiesta
        </label>

        <Field label="Destinatari">
          <div className="space-y-2">
            {notifica.to.map((addr, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputCls}
                  type="email"
                  placeholder="nome@azienda.it"
                  value={addr}
                  onChange={(e) =>
                    setNotifica({
                      ...notifica,
                      to: notifica.to.map((v, j) => (j === i ? e.target.value : v)),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setNotifica({ ...notifica, to: notifica.to.filter((_, j) => j !== i) })
                  }
                  aria-label="Rimuovi destinatario"
                  className="p-2 rounded-md hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setNotifica({ ...notifica, to: [...notifica.to, ""] })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-electric"
            >
              <Plus className="h-4 w-4" /> Aggiungi destinatario
            </button>
            {notifica.to.length === 0 && (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Nessun destinatario: al momento non parte alcuna email. Le richieste
                restano comunque visibili in «Richieste».
              </p>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Mittente">
            <input
              className={inputCls}
              value={notifica.from}
              onChange={(e) => setNotifica({ ...notifica, from: e.target.value })}
            />
          </Field>
          <Field label="Prefisso dell'oggetto">
            <input
              className={inputCls}
              value={notifica.subject_prefix}
              onChange={(e) => setNotifica({ ...notifica, subject_prefix: e.target.value })}
            />
          </Field>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Il dominio del mittente deve essere verificato presso il provider di invio,
          altrimenti le email non partono. Rispondendo all'email si risponde
          direttamente a chi ha compilato il form.
        </p>
      </Card>

      {/* CONTACT */}
      <Card title="Contatti azienda" onSave={() => save("contact", contact)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Telefono">
            <input
              className={inputCls}
              value={contact.phone ?? ""}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp (es. +393…)">
            <input
              className={inputCls}
              value={contact.whatsapp ?? ""}
              onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              value={contact.email ?? ""}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </Field>
          <Field label="PEC">
            <input
              className={inputCls}
              value={contact.pec ?? ""}
              onChange={(e) => setContact({ ...contact, pec: e.target.value })}
            />
          </Field>
          <Field label="Partita IVA">
            <input
              className={inputCls}
              value={contact.piva ?? ""}
              onChange={(e) => setContact({ ...contact, piva: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <fieldset className="rounded-lg border border-border p-4 space-y-2">
            <legend className="text-xs uppercase tracking-wider text-muted-foreground px-2">
              Sede di Milano
            </legend>
            <Field label="Etichetta">
              <input
                className={inputCls}
                value={contact.sede_milano?.label ?? ""}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    sede_milano: { ...contact.sede_milano, label: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Indirizzo">
              <input
                className={inputCls}
                value={contact.sede_milano?.address ?? ""}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    sede_milano: { ...contact.sede_milano, address: e.target.value },
                  })
                }
              />
            </Field>
          </fieldset>
          <fieldset className="rounded-lg border border-border p-4 space-y-2">
            <legend className="text-xs uppercase tracking-wider text-muted-foreground px-2">
              Sede di Torino
            </legend>
            <Field label="Etichetta">
              <input
                className={inputCls}
                value={contact.sede_torino?.label ?? ""}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    sede_torino: { ...contact.sede_torino, label: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Indirizzo">
              <input
                className={inputCls}
                value={contact.sede_torino?.address ?? ""}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    sede_torino: { ...contact.sede_torino, address: e.target.value },
                  })
                }
              />
            </Field>
          </fieldset>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn URL">
            <input
              className={inputCls}
              value={contact.social?.linkedin ?? ""}
              onChange={(e) =>
                setContact({ ...contact, social: { ...contact.social, linkedin: e.target.value } })
              }
            />
          </Field>
          <Field label="Instagram URL">
            <input
              className={inputCls}
              value={contact.social?.instagram ?? ""}
              onChange={(e) =>
                setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } })
              }
            />
          </Field>
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

type VideoEntry = {
  title?: string;
  description?: string;
  video_url?: string;
  poster_url?: string;
};

function VideoListEditor({
  items,
  onChange,
  folder,
  hint,
}: {
  items: VideoEntry[];
  onChange: (v: VideoEntry[]) => void;
  folder: string;
  hint: string;
}) {
  const update = (i: number, value: VideoEntry) => updateArr(items, onChange, i, value);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{hint}</p>

      {items.map((v, i) => (
        <fieldset key={i} className="rounded-lg border border-border p-4 space-y-3">
          <legend className="text-xs uppercase tracking-wider text-muted-foreground px-2">
            Video {i + 1}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Titolo">
              <input
                className={inputCls}
                value={v.title ?? ""}
                onChange={(e) => update(i, { ...v, title: e.target.value })}
              />
            </Field>
            <Field label="Descrizione breve">
              <input
                className={inputCls}
                value={v.description ?? ""}
                onChange={(e) => update(i, { ...v, description: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <MediaUpload
              label="File video (mp4/webm)"
              accept="video/mp4,video/webm"
              folder={folder}
              value={v.video_url ?? ""}
              onChange={(url) => update(i, { ...v, video_url: url })}
            />
            <MediaUpload
              label="Anteprima (immagine)"
              accept="image/*"
              folder={`${folder}/posters`}
              value={v.poster_url ?? ""}
              onChange={(url) => update(i, { ...v, poster_url: url })}
            />
          </div>
          <button
            onClick={() => onChange(items.filter((_, k) => k !== i))}
            className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
          >
            <Trash2 className="h-4 w-4" /> Rimuovi video
          </button>
        </fieldset>
      ))}

      <button
        onClick={() => onChange([...items, { title: "", description: "" }])}
        className="inline-flex items-center gap-2 text-sm text-electric hover:underline"
      >
        <Plus className="h-4 w-4" /> Aggiungi video
      </button>

      <p className="text-xs text-muted-foreground">
        Formato consigliato: mp4 H.264, verticale 9:16 per le gallery, max 50 MB per file (limite
        dello storage). Ricordati di premere «Salva».
      </p>
    </div>
  );
}

function Card({
  title,
  children,
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-md bg-electric text-electric-foreground font-semibold px-4 py-2 hover:shadow-glow"
        >
          <Save className="h-4 w-4" /> Salva
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
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
