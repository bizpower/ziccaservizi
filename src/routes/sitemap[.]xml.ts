import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { sectors as staticSectors } from "@/data/sectors";
import { getPublishedSectors } from "@/lib/content.functions";
import { absoluteUrl } from "@/lib/site-url";

/**
 * I `<loc>` di una sitemap devono essere URL assoluti: con percorsi relativi il
 * file viene rifiutato dai motori di ricerca. L'indirizzo del sito arriva da
 * `@/lib/site-url`, configurabile con `SITE_URL` / `VITE_SITE_URL`.
 */
const STATIC_PATHS = [
  "/",
  "/azienda",
  "/settori",
  "/referenze",
  "/certificazioni",
  "/milano-united",
  "/contatti",
];

/** Slug dei settori dal database; se non risponde, l'elenco statico. */
async function sectorPaths(): Promise<string[]> {
  try {
    const rows = await getPublishedSectors();
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map((s: { slug: string }) => `/settori/${s.slug}`);
    }
  } catch {
    // database non raggiungibile: si continua con l'elenco nel codice
  }
  return staticSectors.map((s) => `/settori/${s.slug}`);
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [...STATIC_PATHS, ...(await sectorPaths())];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map(
            (p) =>
              `  <url><loc>${absoluteUrl(p)}</loc><changefreq>weekly</changefreq></url>`,
          ),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
