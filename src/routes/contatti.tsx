import { createFileRoute } from "@tanstack/react-router";
import { CustomSections } from "@/components/site/CustomSections";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { submitLead } from "@/lib/content.functions";
import { toast } from "sonner";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti — Zicca Servizi · Milano · Torino" },
      {
        name: "description",
        content:
          "Contatta Zicca Servizi: sedi a Milano (San Donato Milanese) e Torino. Telefono, email e modulo per richieste e preventivi.",
      },
      { property: "og:title", content: "Contatti — Zicca Servizi" },
      { property: "og:url", content: absoluteUrl("/contatti") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contatti") }],
  }),
  component: ContattiPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome troppo corto").max(100),
  email: z.string().trim().email("Email non valida").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10, "Messaggio troppo breve").max(2000),
});

function ContattiPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sendFn = useServerFn(submitLead);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const r = schema.safeParse(data);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => {
        errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await sendFn({ data: r.data as any });
      setSent(true);
      form.reset();
      toast.success("Richiesta inviata. Ti ricontatteremo a breve.");
    } catch (err: any) {
      toast.error(err?.message ?? "Errore invio");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 container-px mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-electric mb-6">
            Contatti
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Parliamo del tuo <span className="text-gradient">prossimo progetto.</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground max-w-2xl">
            Compila il modulo o contattaci direttamente: rispondiamo entro 24 ore lavorative.
          </p>
        </div>
      </section>

      <section className="pb-24 md:pb-32 container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <form
              onSubmit={onSubmit}
              className="bg-card border border-border rounded-2xl p-8 md:p-10 space-y-6 shadow-elegant"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Nome e cognome" name="name" error={errors.name} required />
                <Field label="Email" name="email" type="email" error={errors.email} required />
                <Field label="Telefono" name="phone" error={errors.phone} />
                <Field label="Oggetto" name="subject" error={errors.subject} required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Messaggio *
                </label>
                <textarea
                  name="message"
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-electric focus:border-electric transition-all resize-none"
                />
                {errors.message && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              {sent && (
                <div className="p-4 rounded-xl bg-electric/10 border border-electric/30 text-sm font-medium">
                  Grazie! Il tuo messaggio è stato registrato. Ti ricontatteremo a breve.
                </div>
              )}

              <button
                type="submit"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-base font-semibold hover:bg-electric hover:text-electric-foreground transition-all"
              >
                Invia messaggio{" "}
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="text-xs text-muted-foreground">
                Inviando il modulo accetti la nostra Privacy Policy. I dati saranno trattati
                esclusivamente per rispondere alla tua richiesta.
              </p>
            </form>
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <ContactCard
              title="Sede di Milano"
              address="Via Civesio, 3 — 20097 San Donato Milanese (MI)"
              phone="02 55230921"
              email="info@ziccaservizi.it"
              maps="https://maps.app.goo.gl/bsAATaAyYa8wJ4Ux8"
            />
            <ContactCard
              title="Filiale di Torino"
              address="Via Genova, 23 — 10126 Torino"
              phone="02 36571620"
              email="torino@ziccaservizi.it"
              maps="https://goo.gl/maps/bh6Yk5qkHsLzX3eE9"
            />
            <a
              href="https://wa.me/390255230921"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-ink text-ink-foreground p-6 hover-lift"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric text-electric-foreground">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <div>
                  <div className="font-display font-bold">WhatsApp</div>
                  <div className="text-sm text-white/60">Risposta veloce</div>
                </div>
              </div>
              <span className="text-electric font-semibold">→</span>
            </a>
          </aside>
        </div>

        <div className="mt-16 rounded-3xl overflow-hidden border border-border shadow-elegant">
          <iframe
            title="Mappa Zicca Servizi Milano"
            src="https://www.google.com/maps?q=Via+Civesio+3+San+Donato+Milanese&output=embed"
            className="w-full h-[420px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <CustomSections page="contatti" />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-electric focus:border-electric transition-all"
      />
      {error && (
        <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

function ContactCard({
  title,
  address,
  phone,
  email,
  maps,
}: {
  title: string;
  address: string;
  phone: string;
  email: string;
  maps: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover-lift">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-electric mb-4">
        {title}
      </div>
      <div className="space-y-3 text-sm">
        <a
          href={maps}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-3 hover:text-electric transition-colors"
        >
          <MapPin className="h-4 w-4 mt-0.5 text-electric shrink-0" /> {address}
        </a>
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex items-center gap-3 hover:text-electric transition-colors"
        >
          <Phone className="h-4 w-4 text-electric" /> {phone}
        </a>
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 hover:text-electric transition-colors"
        >
          <Mail className="h-4 w-4 text-electric" /> {email}
        </a>
      </div>
    </div>
  );
}
