// Tras el build: genera dist/privacy/index.html y dist/terms/index.html (20/10, Marketing).
// Estructura completa para el público de la landing —agencias de EE. UU. y Canadá (CPRA de
// California, PIPEDA) y posibles agencias europeas (RGPD)— con HUECOS numerados (P-xx, T-xx) para
// los textos que pasa Marketing; la lista exacta está en ../_hostinger/TEXTOS-LEGALES.md.
// Lo que ya sabemos con certeza (campos del formulario, proveedores técnicos —Hostinger y Google; sin
// GHL desde el 20/10—, categorías de
// cookies del aviso) va escrito; lo legal, en hueco. Mientras haya huecos, las dos páginas van con
// noindex. Cuando lleguen los textos: sustituir cada hueco(...) por el párrafo y quitar el noindex.
//
// Cabecera común con la landing: Consent Mode v2 + GTM se copian del dist/index.html ya construido
// (una sola fuente) y el aviso es el mismo /cookies.js.
// Este archivo es igual en las dos landings salvo el bloque MARCA.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const MARCA = {
  nombre: 'Karaya Punta Cana',
  landing: 'Karaya Partners',
  sitio: (process.env.SITIO || 'https://karayatravelagents.com').replace(/\/$/, ''),
  web: 'https://karayapuntacana.com',
  email: 'sales@karayapuntacana.com',
  logo: 're:^imagotipo-horizontal-blanco-.*\.svg$',
  claveCookies: 'ky-cookies',
  colores: { fondo: '#061A4A', fondo2: '#0B2560', texto: '#F5F7FC', texto2: '#C2CDE6', acento: '#F8D011', sobreAcento: '#061A4A', borde: 'rgba(245,247,252,.14)' },
  // Campos del formulario «Start a Partnership Conversation» (src/secciones/Registro.tsx).
  campos: [
    'Full name',
    'Company name',
    'Business email',
    'Phone number (optional)',
    'Country',
    'Business type',
    'Areas of interest',
    'Your message (optional)',
    'The event brief you build in “Plan an event”, if you attach it',
    'Your consent and the date you gave it',
  ],
  hermana: 'Hispaniola Aquatic Adventures',
};

// Logo blanco horizontal: en Karaya es un asset con hash de Vite (src/assets/marca), se busca en dist.
const LOGO = MARCA.logo.startsWith('re:')
  ? '/assets/' + readdirSync('dist/assets').find((f) => new RegExp(MARCA.logo.slice(3)).test(f))
  : MARCA.logo;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hueco = (id, que) => `<div class="hueco" data-hueco="${id}"><b>${id} · Text pending from Marketing</b><span>${que}</span></div>`;

const base = readFileSync('dist/index.html', 'utf8');
const cabeceraGtm = base.match(/<!-- Consent Mode[\s\S]*?<!-- End Google Tag Manager -->/)?.[0];
const noscriptGtm = base.match(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/)?.[0];
if (!cabeceraGtm || !noscriptGtm) throw new Error('legales: no encuentro el bloque de Consent Mode + GTM en dist/index.html');

const c = MARCA.colores;
const css = `*{box-sizing:border-box}html{background:${c.fondo};color:${c.texto};-webkit-text-size-adjust:100%}
body{margin:0;font:16px/1.65 system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
a{color:${c.texto};text-decoration:underline;text-decoration-color:${c.acento};text-underline-offset:3px}
a:focus-visible,button:focus-visible{outline:3px solid ${c.acento};outline-offset:2px}
header,main,footer{width:min(100% - 40px,760px);margin-inline:auto}
header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px 0}
header img{height:40px;width:auto}
.volver{font-size:15px;font-weight:600;min-height:44px;display:inline-flex;align-items:center}
h1{font-size:clamp(32px,6vw,48px);line-height:1.1;margin:32px 0 8px}
h2{font-size:22px;line-height:1.25;margin:44px 0 10px;scroll-margin-top:24px}
h3{font-size:17px;margin:24px 0 6px}
p,li{color:${c.texto2}}strong{color:${c.texto}}
.meta{color:${c.texto2};font-size:15px;margin:0 0 24px}
.indice{margin:24px 0 8px;padding:16px 20px;border:1px solid ${c.borde};border-radius:16px}
.indice ol{margin:0;padding:0;list-style:none;columns:2 220px;column-gap:24px}.indice li{font-size:15px;line-height:1.5;padding:2px 0}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:15px}th,td{text-align:left;vertical-align:top;padding:10px 8px;border-bottom:1px solid ${c.borde}}th{color:${c.texto}}td{color:${c.texto2}}
.hueco{margin:12px 0;padding:12px 14px;border:1.5px dashed ${c.acento};border-radius:12px;background:rgba(248,208,17,.07);font-size:14.5px;line-height:1.5}
.hueco b{display:block;color:${c.acento};font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}.hueco span{color:${c.texto2}}
.boton{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;border:1px solid ${c.borde};background:none;color:${c.texto};font-family:inherit;font-size:15px;font-weight:600;line-height:1;cursor:pointer}
footer{display:flex;flex-wrap:wrap;gap:6px 22px;padding:40px 0 56px;margin-top:56px;border-top:1px solid ${c.borde};font-size:14px}
footer a,footer button{color:${c.texto2};background:none;border:0;font:inherit;padding:0;cursor:pointer;min-height:44px;display:inline-flex;align-items:center}
.ck{--ck-fondo:${c.fondo2}f5;--ck-texto:${c.texto};--ck-texto-2:${c.texto2};--ck-acento:${c.acento};--ck-sobre-acento:${c.sobreAcento}}`;

