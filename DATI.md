# Dati del vecchio database (Lovable Cloud) — stato e procedura di import

**Stato: chiuso.** Il nuovo database è popolato e il sito non dipende più da
Lovable in alcun modo. Il vecchio database non è mai tornato raggiungibile e
non lo si aspetta più: continuare a dipenderne sarebbe esso stesso una forma di
dipendenza da Lovable.

Al momento della migrazione non è stato possibile leggere i dati dal database
Lovable Cloud del progetto originale (`hpssrhbdypupfpyrukcx`), che vive
nell'organizzazione Supabase gestita da Lovable e non è quindi raggiungibile
nemmeno direttamente con le credenziali del cliente.

Tentativi effettuati (20/08/2026):

| Canale                                              | Esito                                     |
| --------------------------------------------------- | ----------------------------------------- |
| `query_database` (API Lovable)                      | errore `499 request_cancelled`, ripetuto  |
| Agente Lovable sul progetto (query di sola lettura) | `SUPABASE_INTERNAL_ERROR` / timeout       |
| CLI `lovable supabase query` (dal sandbox Lovable)  | `gateway_timeout` / `gateway_unavailable` |
| `psql` diretto (dal sandbox Lovable)                | tenant/user non trovato                   |
| REST API Supabase (da qui e dal sandbox Lovable)    | rete bloccata / DNS non risolto           |

Ritentato il 24/08/2026, con lo stesso esito:

| Canale                                             | Esito                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| `query_database` (API Lovable)                     | ancora `499 request_cancelled`                 |
| Script Node + `@supabase/supabase-js` nel sandbox  | `getent hosts <ref>.supabase.co` → DNS KO      |
| `curl` sulla REST API dal sandbox                  | codice HTTP `000` (timeout di connessione)     |
| Tool SQL dell'agente Lovable (`read_query`)        | timeout di connessione                         |

Non è un problema di chiavi né di RLS: l'host del database del vecchio progetto
non è proprio risolvibile. È un'indisponibilità del backend Lovable Cloud, non
una perdita di dati: i dati sono ancora nel progetto originale.

Nel progetto Lovable è stato lasciato pronto lo script `scripts/export-db.mjs`:
quando il backend torna raggiungibile basta lanciarlo dal sandbox per ottenere
l'export completo delle sei tabelle.

```bash
bun scripts/export-db.mjs        # scrive _export/db-export.json
```

Attenzione: l'output contiene la tabella `leads` con dati personali, quindi non
va scritto in `public/` né pubblicato.

## 1. Come è stato risolto

I contenuti reali del sito erano già nel repository, usati come fallback quando
il database era vuoto. Con la migrazione
`20260825100000_zicca_seed_contenuti.sql` sono stati scritti nel database, che
diventa così l'unica fonte autorevole:

| Tabella                | Righe | Origine                         |
| ---------------------- | ----- | ------------------------------- |
| `zicca.sectors`        | 4     | `src/data/sectors.ts`           |
| `zicca.certifications` | 8     | `src/routes/certificazioni.tsx` |
| `zicca.projects`       | 6     | `src/routes/referenze.tsx`      |
| `zicca.site_settings`  | 2     | gallery video (già popolate)    |

Effetto pratico: il pannello admin non è più vuoto. Il cliente apre `/admin` e
trova settori, referenze e certificazioni già compilati, da modificare,
riordinare o cancellare. I fallback nel codice restano come rete di sicurezza
se il database non risponde.

La migrazione è idempotente: ogni blocco scrive solo se la tabella è ancora
vuota, quindi rilanciarla non duplica né sovrascrive il lavoro del cliente.

### Le foto delle referenze

Le sei foto della gallery non erano asset di Lovable: già nel codice originale
erano link diretti al **vecchio sito WordPress**. Sono state scaricate finché
quel sito era ancora online e ricaricate nel bucket `zicca-media`
(dettagli e md5 in `MEDIA.md`), quindi il sito non dipende più da quel dominio.

## 2. Se un giorno il vecchio database tornasse raggiungibile

Non serve a far funzionare il sito: sarebbe solo un recupero dello storico, per
esempio le richieste di contatto ricevute nel periodo in cui il sito girava su
Lovable. Nel progetto Lovable è rimasto pronto `scripts/export-db.mjs`.

### Importare l'export nel nuovo database

Le tabelle hanno le stesse colonne: cambia solo lo schema
(`public.<tabella>` → `zicca.<tabella>`). Esempio con un file JSON di export:

```sql
-- una tabella alla volta, sostituendo il JSON dell'export
insert into zicca.sectors
select * from jsonb_populate_recordset(null::zicca.sectors, '[ ...json... ]'::jsonb);
```

Ordine consigliato: `site_settings`, `sectors`, `projects`, `certifications`,
`custom_sections`, `leads`.

### Avvertenze

- **`user_roles` non va importata**: fa riferimento a utenti `auth.users` del
  vecchio progetto, che qui non esistono. Gli amministratori vanno ricreati:
  registrare l'utente, accedere a `/login` e poi usare il pulsante
  **“Diventa amministratore”** in `/admin` (funziona solo per il primo admin;
  gli altri si aggiungono con
  `insert into zicca.user_roles (user_id, role) values ('<uuid>', 'admin');`).
- **URL dei media**: i campi `image_url`, `logo_url`, `pdf_url` degli export
  puntano al bucket `media` del vecchio progetto Supabase. Dopo aver ricaricato
  i file nel bucket `zicca-media` vanno aggiornati, per esempio:

  ```sql
  update zicca.sectors
     set image_url = replace(image_url,
       'https://hpssrhbdypupfpyrukcx.supabase.co/storage/v1/object/public/media/',
       'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/');
  ```

  (stessa cosa per `projects.image_url`, `certifications.logo_url`/`pdf_url`,
  `custom_sections.image_url` e per le chiavi `hero.video_url` /
  `hero.poster_url` dentro `site_settings`).

## 3. Cosa funziona senza il vecchio database

Tutto. Il sito è completo e interamente gestibile dal pannello. Dal vecchio
database dipenderebbe soltanto lo storico delle richieste di contatto arrivate
mentre il sito girava su Lovable.
