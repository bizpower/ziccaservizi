# Media da ripristinare

## 1. Immagini: recuperate ✅

Tutte le immagini del progetto originale sono state trasferite e verificate
byte per byte (md5 identico all'originale Lovable):

| Percorso | Dimensioni | Byte | md5 |
| --- | --- | --- | --- |
| `public/logo-zicca.png` | PNG 283×84 | 25.756 | d74c9492e4049fa522585938baa3924d |
| `public/favicon.png` | PNG 283×84 | 25.756 | d74c9492e4049fa522585938baa3924d |
| `public/milano-united/logo.png` | PNG 640×640 | 344.356 | 0fac686073fd2468c6802df8718fd9f5 |
| `src/assets/hero-industrial.jpg` | JPEG 1920×1080 | 245.896 | a4a0f3a395f5f1c446c248545851da02 |
| `src/assets/cta-bg.jpg` | JPEG 1920×1080 | 298.871 | 43431d3dc0faa8e38aca5fe3d6ed02ac |
| `src/assets/sector-electrical.jpg` | JPEG 1280×960 | 104.408 | 62b1847b3a03a4a141931cd325c660b9 |
| `src/assets/sector-edile.jpg` | JPEG 1280×960 | 226.101 | 4a4a61393ce272054794c40c228235c9 |
| `src/assets/sector-maintenance.jpg` | JPEG 1280×960 | 112.390 | 110aee27a73f1108d60afa6c94314343 |
| `src/assets/sector-design.jpg` | JPEG 1280×960 | 142.789 | ccff826c975e725ec58769b181a2b0a6 |
| `src/assets/team.jpg` | JPEG 1600×1000 | 186.390 | d905036350c4dc39427ca11fa48cdc40 |

Restano da trasferire solo i **video** (punto 2).

## 2. Video (hosting esterno)

I video sono grandi (19–78 MB l'uno, ~430 MB in totale): non vanno messi nel
repository né tra gli asset statici del Worker. Vanno caricati su storage
esterno — consigliato il bucket `zicca-media` di Supabase Storage, già creato dalle
migrazioni, oppure Cloudflare R2 / Stream.

Dopo l'upload va compilato il campo `url` del rispettivo manifest:

```
src/assets/videos/
  capo-ti-segue-web.mp4.asset.json          (44,6 MB)  + poster (227 KB)
  ca-granda-spiegazione-web.mp4.asset.json  (77,5 MB)  + poster (477 KB)
  qualche-modo-web.mp4.asset.json           (26,9 MB)  + poster (210 KB)
  sgarro-web.mp4.asset.json                 (19,8 MB)  + poster (182 KB)
  revamping-web.mp4.asset.json              (78,7 MB)  + poster (350 KB)
src/assets/milano-united/
  tata-parla.mp4.asset.json                 (50,6 MB)  + poster (94 KB)
  challenge-2.mp4.asset.json                (37,9 MB)  + poster (59 KB)
  vero-calcio.mp4.asset.json                (42,2 MB)  + poster (105 KB)
```

Esempio di manifest compilato:

```json
{
  "version": 1,
  "url": "https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/videos/sgarro-web.mp4",
  "original_filename": "sgarro-web.mp4",
  "size": 19834195,
  "content_type": "video/mp4"
}
```

Finché `url` resta vuoto le sezioni video (homepage e `/milano-united`) vengono
semplicemente nascoste: il sito resta corretto e navigabile.

## 3. Come recuperare i video originali

I file sono ancora nel progetto Lovable. Tre strade:

1. **Export GitHub da Lovable** — nell'editor Lovable: GitHub → Connect → push
   su un repository; da lì si caricano su Supabase Storage.
2. **Download manuale** dall'editor Lovable e upload nel bucket `zicca-media`
   (Supabase → Storage), poi compilare i manifest.
3. **Ricaricarli dal pannello admin**: `/admin` → Contenuti sito consente già
   l'upload del video hero; per i video delle gallery serve invece compilare i
   manifest `.asset.json`.

Nota tecnica sul perché non è stato automatizzato: l'ambiente di migrazione non
ha accesso di rete a `lovable.app`, `supabase.co` e `ziccaservizi.it` (policy di
egress), e i video pesano complessivamente ~430 MB, quindi non sono trasferibili
attraverso il canale usato per le immagini.
