# Zicca Servizi — sito istituzionale + area amministrativa

Sito pubblico e pannello di amministrazione di **Zicca Servizi S.r.l.**
Codice indipendente (migrato da Lovable): può essere sviluppato, buildato e
deployato senza alcuna dipendenza dalla piattaforma Lovable.

## Stack

| Ambito    | Tecnologia                                       |
| --------- | ------------------------------------------------ |
| Framework | TanStack Start (React 19 + TanStack Router, SSR) |
| Build     | Vite 7                                           |
| Stili     | Tailwind CSS 4 + shadcn/ui (`components.json`)   |
| Backend   | Supabase (Postgres + Auth + Storage)             |
| Deploy    | Vercel (build Nitro, Build Output API)           |

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

Vedi `.env.example`. In produzione vanno impostate tra le Environment Variables
del progetto Vercel; le `VITE_*` sono inserite nel bundle a build time, quindi
devono essere presenti anche in fase di build.

`SUPABASE_SERVICE_ROLE_KEY` è usata **solo** lato server (`client.server.ts`) e
non deve mai finire nel bundle client.

## Database

Progetto Supabase: **ZiccaServizi** (`mrbkuvbxqhwrtnhmpxum`, eu-west-1).

Lo stesso progetto ospita anche altre applicazioni, quindi tutte le tabelle del
sito vivono nello **schema dedicato `zicca`** (mai in `public`) e i media nel
bucket **`zicca-media`**:

- `zicca.user_roles` + funzione `zicca.has_role` (ruolo admin)
- `zicca.site_settings`, `zicca.sectors`, `zicca.projects`,
  `zicca.certifications`, `zicca.leads`, `zicca.custom_sections`
- RLS attiva su tutte le tabelle; le scritture applicative passano dalle server
  function con client service role
- lo schema `zicca` è esposto a PostgREST
  (`pgrst.db_schemas = public, graphql_public, zicca`) e i client Supabase sono
  configurati con `db: { schema: "zicca" }`

Applicazione delle migrazioni su un altro progetto:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Il primo utente registrato può auto-assegnarsi il ruolo admin dalla pagina
`/admin` (funzione `claimFirstAdmin`, attiva solo finché non esiste alcun admin).

## Build e deploy (Vercel)

```bash
npm run build     # in locale produce .output/ (preset node-server)
```

Su Vercel non serve configurazione particolare: Nitro rileva l'ambiente di build
e genera `.vercel/output` (Build Output API v3). Impostazioni del progetto Vercel:

- Framework preset: **Other**
- Build command: `npm run build`
- Output directory: lasciare vuoto (rilevato automaticamente)
- Environment variables: quelle di `.env.example` (comprese le `VITE_*`,
  necessarie anche in fase di build)

Il dominio del cliente si collega poi da Vercel → Project → Domains.

Per cambiare piattaforma basta il preset Nitro corrispondente
(`NITRO_PRESET=cloudflare_module`, `netlify`, `node-server`, ecc.).

## Contenuti gestiti dal pannello

Settori, referenze e certificazioni sono letti dal database (tabelle `zicca.*`,
gestite da `/admin`) e ricadono sull'elenco statico presente nel codice quando
la tabella è vuota o il database non risponde: il sito non resta mai spoglio e
non va in errore per un problema di connessione al database.

| Pagina | Sorgente dinamica | Fallback |
| --- | --- | --- |
| Home + `/settori` + `/settori/$slug` | `zicca.sectors` | `src/data/sectors.ts` |
| `/referenze` | `zicca.projects` (righe con immagine) | elenco in `src/routes/referenze.tsx` |
| `/certificazioni` | `zicca.certifications` | elenco in `src/routes/certificazioni.tsx` |
| Blocchi liberi su tutte le pagine | `zicca.custom_sections` | nessuno (sezione assente) |
| Video/poster hero della home | `zicca.site_settings` → `hero` | immagine `hero-industrial.jpg` |

## Media

Le immagini originali (logo, favicon, foto hero/settori/team, logo Milano
United) sono state trasferite e verificate byte per byte. Restano da ricaricare
solo i **video**: i manifest `src/assets/**/*.asset.json` hanno il campo `url`
vuoto e finché resta tale le sezioni video non vengono mostrate. Dettagli in
`MEDIA.md`.

## Stato della migrazione

Per la messa online e il passaggio al cliente vedi **`CONSEGNA.md`**.
Da completare, con le procedure già pronte:

- **Video** → `MEDIA.md`: caricarli su `zicca-media` e compilare i manifest
  (le immagini sono già a posto).
- **Dati del vecchio database** → `DATI.md`: il backend Lovable Cloud non era
  raggiungibile al momento della migrazione; il nuovo schema è pronto e vuoto.
- **Variabili d'ambiente su Vercel**: progetto `ziccaservizi`
  (team Bizpower SRL) già collegato a questo repository, branch di produzione
  `main`. Prima del primo deploy vanno inserite le variabili di `.env.example`,
  inclusa `SUPABASE_SERVICE_ROLE_KEY`.
