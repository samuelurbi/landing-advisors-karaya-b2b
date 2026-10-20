// Envío del formulario de socios. Sin GHL (20/10/2026): POST JSON a /api/enviar.php, que va en el
// propio zip de Hostinger (public/api/) y guarda en MySQL y avisa por SMTP. Solo cuenta como
// enviado si el servidor contesta { ok: true }; cualquier otra cosa es error (la web enseña la
// salida por WhatsApp). En `npm run dev` no hay PHP: se simula, salvo con VITE_FORM_ENDPOINT.
import { origenVisita } from '@/lib/analitica';

export type Envio = {
  campos: Record<string, string | boolean | string[]>;
  consentimiento: boolean;
  /** Campo trampa (honeypot) y milisegundos desde que se vio el formulario: antispam. */
  hp: string;
  ms: number;
};
export type Resultado = { ok: true } | { ok: false; error: string };

const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || (import.meta.env.DEV ? '' : '/api/enviar.php');
export const envioSimulado = !ENDPOINT;

export async function enviar(e: Envio): Promise<Resultado> {
  const { referrer, ...utm } = origenVisita();
  const cuerpo = {
    campos: e.campos,
    consentimiento: { aceptado: e.consentimiento },
    utm,
    pagina: window.location.href,
    referrer: referrer ?? '',
    idioma: document.documentElement.lang || 'en',
    _hp: e.hp,
    _ms: e.ms,
  };
  if (!ENDPOINT) {
    await new Promise((r) => setTimeout(r, 900));
    console.debug('[formulario simulado]', cuerpo);
    return { ok: true };
  }
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
    const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    return r.ok && j?.ok === true ? { ok: true } : { ok: false, error: j?.error ?? `http_${r.status}` };
  } catch {
    return { ok: false, error: 'red' };
  }
}
