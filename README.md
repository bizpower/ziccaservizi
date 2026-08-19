# Zicca Servizi — sito istituzionale + area amministrativa

Sito pubblico e pannello di amministrazione di **Zicca Servizi S.r.l.**
Codice indipendente (migrato da Lovable): può essere sviluppato, buildato e
deployato senza alcuna dipendenza dalla piattaforma Lovable.

## Stack

| Ambito | Tecnologia |
| --- | --- |
| Framework | TanStack Start (React 19 + TanStack Router, SSR) |
| Build | Vite 7 |
| Stili | Tailwind CSS 4 + shadcn/ui (`components.json`) |
| Backend | Supabase (Postgres + Auth + Storage) |
| Runtime di deploy | Cloudflare Workers (`wrangler.jsonc`) |

## Struttura

```
src/
  routes/              pagine (file-based routing TanStack)
    index.tsx          home
    azienda / settori / referenze / certificazioni / contatti / milano-united
    login.tsx          accesso area riservata
    admin*.tsx         pannello amministrativo (dashboard, lead, contenuti, sezioni…)
    sitemap[.]xml.ts   sitemap generata a runtime
  components/site/     Navbar, Footer, SectionHeader, VideoShowcase, CustomSections
  components/admin/    MediaUpload (upload su Supabase Storage)
  components/ui/       componenti shadcn/ui
  lib/content.functions.ts  server functions (letture pubbliche, invio lead, CRUD admin)
  integrations/supabase/    client browser, client service-role, middleware auth, tipi DB
supabase/migrations/   schema del database (tabelle, RLS, bucket storage)
```

## Avvio in locale

```bash
npm install
cp .env.example .env      # e compilare con le chiavi del progetto Supabase
npm run dev               # http://localhost:8080
```

## Variabili d'ambiente

Vedi `.env.example`. In produzione vanno impostate come secret della piattaforma
di hosting (per Cloudflare: `wrangler secret put <NOME>`); le `VITE_*` sono
inserite nel bundle a build time, quindi devono essere presenti anche in fase di build.

`SUPABASE_SERVICE_ROLE_KEY` è usata **solo** lato server (`client.server.ts`) e
non deve mai finire nel bundle client.

## Database

Le migrazioni in `supabase/migrations/` ricreano l'intero schema:
ruoli (`user_roles` + funzione `has_role`), `site_settings`, `sectors`,
`projects`, `certifications`, `leads`, `custom_sections`, policy RLS e bucket
storage pubblico `media`.

Applicazione su un progetto Supabase nuovo:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Il primo utente registrato può auto-assegnarsi il ruolo admin dalla pagina
`/admin` (funzione `claimFirstAdmin`, attiva solo finché non esiste alcun admin).

## Build e deploy (Cloudflare Workers)

```bash
npm run build
npx wrangler deploy
```

Il dominio del cliente si collega poi da Cloudflare (Workers → Custom Domains)
oppure, se si sceglie un'altra piattaforma, dal relativo pannello.

## Media

Immagini e video del progetto originale non sono inclusi in questo repository
(vedi `MEDIA.md`): i file `src/assets/*.jpg`, `public/*.png` sono **segnaposto**
e i manifest `src/assets/**/*.asset.json` hanno il campo `url` vuoto in attesa
dell'URL pubblico definitivo.
