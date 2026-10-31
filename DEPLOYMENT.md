# Deployment, performance and security runbook

How to put the Adnik Infra site live without losing the speed and security it already has.
Read [ARCHITECTURE.md](ARCHITECTURE.md) for why things are built the way they are.

**Stack:** Next.js 16 (App Router), React 19, Node.js 22+. This is not a PHP/WordPress site:
`.htaccess` files and shared PHP hosting cannot run it. Host it on **Vercel**, or on a
**VPS** (Hostinger VPS, DigitalOcean, AWS Lightsail/EC2) behind Nginx, ideally with
**Cloudflare** in front.

---

## 1. Prioritised checklist

### High: before launch

| # | Action | How |
|---|---|---|
| 1 | Turn on email delivery of enquiries | Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (§3). Submit the contact form and check the email arrives at support@adnikinfra.com. |
| 2 | Set the real domain and allow indexing | `SITE_URL=https://adnikinfra.com`, `SITE_INDEXABLE=true` (production only, never on previews). |
| 3 | Enforce the Content Security Policy | Run a few days with the default `CSP_MODE=report-only`, check the server logs for `[csp]` reports, then set `CSP_MODE=enforce`. |
| 4 | HTTPS, redirect and real client IP | Use the Nginx block in §4 or Vercel. The app rate-limits on `X-Forwarded-For`, so the proxy must **overwrite** it. |
| 5 | Replace sample content | Projects, prices, photos (`src/content/`), and the phone, address and RERA number in `src/config/site.ts`. The footer shows a sample-content notice until then. |

### Medium: first week

| # | Action | How |
|---|---|---|
| 6 | Cloudflare in front of the origin | §5: WAF managed rules, a POST rate limit, Brotli, HTTP/3. |
| 7 | Security contact | `SECURITY_CONTACT=mailto:support@adnikinfra.com` publishes `/.well-known/security.txt`. |
| 8 | HSTS preload | The site already sends `max-age=2y; includeSubDomains; preload`. Submit at hstspreload.org **only once every subdomain serves HTTPS**. |
| 9 | Search | Add the site to Google Search Console, submit `/sitemap.xml`, and use `public/brand/adnik-infra-logo-512.png` as the Google Business Profile logo. |

### Low: ongoing

| # | Action |
|---|---|
| 10 | Watch Core Web Vitals (field data) in Search Console → Experience. |
| 11 | Keep dependencies patched: `npm outdated`, `npm audit --omit=dev`. Pin exact versions, as the repo already does. |
| 12 | Re-run the verification in §6 after every deploy. |

---

## 2. What is already in place

**Speed (lab, mobile, Lighthouse-style throttling: slow 4G, CPU ×4)**

| Page | LCP | CLS | TBT | Transfer |
|---|---|---|---|---|
| Home | 1.28 s | 0 | 280–380 ms | 316 KB |
| Project detail | 1.06 s | 0 | 156 ms | 362 KB |
| Listings | 0.73 s | 0 | 123 ms | 348 KB |

Targets are LCP under 2.5 s, CLS under 0.1, TBT under 200 ms and INP under 200 ms. Home TBT
is React hydrating the page on a throttled CPU. Real mid-range phones usually do better, so
check the field data before optimising further.

- **Images:** `next/image` serves AVIF, then WebP, then JPEG, sized for each screen. Photos
  below the fold lazy-load. The hero photo is `fetchPriority="high"` and is the LCP element.
- **Fonts:** self-hosted through `next/font`, so there is no request to Google. They use
  `font-display: swap` and the latin subset, and the two latin files are preloaded. The ₹ sign
  comes from 1 KB custom subsets instead of two latin-ext files, saving 107 KB per page.
- **JS/CSS:** Server Components by default, so only interactive parts ship JavaScript. CSS
  Modules are minified and split per route. There are no third-party scripts, so there is
  nothing to preconnect to.
- **Caching:** hashed assets under `/_next/static` get `public, max-age=31536000, immutable`.
  HTML is never cached, because each page carries a per-request CSP nonce.
- **Compression:** Next gzips HTML, about 188 KB down to 42 KB on the home page. Cloudflare
  adds Brotli at the edge.

**Security**

