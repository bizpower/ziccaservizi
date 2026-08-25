-- =========================================================================
-- Popolamento iniziale dei contenuti.
--
-- Il vecchio database Lovable Cloud non è mai tornato raggiungibile (vedi
-- DATI.md), e continuare ad aspettarlo sarebbe di per sé una dipendenza da
-- Lovable. I contenuti reali del sito sono però già nel repository, usati
-- finora solo come fallback: qui vengono scritti nel database, che diventa
-- così l'unica fonte autorevole.
--
-- Effetto pratico: il pannello admin non è più vuoto. Il cliente apre
-- /admin e trova settori, referenze e certificazioni già compilati, pronti
-- da modificare, riordinare o cancellare.
--
-- Idempotente: ogni blocco scrive solo se la tabella è ancora vuota, così
-- rilanciarlo non duplica né sovrascrive quanto inserito dal cliente.
-- =========================================================================

-- -------------------------------------------------------------------------
-- SETTORI  (da src/data/sectors.ts)
-- -------------------------------------------------------------------------
-- `image_url` resta NULL di proposito: il codice ricade sull'immagine
-- inclusa nel bundle corrispondente allo slug, quindi l'aspetto del sito non
-- cambia. Caricando un'immagine dal pannello si sovrascrive il default.
INSERT INTO zicca.sectors (slug, title, tagline, description, bullets, sort_order, published)
SELECT * FROM (VALUES
  (
    'impianti-tecnologici',
    'Impianti tecnologici civili e industriali',
    'Impianti elettrici, meccanici, termoidraulici e speciali per edifici civili e industriali.',
    'Realizziamo impianti elettrici, meccanici, idrosanitari, di climatizzazione, antincendio, fotovoltaici e speciali, per il settore civile e industriale. Progettazione integrata, esecuzione certificata e collaudo finale a regola d''arte.',
    '["Impianti elettrici BT/MT","Climatizzazione e riscaldamento","Idrosanitari e antincendio","Fotovoltaico ed efficientamento","Sistemi speciali e BMS"]'::jsonb,
    0, true
  ),
  (
    'settore-edile',
    'Settore edile',
    'Edilizia integrata, ristrutturazioni e opere civili a supporto degli impianti.',
    'Realizziamo opere civili ed edili integrate ai progetti impiantistici: ristrutturazioni complete, finiture, opere strutturali, sistemazioni esterne e cantieri chiavi in mano per committenti privati, pubblici e industriali.',
    '["Ristrutturazioni complete","Opere strutturali e finiture","Cantieri chiavi in mano","Sistemazioni esterne","Edilizia industriale"]'::jsonb,
    1, true
  ),
  (
    'manutenzione-impianti',
    'Manutenzione e conduzione impianti',
    'Servizi di manutenzione ordinaria, programmata e su chiamata 24/7.',
    'Garantiamo la continuità operativa degli impianti con contratti di manutenzione ordinaria, straordinaria, programmata e gestione tecnica completa. Squadre specializzate, reperibilità 24/7 e reportistica digitale.',
    '["Manutenzione programmata","Pronto intervento 24/7","Conduzione e gestione","Audit energetico","Reportistica digitale"]'::jsonb,
    2, true
  ),
  (
    'progettazione',
    'Progettazione',
    'Studio di fattibilità, progettazione esecutiva e direzione lavori.',
    'Il nostro studio tecnico interno cura ogni fase progettuale: fattibilità, definitiva, esecutiva, direzione lavori e collaudo. Lavoriamo in BIM e in stretta collaborazione con architetti e committenti.',
    '["Studio di fattibilità","Progettazione esecutiva","Direzione lavori","Modellazione BIM","Pratiche e collaudi"]'::jsonb,
    3, true
  )
) AS v(slug, title, tagline, description, bullets, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM zicca.sectors);

-- -------------------------------------------------------------------------
-- CERTIFICAZIONI  (da src/routes/certificazioni.tsx)
-- -------------------------------------------------------------------------
-- `issuer` contiene la sigla mostrata come badge; `pdf_url` resta NULL finché
-- il cliente non carica il certificato dal pannello (il pulsante "Scarica PDF"
-- compare solo quando il file c'è).
INSERT INTO zicca.certifications (title, issuer, description, sort_order, published)
SELECT * FROM (VALUES
  ('Sistema di Gestione Qualità', 'ISO 9001:2015',
   'Certificazione del sistema di gestione qualità per la progettazione, installazione e manutenzione di impianti.', 0, true),
  ('Gestione Ambientale', 'ISO 14001:2015',
   'Certificazione che attesta l''impegno verso la sostenibilità e la riduzione dell''impatto ambientale.', 1, true),
  ('Salute e Sicurezza sul Lavoro', 'ISO 45001:2018',
   'Sistema di gestione della sicurezza per tutela dei lavoratori e dei subappaltatori in cantiere.', 2, true),
  ('Impianti tecnologici', 'SOA OG11',
   'Attestazione SOA per la categoria impianti tecnologici, requisito fondamentale per appalti pubblici.', 3, true),
  ('Impianti termici e di condizionamento', 'SOA OS28',
   'Attestazione SOA per la realizzazione di impianti termici e di climatizzazione.', 4, true),
  ('Impianti elettrici, telefonici e radiotelefonici', 'SOA OS30',
   'Attestazione SOA per la categoria impianti elettrici nelle sue declinazioni.', 5, true),
  ('Ente di certificazione', 'ICIM',
   'Certificato ICIM per la conformità dei processi e dei sistemi di gestione aziendale.', 6, true),
  ('Patentino refrigeranti', 'F-Gas',
   'Abilitazione per la manipolazione dei gas fluorurati ad effetto serra ai sensi del Reg. UE 517/2014.', 7, true)
) AS v(title, issuer, description, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM zicca.certifications);

-- -------------------------------------------------------------------------
-- REFERENZE  (da src/routes/referenze.tsx)
-- -------------------------------------------------------------------------
-- Le sei foto erano originariamente hotlinkate dal vecchio sito WordPress
-- (www.ziccaservizi.it/wp-content/...), che verrà spento quando il dominio
-- passerà a puntare su questo sito. Sono state trasferite nel bucket
-- `zicca-media`, cartella `referenze/`, e verificate con md5 rispetto agli
-- originali: il sito non dipende più da quel dominio.
INSERT INTO zicca.projects (title, category, location, image_url, sort_order, published)
SELECT * FROM (VALUES
  ('Cantiere industriale', 'Industriale', NULL,
   'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/cantiere-industriale.jpg', 0, true),
  ('Impianto civile', 'Civile', NULL,
   'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/impianto-civile.jpg', 1, true),
  ('Quadri elettrici', 'Industriale', NULL,
   'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/quadri-elettrici.jpg', 2, true),
  ('Impianto produttivo', 'Industriale', NULL,
   'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/impianto-produttivo.jpg', 3, true),
  ('Edificio residenziale', 'Civile', NULL,
   'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/edificio-residenziale.jpg', 4, true),
  ('Cabina di trasformazione', 'Industriale', 'Genova',
   'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/cabina-trasformazione-genova.jpg', 5, true)
) AS v(title, category, location, image_url, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM zicca.projects);
