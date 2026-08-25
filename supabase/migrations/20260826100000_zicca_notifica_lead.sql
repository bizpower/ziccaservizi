-- =========================================================================
-- Notifica email delle richieste dal form contatti.
--
-- Prima di questa migrazione una richiesta veniva salvata e basta: se nessuno
-- apriva /admin, restava inosservata. Ora ogni inserimento in `zicca.leads`
-- fa partire un'email ai destinatari configurati.
--
-- Scelte progettuali:
-- * l'invio parte da un trigger sul database, non dal sito: così la notifica
--   parte comunque, da qualunque punto arrivi la richiesta, e la chiave del
--   provider resta su Supabase — su Vercel non serve configurare nulla;
-- * `net.http_post` (pg_net) è asincrono: la chiamata HTTP non rallenta la
--   risposta al visitatore;
-- * la chiave sta in Supabase Vault, non in una tabella in chiaro;
-- * i destinatari stanno in `zicca.site_settings`, quindi si cambiano dal
--   pannello admin senza toccare codice né database;
-- * qualunque errore viene ingoiato: una notifica che fallisce NON deve mai
--   impedire il salvataggio della richiesta.
--
-- Finché la chiave `RESEND_API_KEY` non è presente nel Vault, il trigger non
-- fa nulla: le richieste continuano a salvarsi normalmente.
-- =========================================================================

-- Destinatari e mittente, modificabili dal pannello admin.
INSERT INTO zicca.site_settings (key, value)
SELECT 'lead_notification', jsonb_build_object(
         'enabled', true,
         'to', jsonb_build_array(),
         'from', 'Sito Zicca Servizi <noreply@ziccaservizi.it>',
         'subject_prefix', '[Sito] Nuova richiesta'
       )
WHERE NOT EXISTS (SELECT 1 FROM zicca.site_settings WHERE key = 'lead_notification');

-- Escape HTML: il contenuto arriva da un form pubblico e finisce in un'email.
CREATE OR REPLACE FUNCTION zicca.esc_html(_t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN _t IS NULL THEN NULL ELSE
    replace(replace(replace(replace(_t,
      '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;')
  END
$$;

CREATE OR REPLACE FUNCTION zicca.notifica_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = zicca, public, extensions
AS $$
DECLARE
  v_conf     jsonb;
  v_key      text;
  v_to       jsonb;
  v_from     text;
  v_prefix   text;
  v_corpo    text;
BEGIN
  SELECT value INTO v_conf FROM zicca.site_settings WHERE key = 'lead_notification';
  IF v_conf IS NULL OR coalesce((v_conf->>'enabled')::boolean, false) IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  v_to := coalesce(v_conf->'to', '[]'::jsonb);
  IF jsonb_array_length(v_to) = 0 THEN
    RETURN NEW;                                  -- nessun destinatario configurato
  END IF;

  SELECT decrypted_secret INTO v_key
    FROM vault.decrypted_secrets WHERE name = 'RESEND_API_KEY';
  IF v_key IS NULL OR v_key = '' THEN
    RETURN NEW;                                  -- provider non ancora configurato
  END IF;

  v_from   := coalesce(v_conf->>'from', 'Sito Zicca Servizi <noreply@ziccaservizi.it>');
  v_prefix := coalesce(v_conf->>'subject_prefix', '[Sito] Nuova richiesta');

  v_corpo :=
    '<h2>Nuova richiesta dal sito</h2>' ||
    '<p><strong>Nome:</strong> '     || zicca.esc_html(NEW.name)  || '</p>' ||
    '<p><strong>Email:</strong> <a href="mailto:' || zicca.esc_html(NEW.email) || '">'
                                    || zicca.esc_html(NEW.email) || '</a></p>' ||
    coalesce('<p><strong>Telefono:</strong> ' || zicca.esc_html(NEW.phone)   || '</p>', '') ||
    coalesce('<p><strong>Azienda:</strong> '  || zicca.esc_html(NEW.company) || '</p>', '') ||
    coalesce('<p><strong>Oggetto:</strong> '  || zicca.esc_html(NEW.subject) || '</p>', '') ||
    '<p><strong>Messaggio:</strong></p><p>'   ||
      replace(zicca.esc_html(NEW.message), E'\n', '<br>') || '</p>' ||
    '<hr><p style="color:#666;font-size:12px">Ricevuta il ' ||
      to_char(NEW.created_at AT TIME ZONE 'Europe/Rome', 'DD/MM/YYYY HH24:MI') ||
      '. Gestibile dall''area riservata del sito.</p>';

  PERFORM net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
                 'Authorization', 'Bearer ' || v_key,
                 'Content-Type',  'application/json'),
    body    := jsonb_build_object(
                 'from',     v_from,
                 'to',       v_to,
                 'reply_to', NEW.email,
                 'subject',  v_prefix || ' — ' || NEW.name,
                 'html',     v_corpo),
    timeout_milliseconds := 8000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Una notifica fallita non deve far perdere la richiesta.
  RAISE WARNING 'notifica_lead non riuscita: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_notifica ON zicca.leads;
CREATE TRIGGER trg_leads_notifica
  AFTER INSERT ON zicca.leads
  FOR EACH ROW EXECUTE FUNCTION zicca.notifica_lead();

REVOKE EXECUTE ON FUNCTION zicca.notifica_lead()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION zicca.esc_html(text)       FROM PUBLIC, anon;
