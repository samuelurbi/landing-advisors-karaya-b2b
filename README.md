# Karaya Partners

Landing for travel agencies, tour operators, DMCs and wedding and group planners: Karaya, a private
event catamaran in Punta Cana. Vite + React + TypeScript + Tailwind, with a three.js boat viewer.

## Run

```bash
npm install
npm run build   # typecheck + build + prerender into dist/
npm start       # serves dist/ on $PORT (3000 by default)
```

`npm run dev` starts the development server on http://localhost:5320.

## Hosting (Node.js web app)

- Framework: Express · Entry file: `server.js` · Build command: `npm run build` · Node.js 22.
- `server.js` serves the built `dist/` folder on the `PORT` given by the host.

## Environment variables (build time)

| Variable | Default | What it does |
|---|---|---|
| `SITIO` | `https://landing-advisors-karaya-b2b.vercel.app` | Final domain, no trailing slash: canonical, `og:url`, `og:image`, sitemap and llms.txt |
| `INDEXAR` | empty (`noindex, nofollow` and `Disallow: /`) | `1` = indexable and robots open. Only on launch day |
| `VITE_FORM_ENDPOINT` | empty (the form simulates success) | URL that receives the partner form (POST JSON) |
