import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Play } from "lucide-react";
import { getSiteSettings } from "@/lib/content.functions";
import { resolveVideos, type VideoItem } from "@/lib/video-content";

import tataVid from "@/assets/milano-united/tata-parla.mp4.asset.json";
import tataPoster from "@/assets/milano-united/tata-parla-poster.jpg.asset.json";
import challVid from "@/assets/milano-united/challenge-2.mp4.asset.json";
import challPoster from "@/assets/milano-united/challenge-2-poster.jpg.asset.json";
import veroVid from "@/assets/milano-united/vero-calcio.mp4.asset.json";
import veroPoster from "@/assets/milano-united/vero-calcio-poster.jpg.asset.json";
import { absoluteUrl } from "@/lib/site-url";

const manifestVideos: VideoItem[] = [
  {
    title: "Tata parla",
    description: "Milano United: parole a bordo campo dal nostro Tata.",
    video: tataVid.url,
    poster: tataPoster.url,
  },
  {
    title: "Challenge #2",
    description: "La seconda challenge della squadra Milano United.",
    video: challVid.url,
    poster: challPoster.url,
  },
  {
    title: "Qual è il vero calcio",
    description: "Milano United racconta cosa significa per noi il calcio a 11.",
    video: veroVid.url,
    poster: veroPoster.url,
  },
];

type Player = { n: number; name: string; role: "POR" | "DIF" | "CEN" | "ATT" };

const starters: Record<"POR" | "DIF" | "CEN" | "ATT", Player[]> = {
  POR: [{ n: 1, name: "Sherif Abdelrahman Mohamed", role: "POR" }],
  DIF: [
    { n: 2, name: "Giuseppe Greco", role: "DIF" },
    { n: 3, name: "Stefano Marasco", role: "DIF" },
    { n: 4, name: "Antonio Leo", role: "DIF" },
    { n: 5, name: "Lorenzo Macrì", role: "DIF" },
  ],
  CEN: [
    { n: 7, name: "Lorenzo Paganini", role: "CEN" },
    { n: 8, name: "Mario Petroselli", role: "CEN" },
    { n: 10, name: "Agostino Zicca", role: "CEN" },
    { n: 22, name: "Simone Musicò", role: "CEN" },
  ],
  ATT: [
    { n: 9, name: "Antonio Passanti", role: "ATT" },
    { n: 11, name: "Alessandro D'Amore", role: "ATT" },
  ],
};

const bench: Player[] = [
  { n: 12, name: "Manuel Nardoni", role: "POR" },
  { n: 23, name: "Mattia Di Sannio", role: "DIF" },
  { n: 14, name: "Simone Catta", role: "DIF" },
  { n: 31, name: "Andrea Acierno", role: "DIF" },
  { n: 15, name: "Edoardo Savi", role: "DIF" },
  { n: 6, name: "Mattia Mele", role: "DIF" },
  { n: 16, name: "Brayan Vladimir Polanco Mancia", role: "DIF" },
  { n: 30, name: "Matteo Sinatra", role: "DIF" },
  { n: 26, name: "Mouhamed Fadel Seye", role: "CEN" },
  { n: 24, name: "Pietro Gagliardi", role: "CEN" },
  { n: 18, name: "Gianlucio Appella", role: "CEN" },
  { n: 21, name: "Armando Mellace", role: "CEN" },
  { n: 13, name: "Marco Cottarelli", role: "CEN" },
  { n: 19, name: "Khurram Shahzad Mughal", role: "ATT" },
  { n: 20, name: "Federico Foscarin", role: "ATT" },
];

const staff = [
  { name: "Lucio Zicca", role: "Allenatore" },
  { name: "Martino Petroselli", role: "Allenatore" },
];

const roleLabel: Record<Player["role"], string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export const Route = createFileRoute("/milano-united")({
  head: () => {
    const teamLd = {
      "@context": "https://schema.org",
      "@type": "SportsTeam",
      name: "Milano United",
      sport: "Soccer",
      memberOf: { "@type": "SportsOrganization", name: "Campionato Calcio a 11 Sportland Milano" },
      coach: [
        { "@type": "Person", name: "Lucio Zicca" },
        { "@type": "Person", name: "Martino Petroselli" },
      ],
      parentOrganization: { "@type": "Organization", name: "Zicca Servizi S.r.l." },
    };
    const crumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "Milano United", item: "/milano-united" },
      ],
    };
    const videoLd = manifestVideos
      .filter((v) => Boolean(v.video))
      .map((v) => ({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v.title,
        description: v.description,
        thumbnailUrl: [v.poster],
        contentUrl: v.video,
        uploadDate: new Date().toISOString().split("T")[0],
      }));
    return {
      meta: [
        { title: "Milano United | Squadra Calcio a 11 Zicca Servizi Milano" },
        {
          name: "description",
          content:
            "Scopri Milano United, la squadra di calcio a 11 di Zicca Servizi: rosa, formazione e video highlights del campionato Sportland Serie B1 a Milano.",
        },
        {
          property: "og:title",
          content: "Milano United — La squadra di calcio a 11 di Zicca Servizi",
        },
        {
          property: "og:description",
          content:
            "Rosa, formazione e video highlights di Milano United, Campionato Sportland Serie B1 Milano.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: absoluteUrl("/milano-united") },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/milano-united") }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(teamLd) },
        { type: "application/ld+json", children: JSON.stringify(crumbs) },
        // I dati strutturati dei video hanno senso solo se i file sono online.
        ...(videoLd.length > 0
          ? [{ type: "application/ld+json", children: JSON.stringify(videoLd) }]
          : []),
      ],
    };
  },
  component: MilanoUnitedPage,
});

