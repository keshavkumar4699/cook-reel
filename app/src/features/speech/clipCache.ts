import { Directory, File, Paths } from 'expo-file-system';

/*
 * Narration clips on disk, so a step heard once plays instantly (and offline) next time. Bounded:
 * the oldest clips go once the folder passes MAX_BYTES.
 */
const MAX_BYTES = 50 * 1024 * 1024;
const TRIM_TO = MAX_BYTES * 0.7;

let folder: Directory | null = null;
function dir(): Directory {
  if (!folder) {
    folder = new Directory(Paths.cache, 'speech');
    if (!folder.exists) folder.create({ intermediates: true, idempotent: true });
  }
  return folder;
}

export function cachedClip(key: string): string | null {
  try {
    const file = new File(dir(), `${key}.mp3`);
    return file.exists && file.size > 0 ? file.uri : null;
  } catch {
    return null;
  }
}

export function storeClip(key: string, bytes: Uint8Array<ArrayBuffer>): string {
  const file = new File(dir(), `${key}.mp3`);
  file.create({ overwrite: true });
  file.write(bytes);
  scheduleTrim();
  return file.uri;
}

/** Drops a clip that failed to play, so a damaged file isn't reused. */
export function discardClip(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // already gone
  }
}

let trimTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleTrim() {
  if (trimTimer) return;
  trimTimer = setTimeout(() => {
    trimTimer = null;
    trim();
  }, 5000);
}

function trim() {
  try {
    const files = dir()
      .list()
      .filter((entry): entry is File => entry instanceof File);
    let total = files.reduce((sum, file) => sum + (file.size ?? 0), 0);
    if (total <= MAX_BYTES) return;
    files.sort((a, b) => (a.modificationTime ?? 0) - (b.modificationTime ?? 0));
    for (const file of files) {
      if (total <= TRIM_TO) break;
      total -= file.size ?? 0;
      file.delete();
    }
  } catch {
    // trimming is best effort
  }
}
