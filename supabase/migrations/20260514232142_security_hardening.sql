-- Fix mutable search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Revoke direct EXECUTE on has_role; policies still call it via SECURITY DEFINER context.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Restrict media bucket listing: allow downloads by exact path, disallow LIST queries.
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;

-- Allow individual object SELECT (downloads) but not listing the bucket root.
-- Storage list operation queries with name='' or prefix; restrict by requiring a path.
CREATE POLICY "Public can read media files"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media' AND name <> '');