function PlayerCard({ p, size = "md" }: { p: Player; size?: "sm" | "md" }) {
  const isSm = size === "sm";
  return (
    <div
      className={`group flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-0.5 ${isSm ? "" : "hover:scale-[1.03]"}`}
    >
      <div className="relative">
        <div
          className={`grid place-items-center rounded-full text-white font-bold shadow-lg ring-2 ring-white/90 ${isSm ? "h-12 w-12 text-base" : "h-16 w-16 md:h-20 md:w-20 text-xl md:text-2xl"}`}
          style={{ background: "var(--mu-primary)" }}
          aria-hidden="true"
        >
          {initials(p.name)}
        </div>
        <div
          className={`absolute -bottom-1 -right-1 grid place-items-center rounded-full font-bold text-white ring-2 ring-white ${isSm ? "h-6 w-6 text-[11px]" : "h-8 w-8 text-xs md:text-sm"}`}
          style={{ background: "var(--mu-secondary)" }}
          aria-label={`Numero ${p.n}`}
        >
          {p.n}
        </div>
      </div>
      <div
        className={`mt-2 leading-tight ${isSm ? "text-[11px]" : "text-xs md:text-sm"} font-semibold text-white drop-shadow`}
      >
        {p.name}
      </div>
      <div
        className={`${isSm ? "text-[10px]" : "text-[11px]"} uppercase tracking-wider text-white/70`}
      >
        {roleLabel[p.role]}
      </div>
    </div>
  );
}

function FormationRow({ players }: { players: Player[] }) {
  return (
    <div className="flex justify-around items-start gap-2 md:gap-4 px-2">
      {players.map((p) => (
        <PlayerCard key={p.n} p={p} />
      ))}
    </div>
  );
}

