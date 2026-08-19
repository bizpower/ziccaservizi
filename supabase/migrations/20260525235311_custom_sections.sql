CREATE TABLE public.custom_sections (
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

CREATE INDEX idx_custom_sections_page ON public.custom_sections(page_location, sort_order) WHERE published = true;

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published custom sections"
  ON public.custom_sections FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins manage custom sections"
  ON public.custom_sections FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_custom_sections_updated_at
  BEFORE UPDATE ON public.custom_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
