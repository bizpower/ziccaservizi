-- =========================================================================
-- Rende la piattaforma funzionante senza chiave service role.
--
-- Prima di questa migrazione le server function usavano il client service
-- role (che bypassa le RLS) per ogni operazione, comprese le letture
-- pubbliche: senza `SUPABASE_SERVICE_ROLE_KEY` il sito andava in errore.
--
-- Le policy RLS coprivano già letture pubbliche e scritture admin. Restavano
-- scoperte due operazioni, che qui diventano funzioni SECURITY DEFINER:
--   1. l'inserimento di un lead dal form contatti (anon);
--   2. l'auto-assegnazione del ruolo admin al primo utente (authenticated).
-- In questo modo la tabella `leads` resta non scrivibile direttamente e
-- `user_roles` non ha alcuna policy di INSERT.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Invio di una richiesta dal form contatti
-- -------------------------------------------------------------------------
-- SECURITY DEFINER: l'anonimo non scrive sulla tabella, chiama questa
-- funzione, che controlla i campi e imposta solo le colonne previste
-- (`status` e `notes` restano ai valori di default, non sono pilotabili
-- dall'esterno).
CREATE OR REPLACE FUNCTION zicca.submit_lead(
  _name    text,
  _email   text,
  _message text,
  _phone   text DEFAULT NULL,
  _company text DEFAULT NULL,
  _subject text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = zicca, public
AS $$
DECLARE
  v_name    text := btrim(coalesce(_name, ''));
  v_email   text := btrim(coalesce(_email, ''));
  v_message text := btrim(coalesce(_message, ''));
BEGIN
  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'Nome non valido';
  END IF;

  IF length(v_email) > 255
     OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Email non valida';
  END IF;

  IF length(v_message) < 10 OR length(v_message) > 4000 THEN
    RAISE EXCEPTION 'Messaggio non valido';
  END IF;

  IF length(coalesce(_phone, '')) > 40
     OR length(coalesce(_company, '')) > 160
     OR length(coalesce(_subject, '')) > 200 THEN
    RAISE EXCEPTION 'Campo troppo lungo';
  END IF;

  INSERT INTO zicca.leads (name, email, phone, company, subject, message)
  VALUES (
    v_name,
    v_email,
    nullif(btrim(coalesce(_phone, '')), ''),
    nullif(btrim(coalesce(_company, '')), ''),
    nullif(btrim(coalesce(_subject, '')), ''),
    v_message
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION zicca.submit_lead(text, text, text, text, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION zicca.submit_lead(text, text, text, text, text, text) TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 2. Primo amministratore
-- -------------------------------------------------------------------------
-- Vale solo finché non esiste alcun admin; dopo è un no-op che ritorna false.
-- Il lock advisory evita che due utenti che premono il pulsante nello stesso
-- momento diventino entrambi amministratori.
CREATE OR REPLACE FUNCTION zicca.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = zicca, public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Autenticazione richiesta';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('zicca.claim_first_admin'));

  IF EXISTS (SELECT 1 FROM zicca.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;

  INSERT INTO zicca.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION zicca.claim_first_admin() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION zicca.claim_first_admin() TO authenticated;

-- -------------------------------------------------------------------------
-- 3. Un utente autenticato deve poter verificare se è admin
-- -------------------------------------------------------------------------
-- La policy "Admins can read roles" permette la SELECT solo a chi è già
-- admin: per un utente normale la query non fallisce, torna zero righe, che
-- è esattamente la risposta "non sei admin". Nessuna modifica necessaria,
-- ma serve che `has_role` sia eseguibile da `authenticated` (già concesso
-- nella migrazione iniziale).
