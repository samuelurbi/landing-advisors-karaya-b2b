// Zip estático para el Hostinger del cliente (20/10: las webs del grupo de Fernando salen de GHL
// y funcionan solo con su Hostinger). Construye con el dominio final, indexable y sin marcas de
// pendiente, con el formulario hacia /api/enviar.php (PHP en el propio zip: MySQL + SMTP; los
// secretos van en domains/<dominio>/config.php, fuera del zip), comprueba que no quede nada de
// Vibe ni de GHL y comprime dist/ (con .htaccess) en ../_hostinger/<dominio>.zip, con las rutas
// en la raíz del zip (se descomprime tal cual en public_html).
//
//   node scripts/zip-hostinger.mjs            (INDEXAR=0 para un zip de prueba con noindex)
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SITIO = 'https://karayatravelagents.com';
const DOMINIO = new URL(SITIO).hostname;
const SALIDA = resolve('..', '_hostinger');
const env = { ...process.env, SITIO, INDEXAR: process.env.INDEXAR ?? '1', VITE_OCULTAR_PENDIENTES: '1', VITE_FORM_ENDPOINT: '' };

console.log(`· build ${SITIO} (INDEXAR=${env.INDEXAR})`);
execSync('npm run build', { stdio: 'inherit', env });

// .htaccess (Apache/LiteSpeed de Hostinger): el dominio real, todo a https://<dominio> sin www; 404 de verdad (la
// página de 404.html, no la portada), caché larga para lo que lleva hash o es binario, HTML siempre
// fresco y sin listado de carpetas.
writeFileSync(
  'dist/.htaccess',
  `Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  # Solo con el dominio real: la vista previa (subdominio temporal de Hostinger, local) no salta.
  RewriteCond %{HTTP_HOST} ^(www\\.)?${DOMINIO.replace(/\./g, '\\.')}$ [NC]
  RewriteCond %{HTTPS} off [OR]
  RewriteCond %{HTTP_HOST} ^www\\. [NC]
  RewriteRule ^ https://${DOMINIO}%{REQUEST_URI} [L,R=301]
</IfModule>
AddType text/javascript .js .mjs
AddType image/avif .avif
AddType image/webp .webp
AddType model/gltf-binary .glb
AddType font/woff2 .woff2
<IfModule mod_headers.c>
  <FilesMatch "\\.(html)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  <FilesMatch "\\.(js|css|woff2|webp|avif|jpg|png|svg|glb|mp4|webm)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "^(cookies\\.js|robots\\.txt|sitemap\\.xml|llms\\.txt)$">
    Header set Cache-Control "public, max-age=3600"
  </FilesMatch>
</IfModule>
`,
);

// 404.html: misma cabecera (GTM + consentimiento) que las páginas legales, noindex.
const legal = readFileSync('dist/terms/index.html', 'utf8');
writeFileSync(
  'dist/404.html',
  legal
    .replace(/<title>[^<]*<\/title>/, '<title>Page not found</title>')
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
    .replace(/<link rel="canonical"[^>]*>\s*/, '')
    .replace(/<meta property="og:[^>]*>\s*/g, '')
    .replace(/<main>[\s\S]*<\/main>/, `<main><h1>Page not found</h1><p>The page you are looking for does not exist.</p><p><a href="/">Go to the home page</a></p></main>`),
);

// Comprobaciones: nada de Vibe ni de GHL, GTM correcto, formulario hacia /api/enviar.php.
const todos = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? todos(join(d, f)) : [join(d, f)]));
const textos = todos('dist').filter((f) => /\.(html|js|css|txt|xml)$/.test(f));
const buscar = (re) => textos.filter((f) => re.test(readFileSync(f, 'utf8')));
const fallos = [];
if (buscar(/__vibe|vibe-error|ludicrous\.cloud/i).length) fallos.push('quedan restos de Vibe: ' + buscar(/__vibe|vibe-error|ludicrous\.cloud/i).join(', '));
const html = readFileSync('dist/index.html', 'utf8');
if (!/GTM-TD5LQF68/.test(html)) fallos.push('falta GTM-TD5LQF68 en index.html');
if (/GTM-TDKHV7HF/.test(buscar(/GTM-/).map((f) => readFileSync(f, 'utf8')).join(''))) fallos.push('aparece el GTM de la web principal (GTM-TDKHV7HF)');
const ghl = buscar(/leadconnector|msgsndr|external-tracking|tk_[0-9a-f]{8}|locationId|ai_studio|projectId/i);
if (ghl.length) fallos.push('quedan restos de GHL: ' + ghl.join(', '));
if (!buscar(/\/api\/enviar\.php/).length) fallos.push('el formulario no envía a /api/enviar.php');
for (const f of ['api/enviar.php', 'api/.htaccess', 'api/reglas.json', 'api/lib/.htaccess', 'api/lib/PHPMailer/PHPMailer.php', 'api/lib/PHPMailer/SMTP.php', 'api/lib/PHPMailer/Exception.php'])
  if (!existsSync('dist/' + f)) fallos.push('falta dist/' + f);
if (todos('dist').some((f) => /config\.php$|\.env/.test(f))) fallos.push('hay un config.php o .env dentro de dist: los secretos no van en el zip');
if (!existsSync('dist/privacy/index.html') || !existsSync('dist/terms/index.html')) fallos.push('faltan /privacy/ o /terms/');
if (!html.includes(`<link rel="canonical" href="${SITIO}/"`)) fallos.push('canonical distinto de ' + SITIO);
if (fallos.length) {
  console.error('✗ ' + fallos.join('\n✗ '));
  process.exit(1);
}

mkdirSync(SALIDA, { recursive: true });
const zip = join(SALIDA, `${DOMINIO}.zip`);
rmSync(zip, { force: true });
// bsdtar de Windows (tar -a): rutas con «/», válidas en Linux (Compress-Archive de PS 5.1 mete «\»).
execFileSync(process.platform === 'win32' ? 'C:/Windows/System32/tar.exe' : 'tar', ['-a', '-c', '-f', zip, '-C', 'dist', ...readdirSync('dist')], { stdio: 'inherit' });
const mb = (statSync(zip).size / 1048576).toFixed(1);
console.log(`✓ ${zip} (${mb} MB, ${todos('dist').length} archivos)`);
