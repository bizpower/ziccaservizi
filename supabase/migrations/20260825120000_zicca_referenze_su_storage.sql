-- =========================================================================
-- Referenze: dalle foto sul vecchio sito WordPress al bucket `zicca-media`.
--
-- Le sei foto delle referenze erano hotlinkate da
-- `www.ziccaservizi.it/wp-content/...`. Quel dominio è destinato a puntare su
-- questo sito, quindi quegli indirizzi smetteranno di rispondere e la gallery
-- si svuoterebbe. Le immagini sono state scaricate e ricaricate in
-- `zicca-media/referenze/`, verificate con md5 rispetto agli originali.
--
-- Questa migrazione allinea i database già popolati prima del trasferimento.
-- Su un database creato da zero è un no-op: il seed
-- (20260825100000_zicca_seed_contenuti.sql) inserisce già gli indirizzi nuovi.
-- =========================================================================

UPDATE zicca.projects SET image_url =
  'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/cantiere-industriale.jpg'
  WHERE image_url LIKE '%ziccaservizi.it/wp-content%163025516_%';

UPDATE zicca.projects SET image_url =
  'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/impianto-civile.jpg'
  WHERE image_url LIKE '%ziccaservizi.it/wp-content%/2021/01/30.jpg';

UPDATE zicca.projects SET image_url =
  'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/quadri-elettrici.jpg'
  WHERE image_url LIKE '%ziccaservizi.it/wp-content%/2021/01/5-3.jpg';

UPDATE zicca.projects SET image_url =
  'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/impianto-produttivo.jpg'
  WHERE image_url LIKE '%ziccaservizi.it/wp-content%JBBG8378.jpg';

UPDATE zicca.projects SET image_url =
  'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/edificio-residenziale.jpg'
  WHERE image_url LIKE '%ziccaservizi.it/wp-content%/2021/01/31.jpg';

UPDATE zicca.projects SET image_url =
  'https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/referenze/cabina-trasformazione-genova.jpg'
  WHERE image_url LIKE '%ziccaservizi.it/wp-content%4-GENOVA-CT.jpg';
