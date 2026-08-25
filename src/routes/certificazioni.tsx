import { createFileRoute } from "@tanstack/react-router";
import { CustomSections } from "@/components/site/CustomSections";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Download, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { getPublishedCertifications } from "@/lib/content.functions";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/certificazioni")({
  head: () => ({
    meta: [
      { title: "Certificazioni — Zicca Servizi" },
      {
        name: "description",
        content:
          "Le certificazioni di Zicca Servizi: ISO 9001, ISO 14001, ISO 45001, SOA, ICIM e abilitazioni F-Gas.",
      },
      { property: "og:title", content: "Certificazioni — Zicca Servizi" },
      { property: "og:url", content: absoluteUrl("/certificazioni") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/certificazioni") }],
  }),
  component: CertificazioniPage,
});

type CertView = { key: string; code: string; title: string; body: string; pdf: string | null };

/** Usate finché il pannello admin non contiene certificazioni pubblicate. */
const fallbackCerts: CertView[] = [
  {
    key: "ISO 9001:2015",
    code: "ISO 9001:2015",
    title: "Sistema di Gestione Qualità",
    body: "Certificazione del sistema di gestione qualità per la progettazione, installazione e manutenzione di impianti.",
    pdf: null,
  },
  {
    key: "ISO 14001:2015",
    code: "ISO 14001:2015",
    title: "Gestione Ambientale",
    body: "Certificazione che attesta l'impegno verso la sostenibilità e la riduzione dell'impatto ambientale.",
    pdf: null,
  },
  {
    key: "ISO 45001:2018",
    code: "ISO 45001:2018",
    title: "Salute e Sicurezza sul Lavoro",
    body: "Sistema di gestione della sicurezza per tutela dei lavoratori e dei subappaltatori in cantiere.",
    pdf: null,
  },
  {
    key: "SOA OG11",
    code: "SOA OG11",
    title: "Impianti tecnologici",
    body: "Attestazione SOA per la categoria impianti tecnologici, requisito fondamentale per appalti pubblici.",
    pdf: null,
  },
  {
    key: "SOA OS28",
    code: "SOA OS28",
    title: "Impianti termici e di condizionamento",
    body: "Attestazione SOA per la realizzazione di impianti termici e di climatizzazione.",
    pdf: null,
  },
  {
    key: "SOA OS30",
    code: "SOA OS30",
    title: "Impianti elettrici, telefonici e radiotelefonici",
    body: "Attestazione SOA per la categoria impianti elettrici nelle sue declinazioni.",
    pdf: null,
  },
  {
    key: "ICIM",
    code: "ICIM",
    title: "Ente di certificazione",
    body: "Certificato ICIM per la conformità dei processi e dei sistemi di gestione aziendale.",
    pdf: null,
  },
  {
    key: "F-Gas",
    code: "F-Gas",
    title: "Patentino refrigeranti",
    body: "Abilitazione per la manipolazione dei gas fluorurati ad effetto serra ai sensi del Reg. UE 517/2014.",
    pdf: null,
  },
];

type CertRow = {
  id: string;
  title: string;
  issuer: string | null;
  year: number | null;
  description: string | null;
  pdf_url: string | null;
};

function toCertViews(rows: unknown): CertView[] {
  if (!Array.isArray(rows) || rows.length === 0) return fallbackCerts;
  return (rows as CertRow[]).map((c) => ({
    key: c.id,
    code: [c.issuer, c.year].filter(Boolean).join(" · "),
    title: c.title,
    body: c.description ?? "",
    pdf: c.pdf_url,
  }));
}

function CertificazioniPage() {
  const fetchCerts = useServerFn(getPublishedCertifications);
  const { data } = useQuery({
    queryKey: ["published-certifications"],
    queryFn: () => fetchCerts(),
  });
  const certs = toCertViews(data);

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 container-px mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-electric mb-6">
            Certificazioni
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Standard <span className="text-gradient">riconosciuti</span>,<br />
            qualità garantita.
          </h1>
          <p className="mt-8 text-xl text-muted-foreground max-w-2xl">
            Operiamo nel rispetto delle principali norme tecniche e di gestione, con audit periodici
            e procedure documentate.
          </p>
        </div>
      </section>

      <section className="pb-24 md:pb-32 container-px mx-auto max-w-7xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {certs.map((c) => (
            <div
              key={c.key}
              className="group relative rounded-2xl border border-border bg-card p-7 hover-lift overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 gradient-electric scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background group-hover:bg-electric group-hover:text-electric-foreground transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
              {c.code && (
                <div className="font-mono text-xs text-muted-foreground mb-2">{c.code}</div>
              )}
              <h3 className="font-display font-bold text-lg leading-tight">{c.title}</h3>
              {c.body && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              )}
              {c.pdf && (
                <a
                  href={c.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-electric hover:underline"
                >
                  <Download className="h-3.5 w-3.5" /> Scarica PDF
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Iscrizioni e albi"
            title="Operiamo nel pieno rispetto delle normative."
            description="Iscritti alla Camera di Commercio di Milano, Albo Gestori Ambientali, e abilitati ai sensi del DM 37/08 per tutte le categorie impiantistiche."
          />
        </div>
      </section>
      <CustomSections page="certificazioni" />
    </>
  );
}
