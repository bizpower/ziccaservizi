# Media da ripristinare

## 1. Immagini: recuperate ✅

Tutte le immagini del progetto originale sono state trasferite e verificate
byte per byte (md5 identico all'originale Lovable):

| Percorso                            | Dimensioni     | Byte    | md5                              |
| ----------------------------------- | -------------- | ------- | -------------------------------- |
| `public/logo-zicca.png`             | PNG 283×84     | 25.756  | d74c9492e4049fa522585938baa3924d |
| `public/favicon.png`                | PNG 283×84     | 25.756  | d74c9492e4049fa522585938baa3924d |
| `public/milano-united/logo.png`     | PNG 640×640    | 344.356 | 0fac686073fd2468c6802df8718fd9f5 |
| `src/assets/hero-industrial.jpg`    | JPEG 1920×1080 | 245.896 | a4a0f3a395f5f1c446c248545851da02 |
| `src/assets/cta-bg.jpg`             | JPEG 1920×1080 | 298.871 | 43431d3dc0faa8e38aca5fe3d6ed02ac |
| `src/assets/sector-electrical.jpg`  | JPEG 1280×960  | 104.408 | 62b1847b3a03a4a141931cd325c660b9 |
| `src/assets/sector-edile.jpg`       | JPEG 1280×960  | 226.101 | 4a4a61393ce272054794c40c228235c9 |
| `src/assets/sector-maintenance.jpg` | JPEG 1280×960  | 112.390 | 110aee27a73f1108d60afa6c94314343 |
| `src/assets/sector-design.jpg`      | JPEG 1280×960  | 142.789 | ccff826c975e725ec58769b181a2b0a6 |
| `src/assets/team.jpg`               | JPEG 1600×1000 | 186.390 | d905036350c4dc39427ca11fa48cdc40 |

Restano da trasferire solo i **video** (punto 2).

## 2. Video: da trasferire

Gli 8 video (con i rispettivi poster) sono ancora solo nel progetto Lovable.
Non è stato possibile trasferirli automaticamente per due motivi:

- il workspace Lovable ha **esaurito i crediti** durante il trasferimento (le
  immagini erano già state recuperate), quindi non è più possibile far eseguire
  comandi all'agente Lovable;
- pesano complessivamente ~430 MB: non possono stare nel repository e vanno
  caricati su storage esterno.

| File                              | Dimensione | Poster |
| --------------------------------- | ---------- | ------ |
| `capo-ti-segue-web.mp4`           | 44,6 MB    | 227 KB |
| `ca-granda-spiegazione-web.mp4`   | 77,5 MB    | 477 KB |
| `qualche-modo-web.mp4`            | 26,9 MB    | 210 KB |
| `sgarro-web.mp4`                  | 19,8 MB    | 182 KB |
| `revamping-web.mp4`               | 78,7 MB    | 350 KB |
| `tata-parla.mp4` (Milano United)  | 50,6 MB    | 94 KB  |
| `challenge-2.mp4` (Milano United) | 37,9 MB    | 59 KB  |
| `vero-calcio.mp4` (Milano United) | 42,2 MB    | 105 KB |

### Attenzione al limite di 50 MB

Il piano Free di Supabase Storage accetta file fino a **50 MB**. Tre video lo
superano (`ca-granda-spiegazione-web.mp4`, `revamping-web.mp4` e, di poco,
`tata-parla.mp4`): vanno ricompressi prima dell'upload — cosa comunque
consigliabile per il web:

```bash
ffmpeg -i originale.mp4 -c:v libx264 -crf 28 -preset slow \
       -c:a aac -b:a 96k -movflags +faststart compresso.mp4
```

In alternativa si passa a un piano superiore o si usa un altro storage
(Cloudflare R2/Stream, Bunny).

### Upload nel bucket `zicca-media`

Il modo più semplice è dal dashboard Supabase → Storage → `zicca-media`,
creando la cartella `videos/` (e `videos/posters/` per le anteprime).

Da riga di comando servono i permessi di admin; in fase di migrazione era stata
usata una finestra temporanea con la chiave anon, aperta e richiusa con:

```sql
-- apertura (solo per il tempo dell'upload)
CREATE POLICY "Zicca temp migration upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'zicca-media' AND name LIKE 'videos/%');

-- chiusura (obbligatoria a upload finito)
DROP POLICY "Zicca temp migration upload" ON storage.objects;
```

```bash
BASE=https://mrbkuvbxqhwrtnhmpxum.supabase.co
KEY=<chiave anon del progetto>
curl -sS -X POST "$BASE/storage/v1/object/zicca-media/videos/sgarro-web.mp4" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: video/mp4" -H "x-upsert: true" \
  --data-binary @sgarro-web.mp4
```

### Compilare i manifest

Dopo l'upload va scritto l'URL pubblico nel campo `url` del manifest
corrispondente:

```
src/assets/videos/
  capo-ti-segue-web.mp4.asset.json          + capo-ti-segue-poster.jpg.asset.json
  ca-granda-spiegazione-web.mp4.asset.json  + ca-granda-spiegazione-poster.jpg.asset.json
  qualche-modo-web.mp4.asset.json           + qualche-modo-poster.jpg.asset.json
  sgarro-web.mp4.asset.json                 + sgarro-poster.jpg.asset.json
  revamping-web.mp4.asset.json              + revamping-poster.jpg.asset.json
src/assets/milano-united/
  tata-parla.mp4.asset.json                 + tata-parla-poster.jpg.asset.json
  challenge-2.mp4.asset.json                + challenge-2-poster.jpg.asset.json
  vero-calcio.mp4.asset.json                + vero-calcio-poster.jpg.asset.json
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
