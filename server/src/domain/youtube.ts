const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

export interface ParsedYouTubeUrl {
  videoId: string;
  /** True when the link points at a YouTube Short (/shorts/…). */
  isShort: boolean;
  /** Canonical watch URL (what we hand to the video model). */
  canonicalUrl: string;
  thumbnailUrl: string;
}

const build = (videoId: string, isShort: boolean): ParsedYouTubeUrl => ({
  videoId,
  isShort,
  canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
});

/** Extracts the video ID from any common YouTube link format. Returns null for anything else. */
export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  const raw = input.trim();
  if (!raw) return null;
  if (VIDEO_ID.test(raw)) return build(raw, false);

  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;
  let isShort = false;

  if (host.endsWith('youtu.be')) {
    id = segments[0] ?? null;
  } else if (segments[0] === 'watch') {
    id = url.searchParams.get('v');
  } else if (segments[0] && ['shorts', 'embed', 'live', 'v', 'e'].includes(segments[0])) {
    id = segments[1] ?? null;
    isShort = segments[0] === 'shorts';
  } else if (segments.length === 0) {
    id = url.searchParams.get('v');
  }

  if (!id || !VIDEO_ID.test(id)) return null;
  return build(id, isShort);
}

export interface VideoMeta {
  title: string;
  channel: string | null;
  thumbnailUrl: string;
}

export type OEmbedResult =
  | { ok: true; meta: VideoMeta }
  | { ok: false; reason: 'not_found' | 'not_embeddable' | 'unreachable' };

export type OEmbedFetcher = (parsed: ParsedYouTubeUrl) => Promise<OEmbedResult>;

/**
 * Looks the video up via YouTube's public oEmbed endpoint (no API key). This also tells us whether the
 * owner allows embedding — the reel player embeds the official player, so non-embeddable videos are
 * rejected before any credits are spent.
 */
export const fetchOEmbed: OEmbedFetcher = async (parsed) => {
  const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(parsed.canonicalUrl)}`;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'not_embeddable' };
    if (res.status === 400 || res.status === 404) return { ok: false, reason: 'not_found' };
    if (!res.ok) return { ok: false, reason: 'unreachable' };
    const body = (await res.json()) as { title?: string; author_name?: string };
    return {
      ok: true,
      meta: {
        title: body.title?.trim() || 'YouTube recipe',
        channel: body.author_name?.trim() || null,
        thumbnailUrl: parsed.thumbnailUrl,
      },
    };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
};

/** Shorts are vertical and brief; anything a minute or less is treated the same way (narrated clips). */
export function isShortForm(parsed: ParsedYouTubeUrl, durationSec: number | null): boolean {
  return parsed.isShort || (durationSec !== null && durationSec > 0 && durationSec <= 60);
}
