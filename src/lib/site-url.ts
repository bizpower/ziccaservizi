/**
 * Indirizzo pubblico del sito.
 *
 * Serve a produrre URL assoluti dove il protocollo li richiede e gli indirizzi
 * relativi non sono validi: `<loc>` della sitemap, `og:url`, `og:image`, il
 * link canonico e i dati strutturati schema.org. Con indirizzi relativi la
 * sitemap viene rifiutata dai motori di ricerca e le anteprime dei link
 * (WhatsApp, LinkedIn, Facebook) non si risolvono.
 *
 * Il default è il dominio di destinazione. Si può puntare altrove — per esempio
 * all'indirizzo `*.vercel.app` prima dello switch del dominio, o a un ambiente
 * di staging — impostando `VITE_SITE_URL` (build) o `SITE_URL` (runtime).
 */
const DEFAULT_SITE_URL = "https://www.ziccaservizi.it";

function readSiteUrl(): string {
  const fromVite = (import.meta.env as Record<string, string | undefined>).VITE_SITE_URL;
  if (fromVite) return fromVite;
  if (typeof process !== "undefined" && process.env?.SITE_URL) return process.env.SITE_URL;
  return DEFAULT_SITE_URL;
}

/** Senza barra finale, così `${SITE_URL}${path}` è sempre corretto. */
export const SITE_URL = readSiteUrl().replace(/\/+$/, "");

/** Trasforma un percorso interno ("/settori") in URL assoluto. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Immagine usata nelle anteprime dei link social. */
export const OG_IMAGE = absoluteUrl("/logo-zicca.png");
