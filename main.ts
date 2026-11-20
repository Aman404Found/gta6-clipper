// gta6-clipper-01: entry program, Node 22, standard library only, no network.
//
// The thing that is graded is the YouTube video named in VIDEO.json; this
// program only has to put that file where the grader reads it. I keep the copy
// simple on purpose, but not silent: if VIDEO.json is missing or unreadable the
// program says which file and why, instead of dying with a bare stack trace.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'VIDEO.json');
const TARGET = join(OUTPUT_DIR, 'VIDEO.json');

if (!existsSync(SOURCE)) {
  console.error(`VIDEO.json is not in ${BOT_DIR}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

try {
  copyFileSync(SOURCE, TARGET);
} catch (err) {
  console.error(`VIDEO.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

console.log(`VIDEO.json published to ${TARGET}`);
