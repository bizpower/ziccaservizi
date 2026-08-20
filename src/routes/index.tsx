import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomSections } from "@/components/site/CustomSections";
import { VideoShowcase } from "@/components/site/VideoShowcase";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublishedSectors, getSiteSettings } from "@/lib/content.functions";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  HardHat,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import heroImg from "@/assets/hero-industrial.jpg";
import teamImg from "@/assets/team.jpg";
import ctaBg from "@/assets/cta-bg.jpg";
import { SectionHeader } from "@/components/site/SectionHeader";
import { toSectorViews } from "@/lib/sector-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zicca Servizi — Impianti tecnologici civili e industriali · Milano · Torino" },
      {
        name: "description",
        content:
          "Dal 1998 progettiamo, installiamo e gestiamo impianti tecnologici civili e industriali con edilizia integrata. Engineering certificato a Milano e Torino.",
      },
      { property: "og:title", content: "Zicca Servizi — Engineering & Impianti" },
      {
        property: "og:description",
        content:
          "Progettazione, installazione, manutenzione e gestione di impianti tecnologici civili e industriali.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Zicca Servizi S.r.l.",
          url: "/",
          foundingDate: "1998",
          address: [
            {
              "@type": "PostalAddress",
              streetAddress: "Via Civesio, 3",
              addressLocality: "San Donato Milanese",
              postalCode: "20097",
              addressCountry: "IT",
            },
            {
              "@type": "PostalAddress",
              streetAddress: "Via Genova, 23",
              addressLocality: "Torino",
              postalCode: "10126",
              addressCountry: "IT",
            },
          ],
          telephone: "+39 02 55230921",
          email: "info@ziccaservizi.it",
        }),
      },
    ],
  }),
  component: HomePage,
});

function useCountUp(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setVal(Math.floor(eased * target));
              if (t < 1) requestAnimationFrame(tick);
              else setVal(target);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [target, duration]);
  return { ref, val };
}

function StatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { ref, val } = useCountUp(value);
  return (
    <span
      ref={ref}
      className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
    >
      {val}
      {suffix}
    </span>
  );
}