- **Headers** (`src/security/headers.ts`, `src/proxy.ts`): nonce-based CSP with
  `strict-dynamic`, HSTS (2 years, preload), `X-Frame-Options: DENY` with
  `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP and CORP.
  There is no `X-Powered-By` header.
- **XSS:** React escapes all output. JSON-LD is serialised safely, and visitor input in lead
  emails is HTML-escaped. The CSP blocks any injected script that lacks the nonce.
- **CSRF:** forms are Server Actions, which accept only POST requests whose `Origin` matches
  the host. The site sets no session cookies, so there is nothing for a forged request to ride on.
- **Clickjacking:** the page can't be framed, through either `frame-ancestors 'none'` or
  `X-Frame-Options`.
- **Injection:** there is no database. Every input is NFKC-normalised and validated against
  Zod allowlists on the server. Mail headers strip CR/LF characters, and addresses are passed
  as objects. If you add a CRM or database later, use its SDK or parameterised queries, never
  string-built SQL.
- **Abuse:** each form has a honeypot field, a per-client limit of 5 per 10 minutes, a global
  ceiling, and a 64 KB body limit.
- **Cookies:** the site sets none. If you add any, use the `__Host-` prefix, `Secure`,
  `HttpOnly` and `SameSite=Lax`.

---

## 3. Environment variables

Copy `.env.example` to `.env.local` for local development. In production, use the host's
secret store: Vercel → Settings → Environment Variables (mark `SMTP_PASS` as Sensitive), or a
`chmod 600` env file on a VPS. **Never commit real values.** Every `.env*` file except the
example is git-ignored.

```bash
SITE_URL=https://adnikinfra.com
SITE_INDEXABLE=true
CSP_MODE=enforce                      # after the report-only window
SECURITY_CONTACT=mailto:support@adnikinfra.com

# Google Workspace / Gmail SMTP. The password is a 16-character App Password
# (Google Account → Security → 2-Step Verification → App passwords), not the login password.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=support@adnikinfra.com
SMTP_PASS=xxxxxxxxxxxxxxxx
LEADS_TO=support@adnikinfra.com
```

The app validates all of these at startup and refuses to boot with a clear message if any are
wrong. With no SMTP configured, production shows "enquiries unavailable" rather than faking
success.

---

## 3a. Marketplace, admin panel and subscribers

Until these keys are set the marketplace pages say "not available" and the subscribe form says
so honestly; the rest of the site is unaffected. Email needs the SMTP settings from §3.

1. **Supabase:** create a project, open SQL editor, run `supabase/migrations/0001_marketplace.sql`
   once. Copy the project URL and the **service-role** key (server-only) from Settings → API.
2. **Cloudinary:** copy the cloud name, API key and API secret from Settings → API Keys.
3. **Signing secret:** `openssl rand -base64 48`.
4. Add to the host's environment variables, then redeploy:

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=…
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
SIGNING_SECRET=…
```

5. **First admin** (run once from your computer; further admins are added at `/admin/team`):

```bash
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ADMIN_PASSWORD='12+ characters' \
  node scripts/create-admin.mjs "Your Name" you@adnikinfra.com
```

6. Sign in at `/admin/login`. Submit a test listing at `/marketplace/sell` and walk it through:
   confirm the email → admin email arrives → approve → it appears at `/marketplace`.

**How a listing moves:** seller submits (hidden) → seller confirms by email → admins are emailed →
an admin approves (live, seller emailed) or rejects with a reason (hidden, seller emailed).

**Limits to know:** campaigns send over SMTP, so Gmail allows about 500 emails a day and Workspace
about 2,000; a longer list needs a bulk mail service. On Vercel, a long campaign can outlive the
function's time limit: a VPS has no such limit. Rate limits are per server process (see §5).

Local trial without any accounts: `MARKETPLACE_MODE=memory LEADS_MODE=log
MARKETPLACE_DEV_ADMIN_PASSWORD=local-admin-password npm run dev`. Data is lost on restart, and
emails appear at `/api/dev/outbox`. Sign in as `admin@example.com`.

---

## 4. VPS: Node + Nginx

### 4.1 Build and run

```bash
# Node 22 LTS, then:
git clone <repo> /var/www/adnik-infra && cd /var/www/adnik-infra
npm ci && npm run build
```

`/etc/systemd/system/adnik-infra.service`:

```ini
[Unit]
Description=Adnik Infra website
After=network.target

[Service]
User=adnik
WorkingDirectory=/var/www/adnik-infra
# chmod 600, owned by root: holds SMTP_PASS and the other variables from §3.
EnvironmentFile=/etc/adnik-infra.env
# Bind to localhost only: the public port belongs to Nginx.
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000 -H 127.0.0.1
Restart=on-failure
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/var/www/adnik-infra/.next/cache

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now adnik-infra
```

### 4.2 Nginx

`/etc/nginx/sites-available/adnik-infra.conf` (certificates from
`certbot --nginx -d adnikinfra.com -d www.adnikinfra.com`):

