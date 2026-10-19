// Envío del formulario (registro de partner o solicitud de cotización). POST JSON al webhook de
// VITE_FORM_ENDPOINT (CRM / GoHighLevel / Odoo: lo decide Marketing). Sin endpoint, la preview
// simula el éxito y no envía nada.
import { origenVisita } from '@/lib/analitica';

export type Envio = { modo: 'registro' | 'cotizacion'; marca: 'karaya'; datos: Record<string, string | boolean | string[]> };

const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim();
export const envioSimulado = !ENDPOINT;

export async function enviar(e: Envio): Promise<{ ok: boolean }> {
  const cuerpo = { ...e, origen: origenVisita(), pagina: window.location.href, enviado: new Date().toISOString() };
  if (!ENDPOINT) {
    await new Promise((r) => setTimeout(r, 900));
    if (import.meta.env.DEV) console.debug('[formulario simulado]', cuerpo);
    return { ok: true };
  }
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
    return { ok: r.ok };
  } catch {
    return { ok: false };
  }
}