function HomePage() {
  const fetchSettings = useServerFn(getSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchSettings(),
  });
  const fetchSectors = useServerFn(getPublishedSectors);
  const { data: sectorsData } = useQuery({
    queryKey: ["published-sectors"],
    queryFn: () => fetchSectors(),
  });
  const sectors = toSectorViews(sectorsData);
  const videoUrl: string | undefined = settings?.hero?.video_url || undefined;
  const posterUrl: string = settings?.hero?.poster_url || heroImg;
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const showVideo = !!videoUrl && !isMobile;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <img
          src={posterUrl}
          alt="Impianti industriali Zicca Servizi"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${showVideo && videoReady ? "opacity-0" : "opacity-100"}`}
          width={1920}
          height={1280}
          fetchPriority="high"
        />
        {showVideo && (
          <video
            key={videoUrl}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterUrl}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
          >
            <source src={videoUrl} />
          </video>
        )}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grid-lines opacity-30" />

        <div className="relative container-px mx-auto max-w-7xl pb-20 md:pb-28 pt-32 text-white">
          <div className="reveal max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs font-medium uppercase tracking-[0.18em] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse" />
              Engineering & impianti dal 1998
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-balance">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-white/90 mb-3 tracking-tight">
                Zicca Servizi SRL
              </span>
              Progettiamo, installiamo
              <br />e gestiamo <span className="text-gradient">impianti</span>
              <br />
              che fanno funzionare l'industria.
            </h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/80 leading-relaxed">
              Impianti tecnologici civili e industriali con edilizia integrata. Un partner unico,
              dalla progettazione alla manutenzione, con sedi operative a Milano e Torino.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/contatti"
                className="group inline-flex items-center gap-2 rounded-full bg-electric text-electric-foreground px-7 py-4 text-base font-semibold transition-all hover:shadow-glow"
              >
                Richiedi informazioni
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/azienda"
                className="group inline-flex items-center gap-2 rounded-full glass-dark text-white px-7 py-4 text-base font-semibold transition-all hover:bg-white/10"
              >
                Scopri l'azienda
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Hero stats strip */}
          <div className="reveal reveal-delay-2 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden glass-dark">
            {[
              { v: "26+", l: "Anni di esperienza" },
              { v: "1.200+", l: "Progetti realizzati" },
              { v: "ISO 9001", l: "Certificazione qualità" },
              { v: "24/7", l: "Pronto intervento" },
            ].map((s) => (
              <div key={s.l} className="bg-transparent px-6 py-6">
                <div className="font-display text-2xl md:text-3xl font-bold">{s.v}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO SHOWCASE */}
      <VideoShowcase />

      {/* MARQUEE */}
      <div className="border-y border-border bg-secondary py-6 overflow-hidden">
        <div className="flex gap-16 animate-marquee whitespace-nowrap text-muted-foreground/70 font-display text-2xl md:text-3xl font-semibold">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0">
              {[
                "Engineering",
                "Impianti elettrici",
                "HVAC",
                "Antincendio",
                "Fotovoltaico",
                "Manutenzione 24/7",
                "Edilizia integrata",
                "BIM",
                "Efficientamento",
              ].map((w) => (
                <span key={w} className="flex items-center gap-16">
                  {w} <span className="h-2 w-2 rounded-full bg-electric" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* NUMBERS */}
      <section className="py-24 md:py-32 container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="I nostri numeri"
              title="Una struttura solida costruita giorno dopo giorno."
              description="Dal 1998 affianchiamo committenti pubblici, privati e industriali con un approccio integrato che unisce ingegneria, esecuzione e servizio."
            />
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-8">
            {[
              { v: 26, s: "+", l: "Anni di attività" },
              { v: 1200, s: "+", l: "Cantieri completati" },
              { v: 60, s: "", l: "Professionisti" },
              { v: 98, s: "%", l: "Clienti che tornano" },
            ].map((n) => (
              <div key={n.l} className="border-t-2 border-foreground pt-6">
                <StatNumber value={n.v} suffix={n.s} />
                <div className="mt-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {n.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="py-24 md:py-32 bg-secondary">
        <div className="container-px mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <SectionHeader
              eyebrow="Settori operativi"
              title="Quattro competenze, un unico interlocutore."
            />
            <Link
              to="/settori"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-electric transition-colors"
            >
              Tutti i settori <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sectors.map((s, idx) => (
              <Link
                key={s.slug}
                to="/settori/$slug"
                params={{ slug: s.slug }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_30px_-12px_rgba(15,23,42,0.12)] hover:shadow-[0_2px_6px_rgba(15,23,42,0.06),0_24px_50px_-18px_rgba(15,23,42,0.22)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-muted-foreground">0{idx + 1}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-electric">
                      Scopri <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground">{s.short}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH / WHY */}
      <section className="py-24 md:py-32 container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6">
            <div className="relative">
              <img
                src={teamImg}
                alt="Team Zicca Servizi"
                loading="lazy"
                className="rounded-2xl shadow-elegant aspect-[4/3] object-cover w-full"
              />
              <div className="absolute -bottom-8 -right-4 md:-right-8 glass rounded-2xl p-6 shadow-elegant max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-electric" />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold">Dal 1998</span>
                </div>
                <p className="text-sm font-medium leading-snug">
                  Un team multidisciplinare di oltre 60 specialisti, civili e industriali.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <SectionHeader
              eyebrow="Il nostro approccio"
              title="Engineering integrato, dalla prima riga di progetto al collaudo finale."
              description="Crediamo nel valore di un partner unico. Per questo gestiamo internamente progettazione, costruzione, impianti e manutenzione, garantendo coerenza tecnica, tempi certi e responsabilità chiara."
            />
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {[
                {
                  i: Cpu,
                  t: "Progettazione integrata",
                  d: "Studio tecnico interno, modellazione BIM e scelta delle tecnologie.",
                },
                {
                  i: HardHat,
                  t: "Esecuzione certificata",
                  d: "Squadre specializzate civili e industriali con direzione lavori.",
                },
                {
                  i: Wrench,
                  t: "Manutenzione continua",
                  d: "Conduzione e pronto intervento 24/7 con reportistica digitale.",
                },
                {
                  i: ShieldCheck,
                  t: "Qualità garantita",
                  d: "ISO 9001, SOA, ICIM e procedure interne sempre verificate.",
                },
              ].map(({ i: Icon, t, d }) => (
                <div key={t} className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background group-hover:bg-electric group-hover:text-electric-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="font-display font-bold text-lg">{t}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 md:py-32 bg-ink text-ink-foreground relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="relative container-px mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-8 bg-electric" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-electric">
                La nostra storia
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Un percorso costruito su <span className="text-gradient">fiducia e competenza</span>.
            </h2>
          </div>

          <div className="mt-20 grid md:grid-cols-4 gap-8 relative">
            <div className="absolute left-0 right-0 top-6 h-px bg-white/10 hidden md:block" />
            {[
              {
                y: "1998",
                t: "Fondazione",
                d: "Lucio Zicca avvia l'attività come ditta individuale nel settore civile.",
              },
              {
                y: "2006",
                t: "Espansione industriale",
                d: "Entra in azienda Agostino Zicca, perito industriale e Direttore tecnico.",
              },
              {
                y: "2011",
                t: "Nasce la S.r.l.",
                d: "Costituzione di Zicca Servizi S.r.l. con la struttura attuale.",
              },
              {
                y: "Oggi",
                t: "Engineering & impianti",
                d: "60+ professionisti, sedi a Milano e Torino, cantieri in tutta Italia.",
              },
            ].map((m) => (
              <div key={m.y} className="relative">
                <div className="h-3 w-3 rounded-full bg-electric mb-6 ring-4 ring-electric/20" />
                <div className="font-display text-3xl font-bold">{m.y}</div>
                <div className="font-semibold mt-2">{m.t}</div>
                <p className="text-sm text-white/70 mt-2 leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 container-px mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Dicono di noi"
          title="La fiducia dei nostri clienti è il nostro miglior progetto."
          align="center"
        />
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            {
              q: "Una azienda seria, molto professionale ed affidabile. Ho avuto più di una esperienza diretta ed in tutti i casi ho avuto conferma delle qualità indicate.",
              a: "Sergio Brega",
              s: "Cliente industriale",
            },
            {
              q: "Gente seria. Personale esperto e affidabile. Lavorano con grande attenzione ai dettagli e rispetto delle tempistiche.",
              a: "Riccardo Monica",
              s: "Committente privato",
            },
            {
              q: "Professionalità e cortesia. Un partner affidabile per la manutenzione dei nostri impianti, sempre presente quando serve.",
              a: "Angelo Ballabaio",
              s: "Property manager",
            },
          ].map((t) => (
            <div key={t.a} className="bg-card border border-border rounded-2xl p-8 hover-lift">
              <Sparkles className="h-6 w-6 text-electric mb-6" />
              <p className="text-lg leading-relaxed text-foreground">"{t.q}"</p>
              <div className="mt-8 pt-6 border-t border-border">
                <div className="font-semibold">{t.a}</div>
                <div className="text-sm text-muted-foreground">{t.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CERT BANNER */}
      <section className="py-20 bg-secondary">
        <div className="container-px mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Certificazioni"
                title="Standard riconosciuti, qualità garantita."
              />
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                "ISO 9001",
                "ISO 14001",
                "ISO 45001",
                "SOA OG11",
                "SOA OS28",
                "SOA OS30",
                "ICIM",
                "F-Gas",
              ].map((c) => (
                <div
                  key={c}
                  className="aspect-square flex flex-col items-center justify-center rounded-xl border border-border bg-card hover-lift"
                >
                  <CheckCircle2 className="h-6 w-6 text-electric mb-2" />
                  <span className="font-display font-bold text-sm">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <Link
              to="/certificazioni"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:text-electric transition-colors"
            >
              Vedi tutte le certificazioni <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img
          src={ctaBg}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/85" />
        <div className="relative container-px mx-auto max-w-7xl py-24 md:py-32 text-ink-foreground">
          <div className="max-w-3xl">
            <Building2 className="h-10 w-10 text-electric mb-6" />
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Hai un progetto impiantistico?
              <br />
              <span className="text-gradient">Parliamone.</span>
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-2xl">
              Che si tratti di un nuovo cantiere, di una ristrutturazione o di un contratto di
              manutenzione, il nostro team è pronto ad ascoltarti.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/contatti"
                className="inline-flex items-center gap-2 rounded-full bg-electric text-electric-foreground px-7 py-4 text-base font-semibold hover:shadow-glow transition-all"
              >
                Richiedi un sopralluogo <ArrowUpRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:0255230921"
                className="inline-flex items-center gap-2 rounded-full glass-dark text-white px-7 py-4 text-base font-semibold hover:bg-white/10 transition-all"
              >
                Chiama 02 55230921
              </a>
            </div>
          </div>
        </div>
      </section>
      <CustomSections page="home" />
    </>
  );
}