```nginx
upstream adnik_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Rate-limit form submissions (POSTs) only; page views are never throttled.
map $request_method $form_client {
    POST    $binary_remote_addr;
    default "";
}
limit_req_zone $form_client zone=forms:10m rate=10r/m;

server {
    listen 80;
    listen [::]:80;
    server_name adnikinfra.com www.adnikinfra.com;
    return 301 https://adnikinfra.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.adnikinfra.com;
    ssl_certificate     /etc/letsencrypt/live/adnikinfra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adnikinfra.com/privkey.pem;
    return 301 https://adnikinfra.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name adnikinfra.com;

    ssl_certificate     /etc/letsencrypt/live/adnikinfra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adnikinfra.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    server_tokens off;
    client_max_body_size 128k;          # matches proxyClientMaxBodySize in next.config.ts
    client_body_timeout 10s;
    client_header_timeout 10s;
    keepalive_timeout 30s;

    # Behind Cloudflare only: trust its edge for the client IP (see §5).
    # include /etc/nginx/snippets/cloudflare-real-ip.conf;

    # Security headers, compression and cache headers come from the app. Do not add them here:
    # a second CSP or HSTS header would be combined with, or conflict with, the app's.

    location / {
        limit_req zone=forms burst=5 nodelay;
        limit_req_status 429;

        proxy_pass http://adnik_app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        # Overwrite, never append: the app's rate limiter trusts the first entry.
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/adnik-infra.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Firewall:** `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`.
Port 3000 stays closed.

---

## 5. Cloudflare (recommended in front of either host)

**DNS:** proxy (orange cloud) both `adnikinfra.com` and `www`. Leave the Google Workspace
MX/TXT records unproxied (they always are).

| Area | Setting |
|---|---|
| SSL/TLS | **Full (strict)**, minimum TLS 1.2, TLS 1.3 on, Always Use HTTPS on |
| Edge HSTS | Leave **off**: the origin already sends it, and two policies can disagree |
| Speed | Brotli on (automatic), HTTP/3 on, Early Hints on, **0-RTT off** (replayable POSTs) |
| Caching | Cache rule: path starts with `/_next/static/` → eligible for cache, respect origin TTL. **Never** "Cache Everything" on HTML: each page has a one-time CSP nonce. |
| Security | WAF managed ruleset on, Bot Fight Mode on, Browser Integrity Check on |
| Rate limit | Rule: `http.request.method eq "POST"` → 10 requests / 1 min per IP → block for 10 min |
| Methods | Custom rule: block when `not http.request.method in {"GET" "HEAD" "POST" "OPTIONS"}` |
| **Turn off** | **Rocket Loader** (rewrites scripts and breaks the nonce CSP) and **Email Address Obfuscation** (injects a script the CSP blocks). Auto Minify is unnecessary: Next already minifies. |

**Real client IP at the origin:** when Cloudflare proxies traffic, Nginx sees Cloudflare's
address. Generate the trusted-range file from Cloudflare's published list, then enable the
`include` line in §4.2:

```bash
{ for ip in $(curl -s https://www.cloudflare.com/ips-v4) $(curl -s https://www.cloudflare.com/ips-v6); do
    echo "set_real_ip_from $ip;"; done
  echo "real_ip_header CF-Connecting-IP;"; } | sudo tee /etc/nginx/snippets/cloudflare-real-ip.conf
```

Re-run it every few months, because Cloudflare occasionally adds ranges. For the strictest
setup, also allow ports 80/443 only from those ranges in `ufw`, so nobody can bypass
Cloudflare.

**Vercel instead of a VPS:** no Nginx or systemd needed. HTTPS, HTTP/2/3, Brotli and the real
client IP are handled. Add the environment variables from §3. The in-memory rate limiter is
per serverless instance, so add a Vercel Firewall rate-limit rule (POST, 10/min per IP) or put
Cloudflare in front.

---

## 6. Verify (before and after each deploy)

```bash
npm run check                  # types, lint, unit tests
npm run build
npm run test:e2e               # browser tests: axe accessibility, security, SEO, marketplace flow, 11 screen sizes
BASE_URL=https://adnikinfra.com node scripts/check-headers.mjs   # live headers, CSP nonce, report endpoint

curl -sI https://adnikinfra.com | grep -iE "strict-transport|content-security|x-frame|referrer"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://adnikinfra.com      # expect 301 → https
curl -sI https://adnikinfra.com/_next/static/<any file> | grep -i cache-control     # expect immutable
```

External checks:
- **Speed:** pagespeed.web.dev (mobile), webpagetest.org
- **Headers:** securityheaders.com (target A+) and developer.mozilla.org/en-US/observatory
- **TLS:** ssllabs.com/ssltest (target A+)
- **SEO:** search.google.com/test/rich-results (Organization, RealEstateListing, FAQ,
  Breadcrumbs) and Search Console → URL inspection
- **Email:** submit the contact form and confirm the message at support@adnikinfra.com. A
  failure is logged as `[lead] email delivery failed {code, responseCode}`, with no personal
  data in the log.
