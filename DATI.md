# Dati del vecchio database (Lovable Cloud) — stato e procedura di import

Il nuovo database (`zicca` su progetto Supabase `mrbkuvbxqhwrtnhmpxum`) è creato e
funzionante, ma **vuoto**: al momento della migrazione non è stato possibile
leggere i dati dal database Lovable Cloud del progetto originale
(`hpssrhbdypupfpyrukcx`).

Tentativi effettuati (20/08/2026):

| Canale | Esito |
| --- | --- |
| `query_database` (API Lovable) | errore `499 request_cancelled`, ripetuto |
| Agente Lovable sul progetto (query di sola lettura) | `SUPABASE_INTERNAL_ERROR` / timeout |
| CLI `lovable supabase query` (dal sandbox Lovable) | `gateway_timeout` / `gateway_unavailable` |
| `psql` diretto (dal sandbox Lovable) | tenant/user non trovato |
| REST API Supabase (da qui e dal sandbox Lovable) | rete bloccata / DNS non risolto |

È un'indisponibilità del backend Lovable Cloud, non una perdita di dati: i dati
sono ancora nel progetto originale.

## 1. Esportare i dati da Lovable

Nell'editor Lovable del progetto “Zicca Servizi SRL”:
**Cloud → Advanced settings → Export data** (export completo del database).

In alternativa, quando il backend torna raggiungibile, bastano queste SELECT:

```sql
select * from public.site_settings order by key;
select * from public.sectors order by sort_order;
select * from public.projects order by sort_order;
select * from public.certifications order by sort_order;
select * from public.custom_sections order by page_location, sort_order;
select * from public.leads order by created_at;
select ur.user_id, ur.role, u.email from public.user_roles ur
  join auth.users u on u.id = ur.user_id;
```

## 2. Importare nel nuovo database

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

## 3. Cosa funziona già senza questi dati

Tutte le pagine pubbliche: i contenuti di home, azienda, settori, referenze e
certificazioni sono nel codice (`src/data/sectors.ts` e i dati nelle rotte). Dal
database dipendono solo: le sezioni personalizzate, il video di sfondo della
home, le voci gestite da pannello admin e lo storico delle richieste di contatto.
