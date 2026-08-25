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

### a) Variabili d'ambiente su Vercel — non servono

Non c'è niente da configurare: il sito si collega al progetto Supabase con URL
e chiave publishable (anon) già presenti nel codice
(`src/integrations/supabase/config.ts`). Sono valori pubblici per definizione,
perché finiscono comunque nel JavaScript servito al browser.

L'applicazione **non usa alcuna chiave segreta**: non esiste più una service
role da custodire. Chi può fare cosa lo decide il database, tramite le policy
RLS dello schema `zicca` e due funzioni `SECURITY DEFINER`:

| Operazione                             | Chi la può fare | Come                             |
| -------------------------------------- | ---------------- | -------------------------------- |
| Leggere i contenuti pubblicati         | chiunque         | policy RLS di lettura pubblica   |
| Inviare una richiesta dal form         | chiunque         | `zicca.submit_lead(...)`         |
| Leggere le richieste ricevute          | solo admin       | policy RLS                       |
| Modificare i contenuti dal pannello    | solo admin       | policy RLS                       |
| Diventare il primo amministratore      | primo utente     | `zicca.claim_first_admin()`      |

Le variabili di `.env.example` restano disponibili, ma servono soltanto per
puntare il sito a un altro progetto Supabase.

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

Settori, referenze e certificazioni sono **già compilati**: il cliente li trova
pronti nel pannello e può modificarli, riordinarli o cancellarli.

Se una sezione venisse svuotata, o il database non rispondesse, il sito mostra i
contenuti predefiniti presenti nel codice: **non resta mai una pagina spoglia**.

Gli upload di immagini e PDF dal pannello finiscono nel bucket `zicca-media` e
sono immediatamente pubblici.

## 4. Punti aperti

Nessuno. La piattaforma è completa: codice, database popolato, immagini, video
e foto delle referenze (`MEDIA.md`), nessuna configurazione richiesta per il
deploy e nessuna dipendenza residua da Lovable o dal vecchio sito WordPress.

Resta facoltativo, se il cliente lo preferisce, rendere privato il repository da
GitHub → Settings → Danger Zone → Change visibility.

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
- Sito verificato **senza alcuna variabile d'ambiente** e con il database
  irraggiungibile: tutte le rotte rispondono 200 e mostrano i contenuti
  predefiniti, nessun errore in console.
- Permessi verificati sul database interrogandolo come utente anonimo:
  l'inserimento diretto in `leads` è respinto dalle RLS, l'invio dal form via
  `zicca.submit_lead` funziona, le richieste ricevute non sono leggibili
  (0 righe visibili), `zicca.claim_first_admin` non è eseguibile da anonimo.
- Bundle client ispezionato: l'unica chiave presente è quella `anon`.
- Contenuti caricati nel database e riletti come utente anonimo attraverso le
  RLS: 4 settori, 8 certificazioni e 6 referenze con immagine, tutti visibili.
- Nessun riferimento residuo al vecchio sito WordPress: le foto delle referenze
  sono nel bucket `zicca-media` e verificate con md5 rispetto agli originali.

Nota: `npm run lint` segnala 30 avvisi `no-explicit-any` ereditati dal codice
originale. Non bloccano build né deploy; sono un eventuale intervento di pulizia
successivo.

## 6. Manutenzione ordinaria

- **Deploy**: ogni push su `main` pubblica automaticamente su Vercel.
- **Modifiche ai contenuti**: dal pannello admin, senza deploy.
- **Backup database**: Supabase → Database → Backups (giornalieri sul piano a
  pagamento; sul piano Free conviene un export periodico).
- **Chiavi**: nessuna chiave segreta da custodire. Se in Supabase viene
  ruotata la chiave anon, si aggiorna il valore in
  `src/integrations/supabase/config.ts` (o si imposta `VITE_SUPABASE_PUBLISHABLE_KEY`
  su Vercel) e si rifà il deploy.
