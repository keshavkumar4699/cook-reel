/** Web: clips live in memory as blob URLs for the session, least recently used first out. */
const MAX_CLIPS = 80;
const clips = new Map<string, string>();

export function cachedClip(key: string): string | null {
  const url = clips.get(key);
  if (!url) return null;
  clips.delete(key);
  clips.set(key, url);
  return url;
}

export function storeClip(key: string, bytes: Uint8Array<ArrayBuffer>): string {
  const existing = clips.get(key);
  if (existing) return existing;
  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
  clips.set(key, url);
  while (clips.size > MAX_CLIPS) {
    const [oldest, oldUrl] = clips.entries().next().value as [string, string];
    clips.delete(oldest);
    URL.revokeObjectURL(oldUrl);
  }
  return url;
}

export function discardClip(uri: string): void {
  for (const [key, url] of clips) {
    if (url !== uri) continue;
    clips.delete(key);
    URL.revokeObjectURL(url);
    return;
  }
}
