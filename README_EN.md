# Telegram WEB Proxy on Cloudflare Workers

A personal Telegram proxy using the new **WEB Proxy** protocol — no VPS, on Cloudflare Workers' free plan.

Telegram (Desktop 7.1.1+) sends its MTProto traffic inside a hidden WebView over ordinary HTTPS (port 443) to your hostname. On the wire it looks like a normal website visit. This Worker relays the streams to Telegram Web K's official endpoints (`kws*.web.telegram.org`); the inner MTProto payload stays end-to-end encrypted and is never decrypted by the Worker.

## Read this first

- **Cloudflare risk:** using Workers as a proxy may be treated as abuse under Cloudflare's terms and can lead to throttling or account/Worker suspension, especially with high traffic or public sharing. This is for **personal, low-volume use only**.
- **Client support:** WEB Proxy works in Telegram Desktop 7.1.1+ and recent iOS builds; Android support is still experimental/limited. Classic MTProto is the safer choice on Android.
- **No voice/video calls** — WEB Proxy v1 does not relay UDP.
- **A custom domain is effectively required:** `workers.dev` is filtered on many networks. You need a domain whose DNS is on Cloudflare.
- You are responsible for your local laws and for Telegram's and Cloudflare's terms.

## One-click deploy

Fork this repo (or upload this folder to a new repo), then replace `mehrab1381pok/telegram-web-proxy-cloudflare` in the button URL:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mehrab1381pok/telegram-web-proxy-cloudflare)

Then:

1. **Generate secrets**
   ```bash
   openssl rand -hex 16   # prefix it with "dd" -> SECRET (34 chars)
   openssl rand -hex 24   # -> BOOT (48 chars)
   ```
   Add both in the Cloudflare dashboard under **Worker → Settings → Variables and Secrets** (type: Secret). Optionally add `DECOY_URL` (Text) pointing at a real website to use as the cover page.

2. **Attach your domain** — **Worker → Settings → Domains & Routes → Add → Custom domain**, e.g. `proxy.example.com`.

3. **Check and connect**
   ```text
   https://proxy.example.com/health   ->   {"ok":true}
   https://t.me/webproxy?server=proxy.example.com&secret=ddXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   Open the link inside a Telegram client, or add it manually under **Settings → Advanced → Connection type → Add proxy → WEB**.

Opening the hostname in a normal browser shows a **decoy page**, not a proxy — that is intentional. Requests without a valid bridge capability get the cover site (built-in, or `DECOY_URL` if set); protocol paths return 404 without a valid token.

## Manual / CLI install

- **Dashboard:** create a Worker, paste [`worker.js`](./worker.js), Deploy, then add the secrets and custom domain above.
- **CLI:**
  ```bash
  npm install
  npm run generate -- proxy.example.com
  npx wrangler secret put SECRET
  npx wrangler secret put BOOT
  npm run deploy
  ```

## Credits & license

GPL-3.0. Based on [ToiCF/CF-Workers-TGProxy](https://github.com/ToiCF/CF-Workers-TGProxy); protocol reference: [telegramdesktop/tproxy-server](https://github.com/telegramdesktop/tproxy-server). See [NOTICE.md](./NOTICE.md) for what this fork changed (decoy page, one-click packaging, generator script, docs).
