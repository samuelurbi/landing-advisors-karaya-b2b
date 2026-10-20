// Tras `vite build`: completa dist/index.html para buscadores, redes y agentes que no ejecutan
// JavaScript (playbook pagespeed-seo-y-agentes-en-spa, mismo enfoque que la web de Karaya):
// - metas con URL ABSOLUTAS (canonical, og:url, og:image, twitter:image) sobre el dominio SITIO;
// - robots según INDEXAR (por defecto noindex hasta que Marketing apruebe);
// - JSON-LD Organization + WebPage (sin FAQPage: hay respuestas pendientes; sin Review/Offer);
// - dentro de #root, un resumen real en sr-only (H1, barco, velada, planificador, alianza,
//   enlaces) que React sustituye al montar; sin JS solo se ve el logo del preloader;
// - CSS en línea (el <link> bloqueaba el primer pintado);
// - robots.txt, sitemap.xml y llms.txt generados desde los mismos datos (src/data/contenido.ts).
// Variables: SITIO (por defecto https://landing-advisors-karaya-b2b.vercel.app), INDEXAR=1 al lanzar.
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const SITIO = (process.env.SITIO || 'https://karayatravelagents.com').replace(/\/$/, '');
const INDEXAR = process.env.INDEXAR === '1';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  // Solo carga datos: sin escaneo de dependencias (si no, avisa al cerrar el servidor a mitad).
  optimizeDeps: { noDiscovery: true, include: [] },
});
const c = await vite.ssrLoadModule('/src/data/contenido.ts');
await vite.close();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// `*palabra*` es solo el acento visual del copy.
const txt = (s) => String(s).replace(/\*/g, '');
const URL_PAGINA = `${SITIO}/`;
const IMAGEN = `${SITIO}/og-karaya-partners.jpg`;

const TITULO = 'Karaya Partners | Private events on the water in Punta Cana';
const DESCRIPCION =
  'For travel agencies, tour operators, DMCs and wedding and group planners: add weddings, celebrations and corporate events on Karaya, a private event catamaran in Punta Cana.';
const OG_TITULO = 'Karaya Partners · The celebration your clients fly to Punta Cana for';
const OG_DESCRIPCION =
  'Weddings, celebrations and corporate events on the water in Punta Cana. Tour the boat and start a partnership conversation.';

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      // La organización de esta landing vive en su dominio (Marketing, 20/10) y cuelga de la web
      // principal, karayapuntacana.com (no karayapartyboat.com).
      '@id': `${SITIO}/#organization`,
      name: 'Karaya Partners',
      url: `${SITIO}/`,
      logo: `${SITIO}/logo-karaya.svg`,
      email: c.marca.email,
      parentOrganization: { '@type': 'Organization', '@id': `${c.marca.web}/#organization`, name: c.marca.nombre, url: `${c.marca.web}/` },
      // Única red verificada en el código de la web de Karaya (contenido.ts: instagram).
      sameAs: ['https://www.instagram.com/karayapuntacana/'],
    },
    {
      '@type': 'WebPage',
      '@id': `${URL_PAGINA}#webpage`,
      url: URL_PAGINA,
      name: TITULO,
      description: DESCRIPCION,
      inLanguage: 'en',
      primaryImageOfPage: IMAGEN,
      publisher: { '@id': `${SITIO}/#organization` },
    },
  ],
};

