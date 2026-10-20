// Medición para las campañas: todo al dataLayer de GTM-TD5LQF68 (index.html). Mismo patrón que
// Hispaniola: 14 eventos, cada uno con `device` y `language`; parámetros en inglés. El país solo se
// conoce al enviar el formulario (form_submit_success). Nombre y email nunca van a analítica.
export type Evento =
  | 'section_view' // { section }: secciones con id, y cada zona-<id> del barco y luz-<id> de la velada
  | 'reached_partnership_section'
  | 'partner_cta_click' // { location }: CTA que lleva al formulario (#join)
  | 'nav_cta_click' // { location, destination }: CTA a otra sección
  | 'form_start'
  | 'form_error' // { fields }
  | 'form_submit_success' // { business_type, country, interests, brief }
  | 'moment_select' // { moment, source }
  | 'boat_point_view' // { zone }
  | 'boat_tour_play'
  | 'evening_light' // { light, source }
  | 'planner_change' // { field, value }
  | 'planner_send' // { event_type, guests, format, month, hispaniola }
  | 'terms_open';

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function emitir(evento: Evento, params: Params = {}) {
  const device = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
  const payload = { event: evento, device, language: navigator.language, ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (import.meta.env.DEV) console.debug('[evento]', payload);
}

// section_view una sola vez por id en la visita (las zonas y luces pueden volver a elegirse).
const vistas = new Set<string>();
export function vistaSeccion(section: string) {
  if (vistas.has(section)) return;
  vistas.add(section);
  emitir('section_view', { section });
  if (section === 'partnership') emitir('reached_partnership_section');
}

/** section_view de cada <section id> de <main> cuando entra en el 60 % superior de la pantalla
 *  (con margen y no con umbral de área: algunas secciones miden varias pantallas). */
export function vigilarSecciones() {
  if (!('IntersectionObserver' in window)) return () => {};
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        vistaSeccion((e.target as HTMLElement).id);
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -40% 0px' },
  );
  document.querySelectorAll<HTMLElement>('main section[id]').forEach((s) => io.observe(s));
  return () => io.disconnect();
}

// UTMs y referencia de la visita: se guardan al llegar (la campaña trae los parámetros en la URL
// de entrada) para enviarlos con el formulario aunque se pierdan de la barra.
const CLAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
export function origenVisita(): Record<string, string> {
  const fuera: Record<string, string> = {};
  try {
    const q = new URLSearchParams(window.location.search);
    const guardado = JSON.parse(sessionStorage.getItem('ky-utm') ?? '{}') as Record<string, string>;
    for (const k of CLAVES) {
      const v = q.get(k) ?? guardado[k];
      if (v) fuera[k] = v;
    }
    sessionStorage.setItem('ky-utm', JSON.stringify(fuera));
  } catch {
    /* sin storage: solo lo de la URL actual */
  }
  if (document.referrer) fuera.referrer = document.referrer;
  return fuera;
}
