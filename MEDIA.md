# Media del sito

## 1. Immagini: trasferite ✅

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

## 2. Video: trasferiti ✅

Tutti e 8 i video (con i rispettivi poster) sono stati trasferiti dal progetto
Lovable al bucket Supabase **`zicca-media`**, cartelle `videos/` e
`videos/posters/`. Sono file pubblici, serviti direttamente dallo storage: non
stanno nel repository e non pesano sul deploy.

| File                              | Byte su storage | Poster  | Note                     |
| --------------------------------- | --------------- | ------- | ------------------------ |
| `capo-ti-segue-web.mp4`           | 44.649.433      | 227.119 | originale                |
| `ca-granda-spiegazione-web.mp4`   | 17.888.745      | 476.521 | ricompresso (era 77,5 MB) |
| `qualche-modo-web.mp4`            | 26.924.277      | 209.887 | originale                |
| `sgarro-web.mp4`                  | 19.834.195      | 181.510 | originale                |
| `revamping-web.mp4`               | 23.250.512      | 349.512 | ricompresso (era 78,7 MB) |
| `tata-parla.mp4` (Milano United)  | 13.982.424      | 94.040  | ricompresso (era 50,6 MB) |
| `challenge-2.mp4` (Milano United) | 37.941.368      | 59.037  | originale                |
| `vero-calcio.mp4` (Milano United) | 42.223.902      | 105.119 | originale                |

Tre video superavano il limite di 50 MB del piano Supabase Free e sono stati
ricompressi per il web prima dell'upload:

```bash
ffmpeg -i originale.mp4 -c:v libx264 -crf 28 -preset slow \
       -c:a aac -b:a 96k -movflags +faststart compresso.mp4
```

Gli URL pubblici sono già scritti sia in `zicca.site_settings`
(chiavi `videos` e `videos_milano_united`, quelle che pilota il pannello admin)
sia nei manifest `src/assets/**/*.asset.json` usati come fallback.

## 3. Foto delle referenze: trasferite ✅

Le sei foto della gallery `/referenze` non erano asset del progetto Lovable:
già nel codice originale erano **link diretti al vecchio sito WordPress**
(`www.ziccaservizi.it/wp-content/...`). Poiché quel dominio verrà puntato su
questo sito, quegli indirizzi sarebbero smessi di rispondere e la gallery si
sarebbe svuotata.

Sono state scaricate dal sito ancora online e ricaricate nel bucket
`zicca-media`, cartella `referenze/`:

| File su Supabase                   | Byte    | md5 dell'originale               |
| ---------------------------------- | ------- | -------------------------------- |
| `cantiere-industriale.jpg`         | 654.959 | 99bf7a1374fe7f527d41f11bf461176a |
| `impianto-civile.jpg`              | 260.909 | f017d15598e52afc1431ef0f33d3ba0f |
| `quadri-elettrici.jpg`             | 54.496  | adf16f2740f96a1e98168f6bab84b735 |
| `impianto-produttivo.jpg`          | 388.563 | 45b87f64cddbcd177fa61be555b017f3 |
| `edificio-residenziale.jpg`        | 375.351 | 72b998edb8b44d13605bdf313f30ef73 |
| `cabina-trasformazione-genova.jpg` | 113.984 | 0ae294931d4312664c61cb164f723fb9 |

Sono fotografie di cantieri reali: sono state trasferite invariate, non
ricompresse. Gli indirizzi nuovi sono sia in `zicca.projects` sia nel fallback
di `src/routes/referenze.tsx`.

Il pannello `/admin` → Referenze continua a controllare gli indirizzi: se una
foto venisse reinserita puntando al vecchio sito, lo segnala invece di lasciare
che l'immagine si rompa in silenzio.

## 4. Come si gestiscono i video da qui in avanti

L'ordine con cui il sito sceglie cosa mostrare è:

1. `zicca.site_settings` → `videos` / `videos_milano_united` (pannello admin);
2. i manifest `.asset.json` presenti nel codice;
3. se nessuna delle due ha URL validi, la sezione video viene nascosta.

### Sostituire o aggiungere un video (via consigliata)

Da `/admin` → **Contenuti sito**, riquadri «Video della homepage» e «Video
Milano United»: per ogni video si inseriscono titolo e descrizione e si caricano
file e anteprima dal browser. I file finiscono in `zicca-media` e la lista viene
salvata in `zicca.site_settings`: non serve toccare il codice né rifare il
deploy.

Attenzione al limite di 50 MB per file del piano Supabase Free: per file più
grandi si ricomprime con il comando ffmpeg qui sopra, oppure si passa a un piano
superiore o a uno storage esterno (Cloudflare R2/Stream, Bunny).

### Alternativa: dashboard Supabase

Supabase → Storage → `zicca-media`, cartella `videos/` (e `videos/posters/` per
le anteprime), poi si incolla l'URL pubblico nel campo `url` del manifest
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

Formato del manifest:

```json
{
  "version": 1,
  "url": "https://mrbkuvbxqhwrtnhmpxum.supabase.co/storage/v1/object/public/zicca-media/videos/sgarro-web.mp4",
  "original_filename": "sgarro-web.mp4",
  "content_type": "video/mp4"
}
```

Questa strada richiede un commit e un nuovo deploy; il pannello admin no.
