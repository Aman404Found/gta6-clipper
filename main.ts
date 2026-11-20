// gta6-clipper-01: entry program, Node 22, standard library only, no network.
//
// The thing that is graded is the YouTube video named in VIDEO.json; this
// program only has to put that file where the grader reads it. I keep the copy
// simple on purpose, but not silent: if VIDEO.json is missing, malformed or
// still holds the placeholder address, the program says so here instead of
// letting the intake check refuse the entry later.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'VIDEO.json');
const TARGET = join(OUTPUT_DIR, 'VIDEO.json');
const MAX_BYTES = 16_384;

// A YouTube video id is 11 characters; these are the address shapes the intake
// check reads (a Short, a watch link with or without extra parameters, or a
// youtu.be short link).
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const ADDRESS_SHAPES: Array<{ test: RegExp; id: (m: RegExpMatchArray) => string }> = [
  { test: /^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]+)\/?/, id: (m) => m[1] },
  { test: /^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]+)/, id: (m) => m[1] },
  { test: /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]+)\/?/, id: (m) => m[1] },
];

type VideoLink = { url?: unknown };

function readVideoUrl(): string {
  if (!existsSync(SOURCE)) {
    throw new Error(`VIDEO.json is not in ${BOT_DIR}`);
  }

  const raw = readFileSync(SOURCE, 'utf8');
  const bytes = Buffer.byteLength(raw, 'utf8');
  if (bytes > MAX_BYTES) {
    throw new Error(`VIDEO.json is ${bytes} bytes, over the ${MAX_BYTES}-byte cap`);
  }

  let parsed: VideoLink;
  try {
    parsed = JSON.parse(raw) as VideoLink;
  } catch {
    throw new Error('VIDEO.json is not valid JSON');
  }

  if (typeof parsed.url !== 'string' || parsed.url.length === 0) {
    throw new Error('VIDEO.json holds no url string');
  }
  return parsed.url;
}

function videoIdOf(url: string): string | null {
  for (const shape of ADDRESS_SHAPES) {
    const match = url.match(shape.test);
    if (match) {
      const id = shape.id(match);
      return YOUTUBE_ID.test(id) ? id : null;
    }
  }
  return null;
}

try {
  const url = readVideoUrl();
  const id = videoIdOf(url);
  if (id === null) {
    console.error(
      `VIDEO.json does not name a YouTube video: ${url}\n` +
        'expected https://www.youtube.com/shorts/<11-char id>, a /watch?v= address, or a youtu.be link',
    );
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(SOURCE, TARGET);
  console.log(`VIDEO.json published to ${TARGET}: video ${id}`);
} catch (err) {
  console.error(`main.ts stopped: ${(err as Error).message}`);
  process.exit(1);
}
