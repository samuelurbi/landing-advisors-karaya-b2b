// Medición para las campañas: todo al dataLayer (el GTM lo pone el cliente al publicar).
// `cta_click` lleva el destino y el origen; `form_submit`, el modo del formulario.
export type Evento = 'cta_click' | 'form_start' | 'form_submit' | 'form_error' | 'moment_select' | 'boat_point_view' | 'boat_tour_play' | 'planner_change' | 'planner_send' | 'evening_light';

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function emitir(evento: Evento, params: Params = {}) {
  const payload = { event: evento, ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (import.meta.env.DEV) console.debug('[evento]', payload);
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
