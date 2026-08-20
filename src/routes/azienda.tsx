import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomSections } from "@/components/site/CustomSections";
import { ArrowUpRight, Target, Eye, Heart } from "lucide-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import teamImg from "@/assets/team.jpg";
import heroImg from "@/assets/hero-industrial.jpg";

export const Route = createFileRoute("/azienda")({
  head: () => ({
    meta: [
      { title: "Azienda — Zicca Servizi · Storia, mission e team" },
      {
        name: "description",
        content:
          "Storia, mission, vision e team di Zicca Servizi: dal 1998 un partner italiano per impianti tecnologici e edilizia integrata.",
      },
      { property: "og:title", content: "Azienda — Zicca Servizi" },
      { property: "og:url", content: "/azienda" },
    ],
    links: [{ rel: "canonical", href: "/azienda" }],
  }),
  component: AziendaPage,
});

function AziendaPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink" />
        <div className="relative container-px mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-electric mb-6">
              L'Azienda
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
              Costruiamo impianti.
              <br />
              <span className="text-gradient">Coltiviamo fiducia.</span>
            </h1>
            <p className="mt-8 text-xl text-white/80 max-w-2xl leading-relaxed">
              Da oltre 25 anni siamo il punto di riferimento per chi cerca un partner affidabile per
              impianti tecnologici e opere civili integrate.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <SectionHeader
              eyebrow="Chi siamo"
              title="Una storia di persone, prima ancora che di impianti."
            />
          </div>
          <div className="lg:col-span-7 space-y-6 text-lg leading-relaxed text-foreground/90">
            <p>
              L'azienda è stata fondata, come ditta individuale, nel <strong>1998</strong>{" "}
              dall'Amministratore <strong>Lucio Zicca</strong>.
            </p>
            <p>
              Dopo anni di esperienza nel settore civile, con un lavoro svolto in modo eccellente,
              nel <strong>2006</strong> entra a far parte dell'organico il perito industriale{" "}
              <strong>Agostino Zicca</strong>, attualmente Amministratore e Direttore tecnico.
            </p>
            <p>
              L'esperienza acquisita negli anni, le buone intuizioni, la professionalità delle sue
              risorse e l'eccellenza del lavoro svolto hanno portato, nel{" "}
              <strong>Gennaio del 2011</strong>, alla nascita della Società{" "}
              <strong>Zicca Servizi S.r.l.</strong> dai soci Lucio Zicca, Agostino Zicca e Rosanna
              Occhiuzzi.
            </p>
            <p>
              Oggi siamo una struttura di oltre 60 professionisti, con sedi a Milano e Torino,
              cantieri attivi in tutta Italia e una capacità tecnica trasversale che copre l'intero
              ciclo di vita degli impianti.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-secondary">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Mission, Vision, Valori"
            title="I principi che guidano ogni progetto."
            align="center"
          />
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                i: Target,
                t: "Mission",
                d: "Offrire ai nostri clienti soluzioni impiantistiche complete, sicure e durature, gestite da un unico partner di fiducia.",
              },
              {
                i: Eye,
                t: "Vision",
                d: "Diventare il riferimento italiano per l'engineering impiantistico integrato, unendo tradizione tecnica e innovazione.",
              },
              {
                i: Heart,
                t: "Valori",
                d: "Affidabilità, competenza, trasparenza e cura del dettaglio. Persone prima dei contratti.",
              },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="bg-card rounded-2xl p-10 border border-border hover-lift">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-electric text-electric-foreground mb-6">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-2xl font-bold mb-3">{t}</h3>
                <p className="text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 container-px mx-auto max-w-7xl">
        <SectionHeader eyebrow="La timeline" title="26 anni in cinque tappe." />
        <div className="mt-16 grid md:grid-cols-5 gap-8 relative">
          {[
            { y: "1998", t: "Fondazione" },
            { y: "2006", t: "Settore industriale" },
            { y: "2011", t: "Nasce la S.r.l." },
            { y: "2018", t: "Filiale di Torino" },
            { y: "2024", t: "Engineering integrato" },
          ].map((m, i) => (
            <div
              key={m.y}
              className="relative pl-6 md:pl-0 md:pt-6 border-l-2 md:border-l-0 md:border-t-2 border-foreground/10"
            >
              <div className="absolute -left-1.5 md:-top-1.5 md:left-0 h-3 w-3 rounded-full bg-electric" />
              <div className="font-display text-4xl font-bold">{m.y}</div>
              <div className="mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                0{i + 1} · {m.t}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32 bg-secondary">
        <div className="container-px mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <img
                src={teamImg}
                alt="Team Zicca Servizi"
                loading="lazy"
                className="rounded-2xl shadow-elegant w-full aspect-[16/10] object-cover"
              />
            </div>
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Il nostro team"
                title="60+ professionisti, una cultura tecnica condivisa."
                description="Il nostro esperto team, sia civile che industriale, è a vostra completa disposizione, dalla progettazione condivisa iniziale al completamento dei lavori."
              />
              <Link
                to="/contatti"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-base font-semibold hover:bg-electric transition-all"
              >
                Lavora con noi <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CustomSections page="azienda" />
    </>
  );
}