function pagina({ ruta, titulo, descripcion, secciones, otra }) {
  const url = `${MARCA.sitio}${ruta}`;
  const indice = secciones.map((s) => `<li><a href="#${s.id}">${esc(s.titulo)}</a></li>`).join('');
  const cuerpo = secciones.map((s) => `<h2 id="${s.id}">${esc(s.titulo)}</h2>\n${s.html}`).join('\n');
  const pendientes = (cuerpo.match(/data-hueco=/g) || []).length;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    ${cabeceraGtm}
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(titulo)} · ${esc(MARCA.landing)}</title>
    <meta name="description" content="${esc(descripcion)}" />
    <meta name="robots" content="${pendientes ? 'noindex, follow' : 'index, follow'}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(titulo)} · ${esc(MARCA.landing)}" />
    <meta name="theme-color" content="${c.fondo}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <style>${css}</style>
  </head>
  <body>
    ${noscriptGtm}
    <header>
      <a href="/" aria-label="${esc(MARCA.landing)} home"><img src="${LOGO}" alt="${esc(MARCA.nombre)}" height="40" /></a>
      <a class="volver" href="/">← Back to ${esc(MARCA.landing)}</a>
    </header>
    <main>
      <h1>${esc(titulo)}</h1>
      <p class="meta">Last updated: <span data-hueco-inline>[${secciones[0].fecha}]</span></p>
      ${hueco(secciones[0].fecha, 'Effective date of this version (month, day, year).')}
      <nav class="indice" aria-label="Contents"><ol>${indice}</ol></nav>
      ${cuerpo}
    </main>
    <footer>
      <span>© ${new Date().getFullYear()} ${esc(MARCA.nombre)}</span>
      <a href="${otra.ruta}">${esc(otra.titulo)}</a>
      <button type="button" data-cookies-abrir>Cookie settings</button>
      <a href="mailto:${MARCA.email}">${esc(MARCA.email)}</a>
    </footer>
    <script src="/cookies.js" data-clave="${MARCA.claveCookies}" data-privacidad="/privacy/" defer></script>
  </body>
</html>
`;
}

const lista = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join('')}</ul>`;

