# Notice & attribution

This project is a packaging/fork of **ToiCF/CF-Workers-TGProxy**
(commit `e565c57ff58656fd544755f67e1c266148c0b88f`), a single-file
Cloudflare Workers implementation of Telegram's WEB proxy (`td web-proxy`)
backend that relays WebSocket lanes to Telegram Web K's KWS endpoints
(`kws{dc}[-1].web.telegram.org/apiws`).

- Upstream: https://github.com/ToiCF/CF-Workers-TGProxy
- Protocol reference: https://github.com/telegramdesktop/tproxy-server
- License: GPL-3.0 (see `LICENSE`). This fork is distributed under the same license.

Changes in this fork:

1. A real **decoy (cover) page**: non-proxy requests serve a built-in static
   site, or the site configured with the optional `DECOY_URL` variable,
   instead of a bare placeholder page. Unknown non-API paths get the same
   treatment instead of a plain 404.
2. One-click deployment packaging: `wrangler.toml`, a *Deploy to Cloudflare*
   button flow, and dashboard / CLI setup guides (FA + EN).
3. `scripts/generate.mjs` to generate `SECRET`/`BOOT` and the share link.

The relay core (bridge capability check, session/lease handling, MTProto
transport obfuscation re-signing, KWS dialling) is upstream code, unchanged
except for the decoy routing described above.
