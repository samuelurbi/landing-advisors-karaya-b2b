# Karaya Partners

Landing for travel agencies, tour operators, DMCs and wedding and group planners: Karaya, a private
event catamaran in Punta Cana. Vite + React + TypeScript + Tailwind, with a three.js boat viewer.

## Run

```bash
npm install
npm run build   # typecheck + build + prerender + legal pages + api/reglas.json into dist/
npm run zip     # build for karayatravelagents.com and pack dist/ into ../_hostinger/karayatravelagents.com.zip
```

`npm run dev` starts the development server on http://localhost:5320 (the form is simulated: there is
no PHP in dev).

## Hosting (static site + PHP form handler)

The site is static and lives in `public_html` of the hosting account (Hostinger: LiteSpeed, PHP 8.3).
The partner form posts JSON to `/api/enviar.php`, shipped inside the build (`public/api/`):

- saves every submission in the `envios` table of a MySQL database (`servidor/schema.sql`, import it
  once in phpMyAdmin) and, if SMTP is configured, sends a notification email (PHPMailer, bundled in
  `api/lib/`, no Composer needed). The email is optional: without SMTP the submission is still stored
  (`correo = 0`) and counted as successful;
- anti-spam: honeypot field, minimum time on page and a per-IP limit stored as an HMAC (the IP is
  never stored in clear);
- server-side validation with the same rules as the browser (`api/reglas.json`, generated at build
  time from the form data);
- only if the row cannot be saved it answers an error and the page shows the WhatsApp fallback; the
  form only reports success when the server confirms the save.

**Secrets never go in this repository or in the zip.** Copy `servidor/config.example.php` to
`domains/karayatravelagents.com/config.php` (next to `public_html`, not inside it) and fill in the database and SMTP
credentials. `api/.htaccess` only allows `enviar.php` inside `/api` and disables listings.

## Environment variables (build time)

| Variable | Default | What it does |
|---|---|---|
| `SITIO` | `https://karayatravelagents.com` | Final domain, no trailing slash: canonical, `og:url`, `og:image`, sitemap and llms.txt |
| `INDEXAR` | empty (`noindex, nofollow` and `Disallow: /`) | `1` = indexable and robots open (`npm run zip` sets it) |
| `VITE_FORM_ENDPOINT` | `/api/enviar.php` in builds, simulated in dev | Where the form posts (JSON) |

