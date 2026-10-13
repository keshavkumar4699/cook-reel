import { Mp3Encoder } from '@breezystack/lamejs';

/** 16-bit PCM samples (interleaved when stereo). */
export interface PcmAudio {
  samples: Int16Array;
  sampleRate: number;
  channels: number;
}

export type DecodedSpeech = { kind: 'mp3'; bytes: Buffer } | { kind: 'pcm'; audio: PcmAudio };

function mimeParam(mimeType: string, name: string): string | null {
  const match = new RegExp(`(?:^|;)\\s*${name}=([^;]+)`, 'i').exec(mimeType);
  return match ? match[1]!.trim() : null;
}

function int16FromLittleEndian(bytes: Buffer): Int16Array {
  const samples = new Int16Array(Math.floor(bytes.length / 2));
  for (let i = 0; i < samples.length; i++) samples[i] = bytes.readInt16LE(i * 2);
  return samples;
}

/**
 * Reads a RIFF/WAVE file chunk by chunk. Only the `data` chunk's declared bytes are used, so trailing
 * chunks (provenance/watermark metadata some TTS models append) never become audible noise.
 */
export function parseWav(buffer: Buffer): PcmAudio {
  if (buffer.length < 12 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Not a WAV file');
  }
  let format: { code: number; channels: number; sampleRate: number; bits: number } | null = null;
  let data: Buffer | null = null;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    // Streaming writers leave the size as 0 or 0xFFFFFFFF: then the data runs to the end.
    const unknownSize = size === 0 || size === 0xffffffff;
    const end = unknownSize ? buffer.length : Math.min(start + size, buffer.length);
    if (id === 'fmt ' && end - start >= 16) {
      format = {
        code: buffer.readUInt16LE(start),
        channels: buffer.readUInt16LE(start + 2),
        sampleRate: buffer.readUInt32LE(start + 4),
        bits: buffer.readUInt16LE(start + 14),
      };
    } else if (id === 'data') {
      data = buffer.subarray(start, end);
      if (unknownSize) break;
    }
    if (unknownSize) break;
    offset = start + size + (size % 2); // chunks are word-aligned
  }
  if (!format || !data) throw new Error('WAV file has no fmt or data chunk');
  if ((format.code !== 1 && format.code !== 0xfffe) || format.bits !== 16) throw new Error(`Unsupported WAV encoding (${format.code}, ${format.bits}-bit)`);
  return { samples: int16FromLittleEndian(data), sampleRate: format.sampleRate, channels: format.channels || 1 };
}

/** Interprets synthesized speech by its MIME type. Raw L16/PCM from Gemini is little-endian, 24 kHz mono unless stated. */
export function decodeSpeechAudio(data: Buffer, mimeType: string): DecodedSpeech {
  const type = mimeType.split(';')[0]!.trim().toLowerCase();
  if (type === 'audio/mpeg' || type === 'audio/mp3') return { kind: 'mp3', bytes: data };
  if (type === 'audio/wav' || type === 'audio/x-wav' || type === 'audio/wave' || data.toString('ascii', 0, 4) === 'RIFF') {
    return { kind: 'pcm', audio: parseWav(data) };
  }
  if (type === 'audio/l16' || type === 'audio/pcm' || type === 'audio/raw' || type === 'audio/s16le') {
    const sampleRate = Number(mimeParam(mimeType, 'rate')) || 24_000;
    const channels = Number(mimeParam(mimeType, 'channels')) || 1;
    return { kind: 'pcm', audio: { samples: int16FromLittleEndian(data), sampleRate, channels } };
  }
  throw new Error(`Unsupported speech audio type: ${mimeType}`);
}

function toMono(audio: PcmAudio): PcmAudio {
  if (audio.channels === 1) return audio;
  const frames = Math.floor(audio.samples.length / audio.channels);
  const mono = new Int16Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < audio.channels; c++) sum += audio.samples[i * audio.channels + c]!;
    mono[i] = Math.round(sum / audio.channels);
  }
  return { samples: mono, sampleRate: audio.sampleRate, channels: 1 };
}

