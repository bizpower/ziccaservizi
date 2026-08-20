/**
 * I video del sito possono arrivare da due sorgenti:
 * - le chiavi `videos` / `videos_milano_united` di `zicca.site_settings`,
 *   gestite dal pannello admin (Contenuti sito), dove il cliente carica i file
 *   nel bucket `zicca-media`;
 * - i manifest `src/assets/**\/*.asset.json`, se contengono un URL.
 * Se nessuna delle due ha URL validi la sezione video non viene mostrata.
 */
export type VideoItem = {
  title: string;
  description: string;
  video: string;
  poster: string;
};

type SettingsVideo = {
  title?: unknown;
  description?: unknown;
  video_url?: unknown;
  poster_url?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Legge la lista video da una chiave di site_settings. */
export function videosFromSettings(value: unknown): VideoItem[] {
  if (!Array.isArray(value)) return [];
  return (value as SettingsVideo[])
    .map((v) => ({
      title: asString(v?.title),
      description: asString(v?.description),
      video: asString(v?.video_url),
      poster: asString(v?.poster_url),
    }))
    .filter((v) => v.video !== "");
}

/** Lista da mostrare: pannello admin se compilato, altrimenti i manifest. */
export function resolveVideos(settingsValue: unknown, fallback: VideoItem[]): VideoItem[] {
  const fromSettings = videosFromSettings(settingsValue);
  if (fromSettings.length > 0) return fromSettings;
  return fallback.filter((v) => Boolean(v.video));
}