const cabeza = [
  `<title>${esc(TITULO)}</title>`,
  `<meta name="description" content="${esc(DESCRIPCION)}" />`,
  `<meta name="robots" content="${INDEXAR ? 'index, follow' : 'noindex, nofollow'}" />`,
  `<link rel="canonical" href="${URL_PAGINA}" />`,
  `<meta property="og:url" content="${URL_PAGINA}" />`,
  `<meta property="og:title" content="${esc(OG_TITULO)}" />`,
  `<meta property="og:description" content="${esc(OG_DESCRIPCION)}" />`,
  `<meta property="og:image" content="${IMAGEN}" />`,
  `<meta property="og:image:alt" content="Karaya, the two-deck party catamaran, lit up at sunset in Punta Cana" />`,
  `<meta name="twitter:title" content="${esc(OG_TITULO)}" />`,
  `<meta name="twitter:description" content="${esc(OG_DESCRIPCION)}" />`,
  `<meta name="twitter:image" content="${IMAGEN}" />`,
  `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
].join('\n    ');

// Resumen estático: oculto a la vista (sr-only), presente para quien lee el HTML.
const lista = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const resumen = [
  `<p>${esc(c.hero.antetitulo)}</p>`,
  `<h1>${esc(txt(c.hero.h1))}</h1>`,
  `<p>${esc(c.hero.bajada)}</p>`,
  `<p>${esc(c.hero.publico)}</p>`,
  lista(c.hero.momentos.map((m) => esc(`${m.etiqueta}: ${m.linea}`))),
  `<p><a href="#join">${esc(c.cta.partner)}</a> · <a href="#the-boat">${esc(c.cta.barco)}</a></p>`,
  `<h2>${esc(txt(c.barco.titulo))}</h2><p>${esc(c.barco.intro)}</p>`,
  ...c.barco.zonas.map((z) => `<h3>${esc(z.nombre)}: ${esc(z.titular)}</h3><p>${esc(c.barco.capaCliente)}: ${esc(z.cliente)}</p><p>${esc(c.barco.capaNegocio)}: ${esc(z.negocio)}</p>`),
  `<h2>${esc(txt(c.velada.titulo))}</h2><p>${esc(c.velada.intro)}</p>`,
  `<ol>${c.velada.paradas.map((p) => `<li>${esc(p.titulo)}: ${esc(p.texto)} ${esc(p.socio)}</li>`).join('')}</ol>`,
  `<h2>${esc(txt(c.plan.titulo))}</h2><p>${esc(c.plan.intro)}</p>`,
  lista(c.plan.incluye.map(esc)),
  `<p>${esc(c.plan.nota)}</p>`,
  `<h2>${esc(txt(c.negocio.titulo))}</h2>`,
  ...c.negocio.items.map((i) => `<h3>${esc(i.titulo)}</h3><p>${esc(i.texto)}</p>`),
  `<h2>${esc(txt(c.puente.titulo))}</h2><p>${esc(c.puente.texto)}</p>`,
  ...c.puente.piezas.map((p) => `<h3>${esc(p.titulo)}</h3><p>${esc(p.etiqueta)}. ${esc(p.texto)}</p>`),
  `<p>${esc(txt(c.programa.frase))}</p>`,
  `<h2>${esc(txt(c.condiciones.titulo))}</h2><p>${esc(c.condiciones.intro)}</p>`,
  ...c.condiciones.bloques.map((b) => `<h3>${esc(b.titulo)}</h3>${lista(b.puntos.map(esc))}`),
  `<h2>${esc(txt(c.registro.titulo))}</h2><p>${esc(c.registro.texto)}</p>`,
  `<nav aria-label="Sections"><ul>${c.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}<li><a href="${c.marca.web}/">Main website</a></li></ul></nav>`,
  `<p>${esc(c.marca.lugar)} · <a href="mailto:${c.marca.email}">${esc(c.marca.email)}</a></p>`,
].join('');

const plantilla = readFileSync('dist/index.html', 'utf8');
// Solo sobre la salida limpia de `vite build` (si se relanza a mano, duplicaría el resumen).
if (plantilla.includes('data-prerender')) throw new Error('prerender: dist/index.html ya está procesado; ejecuta `npm run build`.');

// CSS en línea: una petición menos antes del primer pintado.
const enlaceCss = plantilla.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
const conCss = enlaceCss
  ? plantilla.replace(enlaceCss[0], `<style>${readFileSync('dist' + enlaceCss[1], 'utf8').replace(/<\/style/gi, '<\\/style')}</style>`)
  : plantilla;

// Quita lo que se redefine aquí (incluido el comentario del noindex del index.html fuente).
const base = conCss
  .replace(/<title>[\s\S]*?<\/title>\s*/, '')
  .replace(/<meta name="description"[^>]*>\s*/, '')
  .replace(/<!--[^>]*noindex[^>]*-->\s*/, '')
  .replace(/<meta name="robots"[^>]*>\s*/, '')
  .replace(/<!--[^>]*og:image[^>]*-->\s*/, '')
  .replace(/<meta property="og:(title|description|image)"[^>]*>\s*/g, '');

if (!base.includes('<div id="root">')) throw new Error('prerender: no encuentro #root en dist/index.html');
const html = base
  .replace('</head>', `    ${cabeza}\n  </head>`)
  .replace('<div id="root">', `<div id="root"><div class="sr-only" data-prerender>${resumen}</div>`);
writeFileSync('dist/index.html', html);

// robots.txt: cerrado hasta el lanzamiento (INDEXAR=1).
writeFileSync(
  'dist/robots.txt',
  INDEXAR ? `User-agent: *\nAllow: /\n\nSitemap: ${SITIO}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n\nSitemap: ${SITIO}/sitemap.xml\n`,
);

const hoy = new Date().toISOString().slice(0, 10);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${URL_PAGINA}</loc>
    <lastmod>${hoy}</lastmod>
  </url>
</urlset>
`,
);

// llms.txt (https://llmstxt.org): H1, cita y listas de enlaces.
writeFileSync(
  'dist/llms.txt',
  `# Karaya Partners

> Partner program of Karaya Punta Cana for travel agencies, tour operators, travel advisor networks, DMCs, wholesalers and wedding and group planners. Karaya is a private event catamaran on the Bávaro coast, Punta Cana (Dominican Republic), for destination weddings, celebrations and corporate events. Karaya offers a collaboration program for travel agencies and commercial partners. One partnership conversation covers Karaya and its sister brand, Hispaniola Aquatic Adventures.

- Every event is quoted to measure; nothing is charged online.
- To start a partnership conversation, use the form at ${URL_PAGINA}#join. A person reviews every inquiry.
- Contact: ${c.marca.email}.

## Sections

${c.nav.map((n) => `- [${n.label}](${URL_PAGINA}${n.href})`).join('\n')}
- [Start a partnership conversation](${URL_PAGINA}#join)

## Optional

- [Karaya main website](${c.marca.web}/)
`,
);

console.log(`prerender: index.html, robots.txt, sitemap.xml y llms.txt (${SITIO}, ${INDEXAR ? 'indexable' : 'noindex'})`);
