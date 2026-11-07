#!/usr/bin/env node
// Generates a fresh SECRET + BOOT, writes them to .dev.vars (local dev only),
// and prints your Telegram WEB Proxy share link.
//
// Usage:
//   node scripts/generate.mjs proxy.example.com
//   npm run generate -- proxy.example.com
//
// For production, do NOT commit .dev.vars. Put the same values into
// Cloudflare as encrypted secrets instead:
//   printf '%s' '<SECRET>' | npx wrangler secret put SECRET
//   printf '%s' '<BOOT>'   | npx wrangler secret put BOOT
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const host = (process.argv[2] || '').trim().toLowerCase();
if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) {
  console.error('Usage: node scripts/generate.mjs <hostname>   e.g. proxy.example.com');
  process.exit(1);
}

// dd-prefixed secret: the form Telegram Desktop accepts for WEB proxies.
// The same string is used as the Worker SECRET and inside the share link.
const secret = 'dd' + randomBytes(16).toString('hex'); // 34 chars total
const boot = randomBytes(24).toString('hex');          // 48 chars

writeFileSync('.dev.vars', `SECRET=${secret}\nBOOT=${boot}\n`);

console.log('');
console.log('SECRET = ' + secret);
console.log('BOOT   = ' + boot);
console.log('');
console.log('Saved to .dev.vars for local `wrangler dev` (git-ignored).');
console.log('For production, add both values as Cloudflare secrets (see README).');
console.log('');
console.log('Share link (open it inside a WEB-capable Telegram client):');
console.log(`https://t.me/webproxy?server=${host}&secret=${secret}`);
console.log(`tg://webproxy?server=${host}&secret=${secret}`);
console.log('');
console.log('Health check after deploy:  https://' + host + '/health   -> {"ok":true}');
