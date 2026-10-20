// Rutas de los medios (public/), tal cual. __MEDIOS__ era del kit de GoHighLevel (Vibe), retirado el
// 20/10/2026 (sin GHL): sin él, `medio` y `hayMedio` no cambian nada.
declare const __MEDIOS__: Record<string, string> | undefined;
const MAPA: Record<string, string> | null = typeof __MEDIOS__ !== 'undefined' ? __MEDIOS__ : null;

export const medio = (ruta: string) =>
  MAPA ? ruta.replace(/(^|[\s,])(\/[^\s,]+)/g, (_, antes: string, r: string) => antes + (MAPA[r] ?? r)) : ruta;

/** ¿Existe este medio donde se sirve la web? Siempre en Vercel; en GHL solo si está en la mediateca
 *  (no admite AVIF: allí las fotos van solo en WebP). */
export const hayMedio = (ruta: string) => !MAPA || ruta in MAPA;
