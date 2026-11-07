# Telegram WEB Proxy روی Cloudflare Workers

پروکسی شخصی تلگرام با پروتکل جدید **WEB Proxy** — بدون سرور، بدون VPS، روی پلن رایگان Cloudflare Workers.

[English version](./README_EN.md)

تلگرام (دسکتاپ ۷.۱.۱ به بعد) ترافیک MTProto را داخل یک WebView مخفی، روی HTTPS معمولی (پورت ۴۴۳) به دامنه‌ی شما می‌فرستد. از بیرون، اتصال دقیقاً شبیه بازدید از یک وب‌سایت عادی است. این Worker آن ترافیک را به ورودی رسمی Telegram Web K ‏(`kws*.web.telegram.org`) می‌رساند؛ payload داخلی MTProto سرتاسری رمزنگاری‌شده می‌ماند و Worker آن را نمی‌خواند.

```
Telegram Desktop / iOS ──HTTPS/WebSocket──▶ دامنه‌ی شما (Cloudflare Worker)
                                                  │
                                                  └──▶ kws{1..5}.web.telegram.org ──▶ Telegram
```

## ⚠️ قبل از نصب بخوانید

- **ریسک Cloudflare:** استفاده از Workers به‌عنوان پروکسی ممکن است از نظر Cloudflare سوءاستفاده تلقی شود و به محدودسازی یا تعلیق Worker/حساب منجر شود؛ مخصوصاً با ترافیک بالا یا اشتراک‌گذاری عمومی. این پروژه برای **استفاده‌ی شخصی و کم‌حجم** است، نه فروش یا انتشار عمومی.
- **محدودیت کلاینت:** WEB Proxy در Telegram Desktop ‏(۷.۱.۱+) و نسخه‌های جدید iOS پشتیبانی می‌شود؛ در اندروید هنوز آزمایشی/محدود است. برای اندروید، MTProto کلاسیک مطمئن‌تر است.
- **تماس صوتی/تصویری پشتیبانی نمی‌شود** (WEB Proxy نسخه ۱ ترافیک UDP را رد نمی‌کند).
- **دامنه‌ی شخصی تقریباً الزامی است:** آدرس `workers.dev` در خیلی از شبکه‌ها (از جمله ایران) فیلتر است. یک دامنه که DNS آن روی Cloudflare باشد لازم دارید.
- قوانین محل زندگی‌تان و شرایط استفاده‌ی Telegram و Cloudflare با خودتان است.

## نصب یک‌کلیکی (روش پیشنهادی)

> اول این رپو را در حساب GitHub خودتان Fork کنید (یا همین پوشه را در یک رپوی تازه آپلود کنید)، بعد در لینک زیر به‌جای `YOUR_GITHUB_USERNAME/YOUR_REPO` آدرس رپوی خودتان را بگذارید.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO)

بعد از کلیک، Cloudflare وارد حسابتان می‌شود، رپو را متصل می‌کند و Worker را می‌سازد. سپس فقط **۳ کار** می‌ماند:

### ۱) ساخت و ثبت دو سکرت

در ترمینال خودتان:

```bash
openssl rand -hex 16   # خروجی را بردارید و اولش dd بگذارید -> این می‌شود SECRET (۳۴ کاراکتر)
openssl rand -hex 24   # این می‌شود BOOT (۴۸ کاراکتر)
```

در داشبورد Cloudflare: ‏**Workers & Pages ← Worker شما ← Settings ← Variables and Secrets ← Add**:

| نام | نوع | مقدار |
|---|---|---|
| `SECRET` | Secret | `dd` + ۳۲ کاراکتر hex |
| `BOOT` | Secret | ۴۸ کاراکتر hex |
| `DECOY_URL` | Text (اختیاری) | آدرس یک سایت واقعی برای صفحه‌ی پوششی، مثل `https://example.com` |

### ۲) وصل‌کردن دامنه

