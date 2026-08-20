import { sectors as staticSectors } from "@/data/sectors";
import sectorElectrical from "@/assets/sector-electrical.jpg";
import sectorEdile from "@/assets/sector-edile.jpg";
import sectorMaintenance from "@/assets/sector-maintenance.jpg";
import sectorDesign from "@/assets/sector-design.jpg";

/**
 * I settori possono arrivare da due sorgenti:
 * - le righe della tabella `sectors`, gestite dal pannello admin;
 * - l'elenco statico in `src/data/sectors.ts`, usato come fallback quando il
 *   database è vuoto o non raggiungibile, così il sito non resta mai spoglio.
 * Entrambe vengono normalizzate in `SectorView`.
 */
export type SectorView = {
  slug: string;
  title: string;
  short: string;
  description: string;
  items: string[];
  image: string;
};

const imagesByKey: Record<string, string> = {
  electrical: sectorElectrical,
  edile: sectorEdile,
  maintenance: sectorMaintenance,
  design: sectorDesign,
};

type StaticSector = (typeof staticSectors)[number];

export function sectorFromStatic(s: StaticSector): SectorView {
  return {
    slug: s.slug,
    title: s.title,
    short: s.short,
    description: s.description,
    items: [...s.items],
    image: imagesByKey[s.image] ?? sectorElectrical,
  };
}

export const fallbackSectors: SectorView[] = staticSectors.map(sectorFromStatic);

const imagesBySlug: Record<string, string> = Object.fromEntries(
  fallbackSectors.map((s) => [s.slug, s.image]),
);

/** Riga della tabella `sectors` (le colonne non usate qui sono ignorate). */
type SectorRow = {
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  bullets: unknown;
};

export function sectorFromRow(row: SectorRow): SectorView {
  return {
    slug: row.slug,
    title: row.title,
    short: row.tagline ?? "",
    description: row.description ?? "",
    items: Array.isArray(row.bullets) ? row.bullets.map(String) : [],
    image: row.image_url || imagesBySlug[row.slug] || sectorElectrical,
  };
}

/** Righe dal database se ce ne sono, altrimenti l'elenco statico. */
export function toSectorViews(rows: unknown): SectorView[] {
  if (Array.isArray(rows) && rows.length > 0) {
    return (rows as SectorRow[]).map(sectorFromRow);
  }
  return fallbackSectors;
}
