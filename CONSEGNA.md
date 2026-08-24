# Consegna — Zicca Servizi

Documento operativo per la messa online e il passaggio al cliente.

## 1. Cosa viene consegnato

| Elemento                  | Dove                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Codice sorgente           | `github.com/bizpower/ziccaservizi` (branch `main`)                                                                      |
| Hosting                   | Vercel, progetto `ziccaservizi` (team Bizpower SRL), collegato al repo                                                  |
| Database + Auth + Storage | Supabase, progetto `ZiccaServizi` (`mrbkuvbxqhwrtnhmpxum`), schema `zicca`, bucket `zicca-media`                        |
| Sito pubblico             | Home, Azienda, Settori (indice + pagina per settore), Referenze, Certificazioni, Milano United, Contatti, `sitemap.xml` |
| Area riservata            | `/login` + `/admin` (dashboard, richieste, settori, referenze, certificazioni, sezioni custom, contenuti sito)          |

Nessuna dipendenza da Lovable: build, deploy e database sono interamente sotto
il controllo del proprietario del repository.

## 2. Prima della messa online — da fare una volta sola

### a) Variabili d'ambiente su Vercel

Vercel → progetto `ziccaservizi` → Settings → Environment Variables. Inserire
per **Production** (e Preview, se si vogliono anteprime funzionanti) tutte le
variabili elencate in `.env.example`:

```
SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_PROJECT_ID,
SUPABASE_SERVICE_ROLE_KEY,
VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
```

URL e chiave anon sono già compilati in `.env.example`; la **service role** si
copia da Supabase → Settings → API. È l'unica chiave segreta: non va mai messa
nel repository né in variabili con prefisso `VITE_`.

> Senza queste variabili il sito viene compilato correttamente ma va in errore
> nel browser: è la prima cosa da fare.

Dopo averle inserite: Deployments → ultimo deployment → Redeploy.

### b) Primo amministratore

1. Creare l'utente in Supabase → Authentication → Users → Add user (email +
   password, "Auto Confirm User" attivo).
2. Andare su `/login` del sito e accedere.
3. Alla prima visita di `/admin` compare il pulsante **"Diventa amministratore"**:
   funziona solo finché non esiste alcun admin, quindi va usato dal titolare.

Amministratori successivi: creare l'utente in Supabase e poi, dal SQL editor:

```sql
insert into zicca.user_roles (user_id, role) values ('<uuid-utente>', 'admin');
```

### c) Dominio

Vercel → progetto → Settings → Domains → Add. Vercel indica i record DNS
(di norma un `A` sulla radice e un `CNAME` su `www`) da inserire presso il
registrar del cliente. Il certificato HTTPS è automatico.

## 3. Cosa può fare il cliente dal pannello

| Sezione admin      | Effetto sul sito                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Richieste**      | Elenco dei contatti arrivati dal form, con stato (nuova / in lavorazione / chiusa) ed eliminazione                   |
| **Settori**        | Pilota la sezione settori in home, la pagina `/settori` e le pagine di dettaglio `/settori/<slug>`                   |
| **Referenze**      | Pilota la gallery di `/referenze`, con filtro per categoria                                                          |
| **Certificazioni** | Pilota le schede di `/certificazioni`, con link al PDF quando caricato                                               |
| **Sezioni custom** | Aggiunge blocchi liberi (titolo, testo markdown, immagine, pulsante) a qualsiasi pagina, con ordine e stile          |
| **Contenuti sito** | Video e immagine di sfondo della home, **gallery video di home e Milano United** (già popolate), numeri animati, recapiti aziendali |

Finché una sezione del pannello è vuota, il sito mostra i contenuti predefiniti
già presenti nel codice: **non resta mai una pagina spoglia**, nemmeno se il
database è irraggiungibile.

Gli upload di immagini e PDF dal pannello finiscono nel bucket `zicca-media` e
sono immediatamente pubblici.

## 4. Punti aperti

1. **Variabili d'ambiente su Vercel** — vanno inserite a mano (punto 2a): il
   token di questa migrazione non ha i permessi per scriverle. È l'unico
   passaggio obbligatorio prima del primo deploy.
2. **Dati del vecchio database** (`DATI.md`) — al momento della migrazione il
   backend Lovable Cloud non era raggiungibile, quindi i contenuti inseriti da
   Lovable non sono stati esportati. Le tabelle nuove sono vuote e il sito usa i
   contenuti predefiniti del codice: il cliente può ripopolarle dal pannello
   admin, oppure si riprova l'export quando Lovable torna disponibile.
3. **Repository pubblico** — se il cliente preferisce, va reso privato da
   GitHub → Settings → Danger Zone → Change visibility.

Video e immagini sono invece **completi**: vedi `MEDIA.md`.

## 5. Verifiche già effettuate

- `npx tsc --noEmit`: nessun errore.
- `npm run build` (locale) e build su Vercel: entrambe a buon fine.
- Tutte le rotte pubbliche e l'area admin rispondono 200 in SSR; rotte
  inesistenti danno 404 con pagina dedicata in italiano.
- Immagini originali trasferite e verificate con md5 rispetto agli originali.
- Tutti e 8 i video + poster caricati nel bucket `zicca-media` e collegati in
  `zicca.site_settings`: le sezioni video di home e `/milano-united` sono
  verificate in SSR (5 video in home, 3 su Milano United).
- Schema `zicca` applicato con RLS attiva su tutte le tabelle; lettura pubblica
  limitata ai contenuti pubblicati, scritture riservate agli amministratori.

Nota: `npm run lint` segnala 30 avvisi `no-explicit-any` ereditati dal codice
originale. Non bloccano build né deploy; sono un eventuale intervento di pulizia
successivo.

## 6. Manutenzione ordinaria

- **Deploy**: ogni push su `main` pubblica automaticamente su Vercel.
- **Modifiche ai contenuti**: dal pannello admin, senza deploy.
- **Backup database**: Supabase → Database → Backups (giornalieri sul piano a
  pagamento; sul piano Free conviene un export periodico).
- **Chiavi**: se la service role viene rigenerata, aggiornare la variabile su
  Vercel e rifare il deploy.