function MilanoUnitedPage() {
  const fetchSettings = useServerFn(getSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchSettings(),
  });
  const videos = useMemo(
    () => resolveVideos(settings?.videos_milano_united, manifestVideos),
    [settings],
  );

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "200px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const handlePlay = (idx: number) => {
    const el = videoRefs.current[idx];
    if (!el) return;
    videoRefs.current.forEach((v, i) => {
      if (v && i !== idx) v.pause();
    });
    el.play();
    setPlaying(idx);
  };

  return (
    <div data-theme="milano-united">
      {/* HERO */}
      <section
        className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--mu-primary) 0%, var(--mu-primary-dark) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20 grid-lines pointer-events-none" />
        <div className="container-px mx-auto max-w-5xl relative text-center text-white">
          <img
            src="/milano-united/logo.png"
            alt="Logo Milano United, squadra di calcio a 11 di Zicca Servizi"
            width={220}
            height={220}
            className="mx-auto h-40 w-40 md:h-56 md:w-56 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          />
          <h1 className="mt-8 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Milano United — La squadra di calcio a 11 di Zicca Servizi
          </h1>
          <p className="mt-6 text-base md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-balance">
            Milano United è la squadra di calcio a 11 targata Zicca Servizi, iscritta al Campionato
            Calcio a 11 Sportland Milano (Serie B1). Passione, sport e spirito di squadra: gli
            stessi valori che mettiamo ogni giorno nel nostro lavoro.
          </p>
        </div>
      </section>

      {/* VIDEO */}
      <section ref={sectionRef} aria-labelledby="mu-videos" className="py-20 md:py-28 bg-secondary">
        <div className="container-px mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-8" style={{ background: "var(--mu-primary)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--mu-primary)" }}
              >
                Video
              </span>
            </div>
            <h2
              id="mu-videos"
              className="font-display text-3xl md:text-5xl font-bold tracking-tight text-balance"
            >
              I nostri highlights
            </h2>
            <p className="mt-4 text-muted-foreground text-balance">
              I momenti più belli di Milano United, dentro e fuori dal campo.
            </p>
          </div>

          <div className="mt-12 -mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid gap-5 md:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none sm:grid-cols-2 md:grid-cols-3">
            {videos.map((it, idx) => {
              const isPlaying = playing === idx;
              return (
                <div
                  key={it.title}
                  className="group snap-center shrink-0 w-[78%] sm:w-auto flex flex-col"
                >
                  <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-ink shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] hover:shadow-[0_24px_50px_-18px_rgba(42,164,203,0.4)] hover:-translate-y-1 transition-all duration-300 ring-1 ring-border/60">
                    <video
                      ref={(el) => {
                        videoRefs.current[idx] = el;
                      }}
                      src={visible ? it.video : undefined}
                      poster={it.poster}
                      preload="none"
                      playsInline
                      controls={isPlaying}
                      onPlay={() => setPlaying(idx)}
                      onPause={() => setPlaying((p) => (p === idx ? null : p))}
                      title={it.title}
                      aria-label={`Video Milano United: ${it.title}. ${it.description}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {!isPlaying && (
                      <button
                        type="button"
                        onClick={() => handlePlay(idx)}
                        aria-label={`Riproduci il video "${it.title}"`}
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-ink/60 via-ink/10 to-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                      >
                        <span
                          className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full text-white shadow-glow transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--mu-primary), var(--mu-primary-dark))",
                          }}
                        >
                          <Play className="h-7 w-7 md:h-8 md:w-8 ml-1" fill="currentColor" />
                        </span>
                      </button>
                    )}
                  </div>
                  <h3 className="mt-4 font-display font-bold text-lg text-foreground leading-snug">
                    <span
                      className="inline-block h-1 w-6 mr-2 align-middle rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--mu-primary), var(--mu-primary-dark))",
                      }}
                      aria-hidden="true"
                    />
                    {it.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORMAZIONE */}
      <section aria-labelledby="mu-rosa" className="py-20 md:py-28 bg-background">
        <div className="container-px mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-8" style={{ background: "var(--mu-primary)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--mu-primary)" }}
              >
                La rosa
              </span>
            </div>
            <h2
              id="mu-rosa"
              className="font-display text-3xl md:text-5xl font-bold tracking-tight text-balance"
            >
              Formazione titolare — Modulo 4-4-2
            </h2>
          </div>

          {/* Campo */}
          <div className="mt-12 mx-auto max-w-2xl">
            <div
              className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-elegant ring-1 ring-black/10"
              style={{
                background:
                  "linear-gradient(180deg, var(--mu-field-top) 0%, var(--mu-field-bottom) 100%)",
              }}
              aria-label="Campo da calcio con formazione 4-4-2 di Milano United"
            >
              {/* Field lines */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 300 400"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="8"
                  y="8"
                  width="284"
                  height="384"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                <line
                  x1="8"
                  y1="200"
                  x2="292"
                  y2="200"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                <circle
                  cx="150"
                  cy="200"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                <circle cx="150" cy="200" r="2.5" fill="rgba(255,255,255,0.8)" />
                {/* Aree */}
                <rect
                  x="70"
                  y="8"
                  width="160"
                  height="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                <rect
                  x="105"
                  y="8"
                  width="90"
                  height="22"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                <rect
                  x="70"
                  y="340"
                  width="160"
                  height="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
                <rect
                  x="105"
                  y="370"
                  width="90"
                  height="22"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                />
              </svg>

              {/* Players layout */}
              <div className="absolute inset-0 flex flex-col justify-between py-6 md:py-10">
                <div className="pt-2">
                  <FormationRow players={starters.ATT} />
                </div>
                <FormationRow players={starters.CEN} />
                <FormationRow players={starters.DIF} />
                <div className="pb-2">
                  <FormationRow players={starters.POR} />
                </div>
              </div>
            </div>
          </div>

          {/* Bench */}
          <div className="mt-16 max-w-5xl mx-auto">
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-center">
              Il resto della rosa
            </h3>
            <div
              className="mt-8 grid gap-6 rounded-3xl p-6 md:p-8"
              style={{
                background:
                  "linear-gradient(135deg, var(--mu-field-top) 0%, var(--mu-field-bottom) 100%)",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              }}
            >
              {bench.map((p) => (
                <PlayerCard key={p.n} p={p} size="sm" />
              ))}
            </div>
          </div>

          {/* Staff */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-center">
              Staff tecnico
            </h3>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {staff.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm hover:shadow-elegant transition-shadow"
                  style={{ borderColor: "color-mix(in oklab, var(--mu-primary) 25%, transparent)" }}
                >
                  <div
                    className="grid place-items-center h-14 w-14 rounded-full text-white font-bold text-lg shrink-0"
                    style={{ background: "var(--mu-primary)" }}
                    aria-hidden="true"
                  >
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-lg leading-tight truncate">
                      {s.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
