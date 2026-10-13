const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

export interface ParsedVideo {
  videoId: string;
  isShort: boolean;
  url: string;
  thumbnailUrl: string;
}

/** Same rules as the server (server/src/domain/youtube.ts) for instant validation while typing. */
export function parseYouTubeUrl(input: string): ParsedVideo | null {
  const raw = input.trim();
  if (!raw) return null;
  const build = (videoId: string, isShort: boolean): ParsedVideo => ({
    videoId,
    isShort,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  });
  if (VIDEO_ID.test(raw)) return build(raw, false);

  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;
  let isShort = false;
  if (host.endsWith('youtu.be')) id = segments[0] ?? null;
  else if (segments[0] === 'watch' || segments.length === 0) id = url.searchParams.get('v');
  else if (segments[0] && ['shorts', 'embed', 'live', 'v', 'e'].includes(segments[0])) {
    id = segments[1] ?? null;
    isShort = segments[0] === 'shorts';
  }
  return id && VIDEO_ID.test(id) ? build(id, isShort) : null;
}

/** Finds a YouTube link inside shared text ("Check this out: https://youtu.be/…"). */
export function findYouTubeUrl(text: string): ParsedVideo | null {
  for (const token of text.split(/\s+/)) {
    const parsed = parseYouTubeUrl(token.replace(/[)>.,]+$/, ''));
    if (parsed) return parsed;
  }
  return null;
}

export interface VideoPreview {
  title: string;
  channel: string | null;
}

/** Public oEmbed lookup for the preview card (no API key needed). */
export async function fetchVideoPreview(video: ParsedVideo, signal?: AbortSignal): Promise<VideoPreview | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(video.url)}`, { signal });
    if (!res.ok) return null;
    const body = (await res.json()) as { title?: string; author_name?: string };
    return { title: body.title ?? 'YouTube video', channel: body.author_name ?? null };
  } catch {
    return null;
  }
}
