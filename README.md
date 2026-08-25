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
  lib/site-url.ts           indirizzo pubblico del sito (sitemap, canonical, social)
  integrations/supabase/    config, client browser, client pubblico SSR, middleware auth, tipi DB
supabase/migrations/   schema del database (tabelle, RLS, bucket storage)
```

## Avvio in locale

```bash
npm install
cp .env.example .env      # e compilare con le chiavi del progetto Supabase
npm run dev               # http://localhost:8080
```

## Variabili d'ambiente

**Non servono.** URL e chiave publishable (anon) del progetto sono in
`src/integrations/supabase/config.ts`: sono valori pubblici, che finiscono
comunque nel bundle servito al browser, quindi il sito funziona appena
deployato senza configurare nulla.

Le variabili di `.env.example` sono facoltative: servono a puntare a un altro
progetto Supabase (staging, fork del cliente) oppure a cambiare l'indirizzo
pubblico del sito con `SITE_URL` / `VITE_SITE_URL` — utile finché il dominio
non è stato commutato e il sito risponde su `*.vercel.app`.

L'applicazione **non usa la service role**: non esiste alcuna chiave segreta.
Le autorizzazioni sono interamente demandate al database (vedi sotto).

## Database

Progetto Supabase: **ZiccaServizi** (`mrbkuvbxqhwrtnhmpxum`, eu-west-1).

Lo stesso progetto ospita anche altre applicazioni, quindi tutte le tabelle del
sito vivono nello **schema dedicato `zicca`** (mai in `public`) e i media nel
bucket **`zicca-media`**:

- `zicca.user_roles` + funzione `zicca.has_role` (ruolo admin)
- `zicca.site_settings`, `zicca.sectors`, `zicca.projects`,
  `zicca.certifications`, `zicca.leads`, `zicca.custom_sections`
- RLS attiva su tutte le tabelle. Nessun client bypassa le policy: le letture
  pubbliche usano la chiave anon, le operazioni di amministrazione usano il
  token dell'utente collegato, quindi è il database a decidere cosa è permesso
- lo schema `zicca` è esposto a PostgREST
  (`pgrst.db_schemas = public, graphql_public, zicca`) e i client Supabase sono
  configurati con `db: { schema: "zicca" }`

Applicazione delle migrazioni su un altro progetto:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Le richieste dal form contatti fanno partire una notifica email tramite un
trigger su `zicca.leads` (`zicca.notifica_lead`), che usa `pg_net` per chiamare
il provider di invio. La chiave sta in Supabase Vault (`RESEND_API_KEY`), i
destinatari in `zicca.site_settings` → `lead_notification`, modificabili dal
pannello. Se la chiave manca o non ci sono destinatari il trigger non fa nulla,
e un errore di invio non impedisce mai il salvataggio della richiesta.

Due operazioni non sarebbero esprimibili con le sole policy e passano da
funzioni `SECURITY DEFINER`, così che nessuna tabella debba essere aperta in
scrittura:

- `zicca.submit_lead(...)` — l'invio di una richiesta dal form contatti
  (eseguibile da `anon`); rivalida i campi e scrive solo le colonne del form,
  mentre `leads` resta non scrivibile direttamente;
- `zicca.claim_first_admin()` — il primo utente registrato si auto-assegna il
  ruolo admin dalla pagina `/admin`, solo finché non esiste alcun
  amministratore; un lock evita che due richieste simultanee diventino
  entrambe admin.

## Build e deploy (Vercel)

```bash
npm run build     # in locale produce .output/ (preset node-server)
```

Su Vercel non serve configurazione particolare: Nitro rileva l'ambiente di build
e genera `.vercel/output` (Build Output API v3). Impostazioni del progetto Vercel:

- Framework preset: **Other**
- Build command: `npm run build`
- Output directory: lasciare vuoto (rilevato automaticamente)
- Environment variables: nessuna (vedi «Variabili d'ambiente»)

Il dominio del cliente si collega poi da Vercel → Project → Domains.

Per cambiare piattaforma basta il preset Nitro corrispondente
(`NITRO_PRESET=cloudflare_module`, `netlify`, `node-server`, ecc.).

## Contenuti gestiti dal pannello

Settori, referenze e certificazioni sono letti dal database (tabelle `zicca.*`,
gestite da `/admin`), che è **già popolato** con i contenuti del sito. Se una
tabella venisse svuotata, o il database non rispondesse, le pagine ricadono
sull'elenco statico presente nel codice: il sito non resta mai spoglio e non va
in errore per un problema di connessione.

| Pagina                               | Sorgente dinamica                                        | Fallback                                            |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------------------------- |
| Home + `/settori` + `/settori/$slug` | `zicca.sectors`                                          | `src/data/sectors.ts`                               |
| `/referenze`                         | `zicca.projects` (righe con immagine)                    | elenco in `src/routes/referenze.tsx`                |
| `/certificazioni`                    | `zicca.certifications`                                   | elenco in `src/routes/certificazioni.tsx`           |
| Blocchi liberi su tutte le pagine    | `zicca.custom_sections`                                  | nessuno (sezione assente)                           |
| Video/poster hero della home         | `zicca.site_settings` → `hero`                           | immagine `hero-industrial.jpg`                      |
| Gallery video home e Milano United   | `zicca.site_settings` → `videos`, `videos_milano_united` | manifest `.asset.json`, altrimenti sezione nascosta |

## Media

Immagini, video e foto delle referenze sono stati trasferiti integralmente:
le immagini (logo, favicon, foto hero/settori/team, logo Milano United) vivono
nel repository e sono verificate byte per byte; gli 8 video con i rispettivi
poster stanno nel bucket Supabase `zicca-media` e sono referenziati sia da
`zicca.site_settings` sia dai manifest `.asset.json`. Per sostituirli si usa
`/admin` → Contenuti sito, senza deploy. Dettagli in `MEDIA.md`.

## Stato della migrazione

Per la messa online e il passaggio al cliente vedi **`CONSEGNA.md`**.
Completa. Codice, database popolato, immagini, video e foto delle referenze
sono tutti in casa: il sito non richiede configurazione per funzionare e non
dipende né da Lovable né dal vecchio sito WordPress.
