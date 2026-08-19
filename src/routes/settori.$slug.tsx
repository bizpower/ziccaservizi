import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { sectors } from "@/data/sectors";
import sectorElectrical from "@/assets/sector-electrical.jpg";
import sectorEdile from "@/assets/sector-edile.jpg";
import sectorMaintenance from "@/assets/sector-maintenance.jpg";
import sectorDesign from "@/assets/sector-design.jpg";

const imgs = { electrical: sectorElectrical, edile: sectorEdile, maintenance: sectorMaintenance, design: sectorDesign } as const;

export const Route = createFileRoute("/settori/$slug")({
  loader: ({ params }) => {
    const sector = sectors.find((s) => s.slug === params.slug);
    if (!sector) throw notFound();
    return { sector };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.sector.title} — Zicca Servizi` },
          { name: "description", content: loaderData.sector.short },
          { property: "og:title", content: loaderData.sector.title },
          { property: "og:url", content: `/settori/${loaderData.sector.slug}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/settori/${loaderData.sector.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <div className="container-px mx-auto max-w-7xl pt-40 pb-20">
      <h1 className="font-display text-4xl font-bold">Settore non trovato</h1>
      <Link to="/settori" className="mt-6 inline-flex items-center gap-2 text-electric font-semibold">
        <ArrowLeft className="h-4 w-4" /> Torna ai settori
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-px mx-auto max-w-7xl pt-40 pb-20">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  component: SectorPage,
});

function SectorPage() {
  const { sector } = Route.useLoaderData();
  const img = imgs[sector.image as keyof typeof imgs];

  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-ink text-ink-foreground overflow-hidden">
        <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink" />
        <div className="relative container-px mx-auto max-w-7xl">
          <Link to="/settori" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-electric transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Tutti i settori
          </Link>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-electric mb-6">Settore operativo</div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] max-w-5xl">
            {sector.title}
          </h1>
        </div>
      </section>

      <section className="py-24 md:py-32 container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <p className="text-xl leading-relaxed text-foreground/90">{sector.description}</p>

            <h2 className="mt-16 font-display text-3xl font-bold">Cosa facciamo</h2>
            <ul className="mt-8 space-y-4">
              {sector.items.map((it: string) => (
                <li key={it} className="flex items-start gap-4 p-5 rounded-xl bg-secondary border border-border">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric text-electric-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:col-span-5 space-y-6">
            <img src={img} alt={sector.title} loading="lazy" className="rounded-2xl shadow-elegant aspect-[4/5] object-cover w-full" />
            <div className="rounded-2xl bg-ink text-ink-foreground p-8">
              <div className="text-xs uppercase tracking-[0.22em] text-electric mb-3">Hai un progetto?</div>
              <h3 className="font-display text-2xl font-bold leading-snug">Parla con un nostro tecnico in 24h.</h3>
              <Link to="/contatti" className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric text-electric-foreground px-6 py-3 font-semibold">
                Richiedi sopralluogo <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
