import { createFileRoute } from "@tanstack/react-router";
import { CustomSections } from "@/components/site/CustomSections";
import { useState } from "react";
import { X } from "lucide-react";

export const Route = createFileRoute("/referenze")({
  head: () => ({
    meta: [
      { title: "Referenze e cantieri — Zicca Servizi" },
      { name: "description", content: "Una selezione dei cantieri e delle referenze di Zicca Servizi: impianti civili, industriali e ristrutturazioni." },
      { property: "og:title", content: "Referenze — Zicca Servizi" },
      { property: "og:url", content: "/referenze" },
    ],
    links: [{ rel: "canonical", href: "/referenze" }],
  }),
  component: ReferenzePage,
});

const refs = [
  { src: "https://www.ziccaservizi.it/wp-content/uploads/2021/05/163025516_102399431943964_2538584837276504745_n.jpg", cat: "Industriale", title: "Cantiere industriale" },
  { src: "https://www.ziccaservizi.it/wp-content/uploads/2021/01/30.jpg", cat: "Civile", title: "Impianto civile" },
  { src: "https://www.ziccaservizi.it/wp-content/uploads/2021/01/5-3.jpg", cat: "Industriale", title: "Quadri elettrici" },
  { src: "https://www.ziccaservizi.it/wp-content/uploads/2021/05/JBBG8378.jpg", cat: "Industriale", title: "Impianto produttivo" },
  { src: "https://www.ziccaservizi.it/wp-content/uploads/2021/01/31.jpg", cat: "Civile", title: "Edificio residenziale" },
  { src: "https://www.ziccaservizi.it/wp-content/uploads/2020/07/4-GENOVA-CT.jpg", cat: "Industriale", title: "Cabina trasformazione · Genova" },
];

const cats = ["Tutti", "Industriale", "Civile"];

function ReferenzePage() {
  const [filter, setFilter] = useState("Tutti");
  const [open, setOpen] = useState<number | null>(null);
  const visible = refs.filter((r) => filter === "Tutti" || r.cat === filter);

  return (
    <>
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 container-px mx-auto max-w-7xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-electric mb-6">Referenze</div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] max-w-5xl">
          I cantieri raccontano <span className="text-gradient">il nostro lavoro.</span>
        </h1>
        <p className="mt-8 text-xl text-muted-foreground max-w-2xl">
          Una selezione di interventi realizzati negli ultimi anni nei settori civile e industriale.
        </p>
      </section>

      <section className="container-px mx-auto max-w-7xl pb-8">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                filter === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl pb-24 md:pb-32">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          {visible.map((r, i) => (
            <button
              key={r.src}
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-2xl break-inside-avoid"
            >
              <img src={r.src} alt={r.title} loading="lazy" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/60 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                <div className="text-xs uppercase tracking-[0.18em] text-electric">{r.cat}</div>
                <div className="font-display font-bold text-lg mt-1">{r.title}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <button className="absolute top-6 right-6 text-white p-2" onClick={() => setOpen(null)} aria-label="Chiudi">
            <X className="h-7 w-7" />
          </button>
          <img src={visible[open].src} alt={visible[open].title} className="max-h-[90vh] max-w-full rounded-xl shadow-elegant" />
        </div>
      )}
      <CustomSections page="referenze" />
    </>
  );
}
