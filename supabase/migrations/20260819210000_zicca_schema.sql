-- =====================================================================
-- Zicca Servizi — schema applicativo isolato
-- Il progetto Supabase ospita anche altre applicazioni: tutte le tabelle
-- del sito vivono nello schema dedicato `zicca`, mai in `public`.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS zicca;

GRANT USAGE ON SCHEMA zicca TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA zicca
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA zicca
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA zicca
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- =========================================
-- RUOLI
-- =========================================
CREATE TYPE zicca.app_role AS ENUM ('admin');

CREATE TABLE zicca.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role zicca.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE zicca.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION zicca.has_role(_user_id uuid, _role zicca.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = zicca
AS $$
  SELECT EXISTS (
    SELECT 1 FROM zicca.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can read roles"
  ON zicca.user_roles FOR SELECT TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'));

-- =========================================
-- TRIGGER updated_at
-- =========================================
CREATE OR REPLACE FUNCTION zicca.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = zicca
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- IMPOSTAZIONI SITO (key/value JSONB)
-- =========================================
CREATE TABLE zicca.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE zicca.site_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON zicca.site_settings
  FOR EACH ROW EXECUTE FUNCTION zicca.set_updated_at();

CREATE POLICY "Public read site settings"
  ON zicca.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write site settings"
  ON zicca.site_settings FOR ALL TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'))
  WITH CHECK (zicca.has_role(auth.uid(), 'admin'));

-- =========================================
-- SETTORI
-- =========================================
CREATE TABLE zicca.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE zicca.sectors ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sectors_updated BEFORE UPDATE ON zicca.sectors
  FOR EACH ROW EXECUTE FUNCTION zicca.set_updated_at();

CREATE POLICY "Public read published sectors"
  ON zicca.sectors FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins manage sectors"
  ON zicca.sectors FOR ALL TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'))
  WITH CHECK (zicca.has_role(auth.uid(), 'admin'));

-- =========================================
-- REFERENZE (progetti / cantieri)
-- =========================================
CREATE TABLE zicca.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client TEXT,
  category TEXT,
  year INT,
  location TEXT,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE zicca.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON zicca.projects
  FOR EACH ROW EXECUTE FUNCTION zicca.set_updated_at();

CREATE POLICY "Public read published projects"
  ON zicca.projects FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins manage projects"
  ON zicca.projects FOR ALL TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'))
  WITH CHECK (zicca.has_role(auth.uid(), 'admin'));

-- =========================================
-- CERTIFICAZIONI
-- =========================================
CREATE TABLE zicca.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT,
  year INT,
  description TEXT,
  pdf_url TEXT,
  logo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE zicca.certifications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_certs_updated BEFORE UPDATE ON zicca.certifications
  FOR EACH ROW EXECUTE FUNCTION zicca.set_updated_at();

CREATE POLICY "Public read published certifications"
  ON zicca.certifications FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins manage certifications"
  ON zicca.certifications FOR ALL TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'))
  WITH CHECK (zicca.has_role(auth.uid(), 'admin'));

-- =========================================
-- RICHIESTE DAL FORM CONTATTI
-- =========================================
CREATE TYPE zicca.lead_status AS ENUM ('new', 'in_progress', 'closed');

CREATE TABLE zicca.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status zicca.lead_status NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE zicca.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON zicca.leads
  FOR EACH ROW EXECUTE FUNCTION zicca.set_updated_at();

-- L'inserimento avviene dalla server function con client service role:
-- nessuna policy di INSERT pubblica. Lettura/modifica solo per gli admin.
CREATE POLICY "Admins read leads"
  ON zicca.leads FOR SELECT TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads"
  ON zicca.leads FOR UPDATE TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'))
  WITH CHECK (zicca.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads"
  ON zicca.leads FOR DELETE TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'));

-- =========================================
-- SEZIONI PERSONALIZZATE (CMS no-code)
-- =========================================
CREATE TABLE zicca.custom_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_location TEXT NOT NULL DEFAULT 'home',
  eyebrow TEXT,
  title TEXT NOT NULL,
  heading_level SMALLINT NOT NULL DEFAULT 2,
  subtitle TEXT,
  body TEXT,
  image_url TEXT,
  image_position TEXT NOT NULL DEFAULT 'right',
  cta_label TEXT,
  cta_url TEXT,
  background_style TEXT NOT NULL DEFAULT 'default',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT heading_level_range CHECK (heading_level BETWEEN 2 AND 4),
  CONSTRAINT image_position_valid CHECK (image_position IN ('left','right','top','background','none')),
  CONSTRAINT background_style_valid CHECK (background_style IN ('default','muted','dark','gradient'))
);

CREATE INDEX idx_custom_sections_page
  ON zicca.custom_sections(page_location, sort_order) WHERE published = true;

ALTER TABLE zicca.custom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published custom sections"
  ON zicca.custom_sections FOR SELECT TO anon, authenticated
  USING (published = true);
CREATE POLICY "Admins manage custom sections"
  ON zicca.custom_sections FOR ALL TO authenticated
  USING (zicca.has_role(auth.uid(), 'admin'))
  WITH CHECK (zicca.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_custom_sections_updated_at
  BEFORE UPDATE ON zicca.custom_sections
  FOR EACH ROW EXECUTE FUNCTION zicca.set_updated_at();

-- =========================================
-- PRIVILEGI (le RLS restano la barriera effettiva)
-- =========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA zicca TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA zicca TO service_role;

-- has_role non deve essere invocabile da client anonimi. Resta invocabile da
-- `authenticated` perché le policy RLS dello storage (upload admin) vengono
-- valutate con i privilegi dell'utente autenticato che esegue la query.
REVOKE EXECUTE ON FUNCTION zicca.has_role(uuid, zicca.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION zicca.has_role(uuid, zicca.app_role) TO authenticated;

-- =========================================
-- STORAGE: bucket dedicato al sito
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('zicca-media', 'zicca-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Zicca public read media files"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'zicca-media' AND name <> '');

CREATE POLICY "Zicca admins can upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'zicca-media' AND zicca.has_role(auth.uid(), 'admin'));

CREATE POLICY "Zicca admins can update media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'zicca-media' AND zicca.has_role(auth.uid(), 'admin'));

CREATE POLICY "Zicca admins can delete media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'zicca-media' AND zicca.has_role(auth.uid(), 'admin'));
