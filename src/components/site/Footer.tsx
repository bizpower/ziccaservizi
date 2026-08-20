import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-40" />
      <div className="relative container-px mx-auto max-w-7xl pt-20 pb-10">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <div className="mb-6">
              <img
                src="/logo-zicca.png"
                alt="Zicca Servizi"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-white/70 text-base leading-relaxed max-w-md mb-8">
              Dal 1998 progettiamo, installiamo e gestiamo impianti tecnologici civili e
              industriali, con edilizia integrata. Affidabilità, competenza e visione ingegneristica
              al servizio del tuo progetto.
            </p>
            <Link
              to="/contatti"
              className="inline-flex items-center gap-2 text-electric font-semibold group"
            >
              Iniziamo a parlarne
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Naviga</div>
            <ul className="space-y-3 text-sm">
              {[
                ["/azienda", "Azienda"],
                ["/settori", "Settori"],
                ["/referenze", "Referenze"],
                ["/certificazioni", "Certificazioni"],
                ["/milano-united", "Milano United"],
                ["/contatti", "Contatti"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/80 hover:text-electric transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                Sede di Milano
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-electric shrink-0" />
                  <span>Via Civesio, 3 — 20097 San Donato Milanese (MI)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-electric" />
                  <span>02 55230921</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-electric" />
                  <span>info@ziccaservizi.it</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                Filiale di Torino
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-electric shrink-0" />
                  <span>Via Genova, 23 — 10126 Torino</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-electric" />
                  <span>02 36571620</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-electric" />
                  <span>torino@ziccaservizi.it</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>© {new Date().getFullYear()} Zicca Servizi S.r.l. — Tutti i diritti riservati.</div>
          <div className="flex items-center gap-6">
            <span>P.IVA 07396810960</span>
            <span>Privacy</span>
            <span>Cookie</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
