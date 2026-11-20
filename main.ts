import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve beside this entrypoint unless the harness supplies its repository root.
const root = process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'VIDEO.json');

function validateAddress(value: unknown): void {
  if (typeof value !== 'string') throw new Error('VIDEO.json needs a url string');
  if (value.length > 2048 || value.trim() !== value || /[\x00-\x20\x7f]/.test(value)) {
    throw new Error('VIDEO.json url must be at most 2048 characters with no whitespace or control characters');
  }
  let address: URL;
  try { address = new URL(value); }
  catch { throw new Error('VIDEO.json does not name a YouTube video address'); }
  const hosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
  let id: string | null = null;
  if (address.hostname === 'youtu.be') {
    id = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(address.pathname)?.[1] ?? null;
  } else if (hosts.has(address.hostname)) {
    if (address.pathname === '/watch') id = address.searchParams.get('v');
    else id = /^\/shorts\/([A-Za-z0-9_-]{11})\/?$/.exec(address.pathname)?.[1] ?? null;
  }
  if (address.protocol !== 'https:' || address.username || address.password ||
      address.port || !id || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
    throw new Error('VIDEO.json does not name a YouTube video address. Replace the placeholder with your public upload: HTTPS YouTube shorts, watch?v=, or youtu.be, with an 11-character video ID.');
  }
}

try {
  const bytes = readFileSync(resolve(root, 'VIDEO.json'));
  if (bytes.length > 16384) throw new Error('VIDEO.json exceeds 16384 bytes');
  const data: unknown = JSON.parse(bytes.toString('utf8'));
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('VIDEO.json must contain a JSON object');
  }
  validateAddress((data as { url?: unknown }).url);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, bytes);
} catch (failure) {
  console.error(`Entry failed: ${failure instanceof Error ? failure.message : String(failure)}`);
  process.exitCode = 1;
}