const privacidad = [
  {
    id: 'who-we-are',
    fecha: 'P-01',
    titulo: '1. Who we are',
    html: `<p>This policy explains how we handle personal information collected through ${esc(MARCA.sitio.replace('https://', ''))}, the partner website of ${esc(MARCA.nombre)} for travel agencies, tour operators, DMCs, wholesalers and wedding and event planners.</p>
${hueco('P-02', 'Legal name of the company responsible for the data (the “controller”), registered address, country and registration or tax number. If Karaya and Hispaniola are run by the same company or group, say so here.')}
<p>Contact for privacy questions: <a href="mailto:${MARCA.email}">${esc(MARCA.email)}</a>.</p>
${hueco('P-03', 'Dedicated privacy contact if different from the sales email (for example privacy@…), and the Data Protection Officer or EU representative under GDPR Art. 27, if one is appointed. If none, confirm that the email above is the contact.')}`,
  },
  {
    id: 'information-we-collect',
    titulo: '2. Information we collect',
    html: `<h3>What you give us in the partnership form</h3>${lista(MARCA.campos.map(esc))}
<p>This is business contact information about you as a representative of your company.</p>
<h3>What is collected automatically</h3>
<p>Technical data your browser sends (IP address, device and browser type, pages visited, the page that referred you and campaign parameters such as utm_source). Analytics and advertising cookies are only set if you accept them in the cookie notice; see <a href="#cookies">Cookies</a>.</p>
${hueco('P-04', 'Confirm the list above, and whether any other source of data applies (for example trade shows, referrals from partners or purchased lists). If not, we leave it as is.')}`,
  },
  {
    id: 'how-we-use-it',
    titulo: '3. How we use it and why',
    html: `<p>We use the information to reply to your partnership inquiry, assess and set up the collaboration, send you the partner material you ask for and keep a record of the conversation.</p>
${hueco('P-05', 'Purposes and legal basis for each one under GDPR Art. 6 (for example: replying to the inquiry — consent or steps before a contract; managing the partnership — contract; partner updates — consent; measuring the site — consent through the cookie notice; security and fraud prevention — legitimate interest). Also say whether you will send marketing emails and how to opt out.')}`,
  },
  {
    id: 'sharing',
    titulo: '4. Who we share it with',
    html: `<p>We do not sell your personal information. We share it only with service providers that help us run this website and our partner program, under contract and for these purposes:</p>
<table><thead><tr><th>Provider</th><th>What for</th></tr></thead><tbody>
<tr><td>Hostinger</td><td>Hosts this website and the database where the form is stored, and provides the email account that notifies our team of each inquiry</td></tr>
<tr><td>Google (Tag Manager and, if you accept them, analytics and advertising tags)</td><td>Measuring visits and campaigns</td></tr>
</tbody></table>
${hueco('P-06', `Confirm the providers above and add any other (CRM, email marketing tool, Meta pixel, LinkedIn Insight Tag, booking or accounting software…). Say whether data is shared with the sister brand ${esc(MARCA.hermana)} or other companies of the group, and with whom else (authorities, professional advisers).`)}
${hueco('P-07', 'California (CPRA): confirm the statement “We do not sell or share personal information for cross-context behavioral advertising”. If advertising tags are used with the cookie notice, the lawyer must say whether that counts as “sharing” and, if so, the text for the “Do Not Sell or Share My Personal Information” notice and whether the site must honor Global Privacy Control.')}`,
  },
  {
    id: 'transfers',
    titulo: '5. International transfers',
    html: hueco('P-08', 'Where the data is stored and processed (Dominican Republic, United States…) and, for visitors from the EU/EEA, UK or Canada, the safeguard used for transfers (for example the European Commission’s Standard Contractual Clauses or the EU-US Data Privacy Framework).'),
  },
  {
    id: 'retention',
    titulo: '6. How long we keep it',
    html: hueco('P-09', 'Retention period for each type of data: inquiries that do not become a partnership, active partners, and analytics data (for example: 24 months after the last contact).'),
  },
  {
    id: 'your-rights',
    titulo: '7. Your rights',
    html: `<p>Depending on where you live, you can ask us to access, correct or delete your personal information, to receive a copy of it, or to stop using it for a purpose. You can withdraw your consent at any time, without affecting what was done before. We will not treat you differently for using these rights.</p>
<h3>United States (including California)</h3>${hueco('P-10', 'CPRA rights text: right to know, delete, correct, opt out of sale or sharing and limit the use of sensitive information; how to make a request (email, and a toll-free number if required), how identity is verified, authorized agents, and the response time (45 days).')}
<h3>Canada</h3>${hueco('P-11', 'PIPEDA text: access and correction, how to file a complaint with the Office of the Privacy Commissioner of Canada; Quebec Law 25 if Quebec agencies are targeted.')}
<h3>European Union, EEA and United Kingdom</h3>${hueco('P-12', 'GDPR rights (access, rectification, erasure, restriction, portability, objection), the 1-month response time and the right to complain to the local data protection authority.')}
<p>To make a request, write to <a href="mailto:${MARCA.email}">${esc(MARCA.email)}</a>.</p>`,
  },
  {
    id: 'cookies',
    titulo: '8. Cookies',
    html: `<p>When you first visit, a notice lets you accept, reject or choose. Nothing beyond what the site needs to work is set until you decide, and you can change your choice at any time.</p>
<table><thead><tr><th>Category</th><th>What it does</th><th>Default</th></tr></thead><tbody>
<tr><td>Necessary</td><td>Remembers your cookie choice on this device (<code>${MARCA.claveCookies}</code>, browser storage)</td><td>Always on</td></tr>
<tr><td>Analytics</td><td>How the site is used, anonymised (Google Consent Mode: analytics_storage)</td><td>Off until you accept</td></tr>
<tr><td>Marketing</td><td>Measuring and personalising our ads (ad_storage, ad_user_data, ad_personalization)</td><td>Off until you accept</td></tr>
</tbody></table>
${hueco('P-13', 'List of the tags Marketing will install in Google Tag Manager (Google Analytics 4, Google Ads, Meta pixel, LinkedIn…), with the cookie names and how long each one lasts. We complete the table with it.')}
<p><button type="button" class="boton" data-cookies-abrir>Change cookie settings</button></p>`,
  },
  {
    id: 'security',
    titulo: '9. Security',
    html: `<p>The site is served over HTTPS and only the people who handle partner inquiries can access the stored inquiries and the notification inbox.</p>${hueco('P-14', 'Any other security measure you want to state (optional).')}`,
  },
  {
    id: 'children',
    titulo: '10. Children',
    html: `<p>This website is for businesses and is not directed to children. We do not knowingly collect information from anyone under 16.</p>`,
  },
  {
    id: 'changes',
    titulo: '11. Changes to this policy',
    html: `<p>If we change this policy, we will publish the new version on this page with its date.</p>`,
  },
];

