# Media da ripristinare

La migrazione del codice è completa; i **file binari** (foto e video) non sono
stati trasferiti automaticamente perché l'ambiente di migrazione non ha accesso
di rete ai domini `lovable.app` / `ziccaservizi.it`.

## 1. Immagini segnaposto da sostituire

Sono presenti file segnaposto (rettangoli in tinta) con lo stesso nome e percorso
degli originali: basta sovrascriverli con i file veri, senza toccare il codice.

| Percorso | Originale |
| --- | --- |
| `public/logo-zicca.png` | logo Zicca Servizi (283×84) |
| `public/favicon.png` | favicon |
| `public/milano-united/logo.png` | logo Milano United |
| `src/assets/hero-industrial.jpg` | foto hero homepage |
| `src/assets/cta-bg.jpg` | sfondo sezione CTA |
| `src/assets/sector-electrical.jpg` | settore impianti tecnologici |
| `src/assets/sector-edile.jpg` | settore edile |
| `src/assets/sector-maintenance.jpg` | settore manutenzione |
| `src/assets/sector-design.jpg` | settore progettazione |
| `src/assets/team.jpg` | foto team |

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

## 3. Come recuperare i file originali

Tre strade, in ordine di comodità:

1. **Export GitHub da Lovable** — nell'editor Lovable: GitHub → Connect →
   push su un repository. Da lì i binari si copiano direttamente in questo repo.
2. **Download manuale** dall'editor Lovable / dal sito attuale
   `www.ziccaservizi.it` e commit in questo repository.
3. **Sblocco di rete** verso `lovable.app` nell'ambiente di migrazione, così da
   automatizzare il trasferimento.
