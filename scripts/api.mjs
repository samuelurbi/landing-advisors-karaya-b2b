// Tras el build: dist/api/reglas.json para /api/enviar.php (sitio, formulario, campos y su
// validación, y el texto exacto del consentimiento), sacado de los mismos datos que pinta el
// formulario (src/data/contenido.ts) para que cliente y servidor validen igual.
// El .htaccess de /api bloquea el acceso directo a este archivo.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] } });
const { registro: r } = await vite.ssrLoadModule('/src/data/contenido.ts');
await vite.close();

const reglas = {
  sitio: 'karayatravelagents',
  formulario: 'agentes',
  nombreWeb: 'Karaya Travel Agents (karayatravelagents.com)',
  idioma: 'en',
  minMs: 3000,
  consentimiento: `${r.campos.consentimiento} ${r.campos.politica}.`,
  politica: 'https://karayatravelagents.com/privacy/',
  // Mismo criterio que src/secciones/Registro.tsx.
  campos: {
    nombre: { etiqueta: 'Nombre', requerido: true, min: 2, max: 120 },
    empresa: { etiqueta: 'Empresa', requerido: true, max: 160 },
    email: { etiqueta: 'Email', tipo: 'email', requerido: true, max: 160 },
    telefono: { etiqueta: 'Teléfono / WhatsApp', max: 40 },
    pais: { etiqueta: 'País', tipo: 'opcion', requerido: true, opciones: r.paises },
    tipo: { etiqueta: 'Tipo de negocio', tipo: 'opcion', requerido: true, opciones: r.tipos },
    intereses: { etiqueta: 'Intereses', tipo: 'lista', opciones: r.intereses },
    mensaje: { etiqueta: 'Mensaje', max: 3000 },
    brief: { etiqueta: 'Resumen del evento (Plan an event)', max: 3000 },
  },
};
mkdirSync('dist/api', { recursive: true });
writeFileSync('dist/api/reglas.json', JSON.stringify(reglas, null, 2));
console.log('api: dist/api/reglas.json');