const terminos = [
  {
    id: 'about',
    fecha: 'T-01',
    titulo: '1. About these terms',
    html: `<p>These terms govern your use of ${esc(MARCA.sitio.replace('https://', ''))}. By using the site you accept them.</p>
${hueco('T-02', 'Legal name, registered address and registration number of the company that operates the site (it can be the same as P-02).')}`,
  },
  {
    id: 'purpose',
    titulo: '2. What this site is for',
    html: `<p>This site gives travel trade partners information about ${esc(MARCA.nombre)} and lets them start a partnership conversation. Nothing is sold or booked on this site and no payment is taken here.</p>`,
  },
  {
    id: 'partnership',
    titulo: '3. Partnership inquiries',
    html: `<p>Sending the form does not create a partnership, a booking or any obligation for either side. Any collaboration, commission and event will be governed by a separate written agreement and by the conditions we send you.</p>
${hueco('T-03', 'Confirm the sentence above and, if there are standard partner terms, where they are or whether we should link them.')}`,
  },
  {
    id: 'information',
    titulo: '4. Information on the site',
    html: `<p>We keep the content accurate, but capacities, services, photos and conditions are for guidance and can change. The final terms of each event are those in its written quote.</p>`,
  },
  {
    id: 'intellectual-property',
    titulo: '5. Intellectual property',
    html: `<p>The brand, logos, photos, illustrations and texts on this site belong to ${esc(MARCA.nombre)} or are used with permission. Partners may use them only as we authorize in writing.</p>
${hueco('T-04', 'Confirm, or add the rules for using the brand and the sales kit in partners’ own materials.')}`,
  },
  {
    id: 'acceptable-use',
    titulo: '6. Acceptable use',
    html: `<p>Do not use the site for unlawful purposes, send false information through the form, or try to disrupt or gain unauthorized access to the site.</p>`,
  },
  {
    id: 'links',
    titulo: '7. Links to other sites',
    html: `<p>Links to other websites, including ${esc(MARCA.hermana)}, are provided for convenience; we are not responsible for their content.</p>`,
  },
  {
    id: 'liability',
    titulo: '8. Disclaimer and limitation of liability',
    html: hueco('T-05', 'Disclaimer and limitation of liability text from the lawyer.'),
  },
  {
    id: 'law',
    titulo: '9. Governing law and disputes',
    html: hueco('T-06', 'Governing law and the courts or arbitration that decide disputes (for example Dominican Republic law and the courts of …).'),
  },
  {
    id: 'contact',
    titulo: '10. Changes and contact',
    html: `<p>We may update these terms; the version on this page is the one that applies. Questions: <a href="mailto:${MARCA.email}">${esc(MARCA.email)}</a>.</p>`,
  },
];

const P = { ruta: '/privacy/', titulo: 'Privacy Policy' };
const T = { ruta: '/terms/', titulo: 'Terms of Use' };
mkdirSync('dist/privacy', { recursive: true });
mkdirSync('dist/terms', { recursive: true });
writeFileSync('dist/privacy/index.html', pagina({ ...P, descripcion: `How ${MARCA.nombre} handles the personal information of travel trade partners.`, secciones: privacidad, otra: T }));
writeFileSync('dist/terms/index.html', pagina({ ...T, descripcion: `Terms of use of the ${MARCA.landing} website.`, secciones: terminos, otra: P }));
console.log('legales: dist/privacy/ y dist/terms/');