**Worker ← Settings ← Domains & Routes ← Add ← Custom domain** و مثلاً `proxy.example.com` را وارد کنید. چند دقیقه صبر کنید تا وضعیت Active شود.

### ۳) تست و ساخت لینک اتصال

```text
https://proxy.example.com/health   ->   {"ok":true}
```

لینک پروکسی شما (همان SECRET مرحله‌ی ۱):

```text
https://t.me/webproxy?server=proxy.example.com&secret=ddXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

این لینک را داخل خودِ کلاینت تلگرام باز کنید (پیش‌نمایش وب t.me ممکن است این نوع لینک را نشان ندهد). یا دستی: **Settings ← Advanced ← Connection type ← Add proxy ← WEB** و Hostname و Secret را وارد کنید.

باز کردن خودِ دامنه در مرورگر عادی، یک **صفحه‌ی پوششی (Decoy)** نشان می‌دهد، نه پروکسی — این عمدی است.

## روش ۲: نصب دستی از داشبورد (بدون GitHub)

1. ‏Cloudflare Dashboard ← **Workers & Pages ← Create ← Worker** و یک Worker بسازید.
2. ‏**Edit code** و محتوای فایل [`worker.js`](./worker.js) را کامل جایگزین کنید، بعد **Deploy**.
3. سکرت‌های `SECRET` و `BOOT` و دامنه را مثل مراحل ۱ و ۲ بالا اضافه کنید.

## روش ۳: نصب با CLI

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
npm run generate -- proxy.example.com   # SECRET و BOOT و لینک را می‌سازد
npx wrangler secret put SECRET          # مقداری که ساخته شد را وارد کنید
npx wrangler secret put BOOT
npm run deploy
```

بعد دامنه را از داشبورد (مرحله‌ی ۲) وصل کنید.

## صفحه‌ی پوششی (Decoy Page)

- هر درخواستی که bridge معتبر نداشته باشد، مثل یک سایت عادی جواب می‌گیرد: مسیر `/` و بقیه‌ی مسیرهای غیر-API.
- بدون تنظیم خاص: یک سایت ثابتِ داخلی نمایش داده می‌شود.
- با `DECOY_URL`: محتوای همان سایت واقعی (با همان مسیر) نمایش داده می‌شود تا ظاهر دامنه کاملاً طبیعی باشد.
- مسیرهای پروتکل (`/api/v1/session`، ‏`/api/v1/ws`) بدون توکن معتبر 404 می‌گیرند و چیزی از پروکسی لو نمی‌دهند.

## چطور کار می‌کند؟ (خلاصه)

- کلاینت از روی `(SECRET, hostname)` یک capability با HMAC-SHA256 می‌سازد و صفحه‌ی bridge را از `/?bridge=…` می‌گیرد؛ خودِ سکرت روی شبکه فرستاده نمی‌شود.
- صفحه، یک session کوتاه‌مدت (۵ دقیقه) می‌گیرد و به‌ازای هر جریان تلگرام یک WebSocket lane جدا باز می‌کند.
- Worker فقط هدر ۶۴ بایتی obfuscation لایه‌ی انتقال MTProto را باز و با کلید تازه دوباره امضا می‌کند و جریان را به KWS رسمی تلگرام می‌رساند؛ نه مقصد را انتخاب می‌کند، نه payload را رمزگشایی.
- سقف‌ها: حداکثر ۱۲۸ lane هم‌زمان برای هر session.

جزئیات فنی و اعتبار پروژه‌ی بالادستی: [NOTICE.md](./NOTICE.md)

## لایسنس

GPL-3.0 — بر پایه‌ی پروژه‌ی متن‌باز [ToiCF/CF-Workers-TGProxy](https://github.com/ToiCF/CF-Workers-TGProxy) و پروتکل مرجع [telegramdesktop/tproxy-server](https://github.com/telegramdesktop/tproxy-server).
