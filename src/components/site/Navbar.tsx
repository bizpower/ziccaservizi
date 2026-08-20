import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, Shield } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/azienda", label: "Azienda" },
  { to: "/settori", label: "Settori" },
  { to: "/referenze", label: "Referenze" },
  { to: "/certificazioni", label: "Certificazioni" },
  { to: "/milano-united", label: "Milano United" },
  { to: "/contatti", label: "Contatti" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Solo la home ha un hero scuro full-bleed sotto la navbar trasparente.
  // Su tutte le altre rotte la navbar deve essere subito solida per leggibilità.
  const hasDarkHero = path === "/";
  const solid = scrolled || open || !hasDarkHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        solid ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Zicca Servizi — Home">
          <img
            src="/logo-zicca.png"
            alt="Zicca Servizi"
            width={160}
            height={48}
            className="h-9 md:h-10 w-auto"
          />
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5">
          {links.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium leading-none transition-colors ${
                  solid
                    ? "text-foreground/80 hover:text-foreground"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-electric" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <Link
            to="/login"
            className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium uppercase tracking-wider transition-colors ${
              solid
                ? "text-muted-foreground hover:text-foreground"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Area riservata
          </Link>
          <Link
            to="/contatti"
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-electric text-electric-foreground px-5 py-2.5 text-sm font-semibold transition-all hover:shadow-glow"
          >
            Richiedi preventivo
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className={`xl:hidden p-2 rounded-md ${solid ? "text-foreground" : "text-white"}`}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-background">
          <div className="container-px mx-auto max-w-7xl py-6 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="py-3 min-h-[44px] whitespace-nowrap text-base font-medium text-foreground border-b border-border/60"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contatti"
              className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-electric text-electric-foreground px-5 py-3 text-sm font-semibold"
            >
              Richiedi preventivo <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="mt-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield className="h-4 w-4" />
              Area riservata
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
