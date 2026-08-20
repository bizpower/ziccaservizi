import { useRef, useState, useEffect } from "react";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/site/SectionHeader";

import capoVid from "@/assets/videos/capo-ti-segue-web.mp4.asset.json";
import capoPoster from "@/assets/videos/capo-ti-segue-poster.jpg.asset.json";
import caGrandaVid from "@/assets/videos/ca-granda-spiegazione-web.mp4.asset.json";
import caGrandaPoster from "@/assets/videos/ca-granda-spiegazione-poster.jpg.asset.json";
import qualcheVid from "@/assets/videos/qualche-modo-web.mp4.asset.json";
import qualchePoster from "@/assets/videos/qualche-modo-poster.jpg.asset.json";
import sgarroVid from "@/assets/videos/sgarro-web.mp4.asset.json";
import sgarroPoster from "@/assets/videos/sgarro-poster.jpg.asset.json";
import revampingVid from "@/assets/videos/revamping-web.mp4.asset.json";
import revampingPoster from "@/assets/videos/revamping-poster.jpg.asset.json";

type Item = {
  title: string;
  description: string;
  video: string;
  poster: string;
};

const allItems: Item[] = [
  {
    title: "Capo ti segue",
    description: "Il nostro modo di stare in cantiere: il capo guida, la squadra segue.",
    video: capoVid.url,
    poster: capoPoster.url,
  },
  {
    title: "Ca' Granda: la spiegazione",
    description: "Un intervento tecnico raccontato passo passo dal team Zicca Servizi.",
    video: caGrandaVid.url,
    poster: caGrandaPoster.url,
  },
  {
    title: "Qualche modo",
    description: "Soluzioni impiantistiche pensate per risolvere, non per rimandare.",
    video: qualcheVid.url,
    poster: qualchePoster.url,
  },
  {
    title: "Sgarro",
    description: "Attenzione al dettaglio: perché anche il piccolo sgarro fa la differenza.",
    video: sgarroVid.url,
    poster: sgarroPoster.url,
  },
  {
    title: "Revamping",
    description: "Rinnoviamo impianti esistenti restituendo efficienza e sicurezza.",
    video: revampingVid.url,
    poster: revampingPoster.url,
  },
];

// I video sono ospitati esternamente (vedi src/assets/**/*.asset.json):
// finché l'URL non è compilato la card non viene mostrata.
const items = allItems.filter((it) => Boolean(it.video));

export function VideoShowcase() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);

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
      if (v && i !== idx) {
        v.pause();
      }
    });
    el.play();
    setPlaying(idx);
  };

  const today = new Date().toISOString().split("T")[0];
  const jsonLd = items.map((it) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: it.title,
    description: it.description,
    thumbnailUrl: [it.poster],
    contentUrl: it.video,
    uploadDate: today,
  }));

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="video-showcase-heading"
      className="py-24 md:py-32 bg-secondary"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="I nostri video"
          title="Zicca Servizi in azione: i nostri lavori in video"
          description="Uno sguardo diretto ai cantieri, alle persone e alle soluzioni impiantistiche che portiamo ogni giorno sul campo."
          align="center"
        />

        <h2 id="video-showcase-heading" className="sr-only">
          Zicca Servizi in azione: i nostri lavori in video
        </h2>

        <div className="mt-14 -mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid gap-5 md:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 scrollbar-thin">
          {items.map((it, idx) => {
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
                    aria-label={`Video: ${it.title}. ${it.description}`}
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
                        style={{ background: "linear-gradient(135deg, #2AA4CB, #69B562)" }}
                      >
                        <Play className="h-7 w-7 md:h-8 md:w-8 ml-1" fill="currentColor" />
                      </span>
                    </button>
                  )}
                </div>
                <h3 className="mt-4 font-display font-bold text-lg text-foreground leading-snug">
                  <span
                    className="inline-block h-1 w-6 mr-2 align-middle rounded-full"
                    style={{ background: "linear-gradient(90deg, #69B562, #2AA4CB)" }}
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
  );
}