/**
 * Trims long leading/trailing silence (keeping a natural breath of padding) and fades the edges so
 * clips start and stop without clicks — small things that make synthesized speech feel less synthetic.
 */
export function polishSpeech(audio: PcmAudio, options: { threshold?: number; padMs?: number; fadeMs?: number } = {}): PcmAudio {
  const mono = toMono(audio);
  const { samples, sampleRate } = mono;
  const threshold = options.threshold ?? 350;
  const pad = Math.round(((options.padMs ?? 160) / 1000) * sampleRate);
  let first = 0;
  while (first < samples.length && Math.abs(samples[first]!) < threshold) first++;
  let last = samples.length - 1;
  while (last > first && Math.abs(samples[last]!) < threshold) last--;
  if (first >= samples.length) return { samples: new Int16Array(0), sampleRate, channels: 1 };
  const start = Math.max(0, first - pad);
  const end = Math.min(samples.length, last + 1 + pad);
  const out = samples.slice(start, end);
  const fade = Math.min(Math.round(((options.fadeMs ?? 8) / 1000) * sampleRate), Math.floor(out.length / 2));
  for (let i = 0; i < fade; i++) {
    const gain = i / fade;
    out[i] = Math.round(out[i]! * gain);
    out[out.length - 1 - i] = Math.round(out[out.length - 1 - i]! * gain);
  }
  return { samples: out, sampleRate, channels: 1 };
}

export function pcmDurationMs(audio: PcmAudio): number {
  return Math.round((audio.samples.length / audio.channels / audio.sampleRate) * 1000);
}

/** Speech-quality mono MP3 (48 kbps is transparent for a single voice and ~6 KB per second). */
export function encodeMp3(audio: PcmAudio, kbps = 48): Buffer {
  const mono = toMono(audio);
  const encoder = new Mp3Encoder(1, mono.sampleRate, kbps);
  const chunks: Buffer[] = [];
  const block = 1152 * 8;
  for (let i = 0; i < mono.samples.length; i += block) {
    const encoded = encoder.encodeBuffer(mono.samples.subarray(i, i + block));
    if (encoded.length) chunks.push(Buffer.from(encoded.buffer, encoded.byteOffset, encoded.length));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail.buffer, tail.byteOffset, tail.length));
  return Buffer.concat(chunks);
}

const MP3_BITRATES = {
  v1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  v2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const MP3_SAMPLE_RATES: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

/** Duration of an MPEG Layer III stream by walking its frame headers (skips an ID3v2 tag). 0 if it isn't MP3. */
export function mp3DurationMs(bytes: Buffer): number {
  let offset = 0;
  if (bytes.length > 10 && bytes.toString('ascii', 0, 3) === 'ID3') {
    offset = 10 + ((bytes[6]! & 0x7f) << 21) + ((bytes[7]! & 0x7f) << 14) + ((bytes[8]! & 0x7f) << 7) + (bytes[9]! & 0x7f);
  }
  let seconds = 0;
  let frames = 0;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1]! & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }
    const version = (bytes[offset + 1]! >> 3) & 0x03; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layer = (bytes[offset + 1]! >> 1) & 0x03; // 1 = Layer III
    const bitrateIndex = (bytes[offset + 2]! >> 4) & 0x0f;
    const rateIndex = (bytes[offset + 2]! >> 2) & 0x03;
    const padding = (bytes[offset + 2]! >> 1) & 0x01;
    const sampleRate = MP3_SAMPLE_RATES[version]?.[rateIndex];
    const kbps = (version === 3 ? MP3_BITRATES.v1 : MP3_BITRATES.v2)[bitrateIndex];
    if (version === 1 || layer !== 1 || !sampleRate || !kbps) {
      offset++;
      continue;
    }
    const samplesPerFrame = version === 3 ? 1152 : 576;
    const length = Math.floor(((samplesPerFrame / 8) * kbps * 1000) / sampleRate) + padding;
    seconds += samplesPerFrame / sampleRate;
    frames++;
    offset += Math.max(length, 1);
  }
  return frames ? Math.round(seconds * 1000) : 0;
}
