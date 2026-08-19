import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomSections } from "@/components/site/CustomSections";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { sectors } from "@/data/sectors";
import sectorElectrical from "@/assets/sector-electrical.jpg";
import sectorEdile from "@/assets/sector-edile.jpg";
import sectorMaintenance from "@/assets/sector-maintenance.jpg";
import sectorDesign from "@/assets/sector-design.jpg";

const imgs = { electrical: sectorElectrical, edile: sectorEdile, maintenance: sectorMaintenance, design: sectorDesign } as const;

export const Route = createFileRoute("/settori/")({
  head: () => ({
    meta: [
      { title: "Settori operativi — Zicca Servizi" },
      { name: "description", content: "Impianti tecnologici, edilizia, manutenzione e progettazione: i quattro settori operativi di Zicca Servizi." },
      { property: "og:title", content: "Settori operativi — Zicca Servizi" },
      { property: "og:url", content: "/settori" },
    ],
    links: [{ rel: "canonical", href: "/settori" }],
  }),
  component: SettoriPage,
});

function SettoriPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 container-px mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-electric mb-6">Settori operativi</div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Quattro competenze.<br /><span className="text-gradient">Un solo partner.</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Affianchiamo committenti privati, pubblici e industriali con un'offerta tecnica integrata e verticale.
          </p>
        </div>
      </section>

      <section className="pb-24 md:pb-32 container-px mx-auto max-w-7xl space-y-6">
        {sectors.map((s, i) => (
          <Link
            key={s.slug}
            to="/settori/$slug"
            params={{ slug: s.slug }}
            className="group block rounded-3xl overflow-hidden border border-border bg-card hover-lift"
          >
            <div className={`grid md:grid-cols-2 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                <img src={imgs[s.image as keyof typeof imgs]} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <div className="text-xs font-mono text-muted-foreground mb-4">0{i + 1} / Settore</div>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{s.title}</h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{s.short}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-electric font-semibold">
                  Approfondisci <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
      <CustomSections page="settori" />
    </>
  );
}
