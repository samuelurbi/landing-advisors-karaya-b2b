// «Tour the boat»: el visor 3D de la web de Karaya (mismo GLB, mismo mar, mismos planos de cámara)
// convertido en argumento de venta. Cada punto del barco abre dos capas: lo que gana el cliente del
// socio y lo que gana su negocio. Tocar un punto (en la escena o en la lista) lleva la cámara hasta
// él y el panel enseña la foto real de esa zona (MA-83, como el visor de la web); «Take the tour»
// recorre los puntos solo hasta que el usuario toca algo.
// Composición: escena a todo el ancho del contenedor; en escritorio el panel flota sobre la derecha
// y el encuadre del barco se desplaza a la parte libre (centroX del visor). En móvil, panel debajo.
// - Three.js se carga solo cuando la sección está a punto de verse (en un momento libre) y se pausa
//   fuera de pantalla.
// - Arrastrar gira el barco; en táctil solo en horizontal (el gesto vertical es el scroll).
// - Sin GPU de verdad (WebGL por software, p. ej. Lighthouse) o si falla la carga: la escena pasa a
//   la foto real de cada zona, con la misma lista y las mismas capas.
// - Con reduced-motion: sin giro automático, sin viaje de cámara y sin recorrido automático.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { Box, Pause, Play } from 'lucide-react';
import { Acento, Antetitulo, Foto } from '@/components/ui';
import { emitir } from '@/lib/analitica';
import { gpuSuficiente } from '@/lib/gpu';
import { entrada, entradaTitulo, enVista } from '@/lib/movimiento';
import { barco } from '@/data/contenido';
import type { PuntoVisor, Visor3D, ZonaVisor } from '@/barco3d/visor';

type Zona = (typeof barco.zonas)[number];
const zonas = barco.zonas as readonly Zona[];
const PASO_TOUR = 6000;
// Ancho del panel flotante en escritorio (lg) y centro del barco en la parte libre.
const PANEL = 400;

export function Recorrido() {
  const quieto = useReducedMotion();
  const caja = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const puntos = useRef<(HTMLButtonElement | null)[]>([]);
  const visor = useRef<Visor3D | null>(null);
  const [activa, setActiva] = useState<ZonaVisor>(zonas[0].id);
  const [cerca, setCerca] = useState(false);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'fallo'>('cargando');
  const [tour, setTour] = useState(false);
  const activaRef = useRef(activa);
  activaRef.current = activa;

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    // Se prepara cuando la escena está a punto de entrar en pantalla y el navegador queda libre
    // (Three.js y el GLB pesan; no compiten con la carga del hero).
    let idle = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
        idle = ric(() => setCerca(true), { timeout: 1500 } as IdleRequestOptions);
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.cancelIdleCallback?.(idle);
    };
  }, []);

  useEffect(() => {
    if (!cerca) return;
    if (!gpuSuficiente()) {
      setEstado('fallo');
      return;
    }
    const abort = new AbortController();
    let raf = 0,
      visible = true;
    const el = caja.current!;
    const escritorio = matchMedia('(min-width: 1200px)');
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) raf = requestAnimationFrame(bucle);
    });
    let arrastre: { id: number; x: number; y: number; tactil: boolean } | null = null;
    const bajar = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('button, [data-panel]')) return;
      arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, tactil: e.pointerType === 'touch' };
      el.setPointerCapture(e.pointerId);
      el.dataset.arrastrando = 'si';
      setTour(false);
    };
    const mover = (e: PointerEvent) => {
      if (!arrastre || e.pointerId !== arrastre.id || !visor.current) return;
      const dx = e.clientX - arrastre.x,
        dy = e.clientY - arrastre.y;
      arrastre.x = e.clientX;
      arrastre.y = e.clientY;
      visor.current.girar(dx * 0.0085, arrastre.tactil ? 0 : dy * 0.006);
    };
    const soltar = (e: PointerEvent) => {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      arrastre = null;
      delete el.dataset.arrastrando;
    };
    function bucle(ahora: number) {
      if (!visible || !visor.current) return;
      const ancho = el.clientWidth;
      const libre = escritorio.matches ? ancho - PANEL - 24 : ancho;
      const centroX = escritorio.matches ? libre / 2 / ancho : 0.5;
      const ps: PuntoVisor[] = visor.current.dibujar(ahora / 1000, { orbitar: !quieto && activaRef.current === 'aerea', centroX });
      ps.forEach((p) => {
        const i = zonas.findIndex((z) => z.id === p.zona);
        const b = puntos.current[i];
        if (!b) return;
        b.style.transform = `translate3d(${p.x - 22}px,${p.y - 22}px,0)`;
        b.dataset.visible = String(p.visible && p.zona !== 'aerea' && p.x < libre - 12);
      });
      raf = requestAnimationFrame(bucle);
    }
    (async () => {
      try {
        const { crearVisor } = await import('@/barco3d/visor.js');
        const v = await crearVisor(canvas.current!, abort.signal);
        if (abort.signal.aborted) return v.destruir();
        visor.current = v;
        v.ir(activaRef.current, performance.now() / 1000, 0.001);
        setEstado('listo');
        io.observe(el);
        el.addEventListener('pointerdown', bajar);
        el.addEventListener('pointermove', mover);
        el.addEventListener('pointerup', soltar);
        el.addEventListener('pointercancel', soltar);
      } catch {
        if (!abort.signal.aborted) setEstado('fallo');
      }
    })();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', bajar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
      abort.abort();
      visor.current?.destruir();
      visor.current = null;
    };
  }, [cerca, quieto]);

  const ir = (zona: ZonaVisor) => {
    setActiva(zona);
    visor.current?.ir(zona, performance.now() / 1000, quieto ? 0.001 : 1.4);
  };
  // Elección del usuario: corta el recorrido automático y se mide (el recorrido no se mide).
  const elegir = (zona: ZonaVisor) => {
    setTour(false);
    ir(zona);
    emitir('boat_point_view', { zona });
  };

  // Recorrido automático: un punto cada PASO_TOUR.
  useEffect(() => {
    if (!tour) return;
    const t = window.setTimeout(() => {
      const i = zonas.findIndex((z) => z.id === activaRef.current);
      ir(zonas[(i + 1) % zonas.length].id);
    }, PASO_TOUR);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, activa]);
  // Y se apaga si la escena sale de la pantalla.
  useEffect(() => {
    const el = caja.current;
    if (!el || !tour) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && setTour(false), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [tour]);

  const alternarTour = () => {
    if (!tour) {
      emitir('boat_tour_play');
      const i = zonas.findIndex((z) => z.id === activa);
      ir(zonas[(i + 1) % zonas.length].id);
    }
    setTour(!tour);
  };

  const zona = zonas.find((z) => z.id === activa) ?? zonas[0];
  const indice = zonas.indexOf(zona);
  const fallo = estado === 'fallo';

  const teclas = (i: number) => (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const sig = zonas[(i + d + zonas.length) % zonas.length];
    elegir(sig.id);
    document.getElementById(`zona-${sig.id}`)?.focus();
  };

  return (
    <section id="the-boat" aria-labelledby="barco-titulo" className="relative py-16 md:py-24">
      <div className="contenedor relative">
        <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-end">
          <div>
            <motion.div variants={entrada} {...enVista}>
              <Antetitulo>{barco.antetitulo}</Antetitulo>
            </motion.div>
            <motion.h2 id="barco-titulo" variants={entradaTitulo} {...enVista} className="mt-4 max-w-[15ch] text-[40px] md:text-[60px] lg:text-[72px]">
              <Acento texto={barco.titulo} />
            </motion.h2>
          </div>
          <motion.p variants={entrada} {...enVista} className="max-w-[42ch] text-[17px] text-texto-2 md:justify-self-end md:text-[18px]">
            {barco.intro}
          </motion.p>
        </div>

        {/* Escena (con el panel flotando dentro en escritorio) */}
        <div
          ref={caja}
          className={clsx(
            'relative mt-10 min-w-0 select-none overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_50%_60%,rgb(var(--ky-mar)/0.28),rgb(var(--ky-fondo-2))_70%)] ring-1 ring-texto/10 lg:mt-14',
            !fallo && 'cursor-grab touch-pan-y data-[arrastrando]:cursor-grabbing',
          )}
        >
          <div className="relative aspect-[4/3.6] sm:aspect-[16/10] lg:aspect-auto lg:h-[720px]">
            {fallo ? (
              <AnimatePresence initial={false}>
                <motion.div key={zona.id} className="absolute inset-0 lg:right-[424px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                  <Foto nombre={zona.foto} alt={zona.alt} sizes="(min-width: 1200px) 60vw, 100vw" />
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.45),transparent_45%)]" />
                </motion.div>
              </AnimatePresence>
            ) : (
              <canvas ref={canvas} className={clsx('absolute inset-0 h-full w-full transition-opacity duration-700', estado === 'listo' ? 'opacity-100' : 'opacity-0')} aria-hidden />
            )}
            {estado === 'cargando' ? (
              <div className="absolute inset-0 flex items-center justify-center text-texto-3 lg:right-[424px]">
                <Box size={28} className="animate-pulse" />
              </div>
            ) : null}
            {!fallo
              ? zonas.map((z, i) => (
                  <button
                    key={z.id}
                    ref={(b) => {
                      puntos.current[i] = b;
                    }}
                    type="button"
                    tabIndex={-1}
                    data-visible="false"
                    onClick={() => elegir(z.id)}
                    aria-label={`${i}. ${z.nombre}`}
                    className={clsx('punto-visor absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full', z.id === 'aerea' && 'hidden')}
                  >
                    <span className={clsx('relative flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold ring-2 transition-colors', activa === z.id ? 'bg-sol text-noche ring-sol' : 'bg-noche/50 text-texto ring-white backdrop-blur-sm hover:bg-white hover:text-noche')}>
                      {activa !== z.id ? <span aria-hidden className="latido absolute inset-0 rounded-full ring-2 ring-white/70" /> : null}
                      {i}
                    </span>
                  </button>
                ))
              : null}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 sm:bottom-4 sm:left-4 sm:right-4 lg:right-[424px]">
              <p className="pointer-events-none hidden rounded-full bg-noche/60 px-3 py-1.5 text-[13px] text-texto/85 backdrop-blur-md sm:block">{fallo ? barco.ayudaFoto : barco.ayuda}</p>
              {!quieto ? (
                <button type="button" onClick={alternarTour} aria-pressed={tour} className="ml-auto flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-sol px-4 text-[14px] font-semibold text-noche transition-colors hover:bg-sol-hondo">
                  {tour ? <Pause size={16} /> : <Play size={16} />}
                  {tour ? barco.pararTour : barco.tour}
                </button>
              ) : null}
            </div>
            {tour ? <motion.span key={`${zona.id}-barra`} aria-hidden className="absolute left-0 top-0 h-[3px] bg-sol" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: PASO_TOUR / 1000, ease: 'linear' }} /> : null}
          </div>

          {/* Panel: en escritorio flota sobre la escena; en móvil va debajo, sobre el mismo fondo. */}
          <div data-panel className="relative cursor-auto border-t border-texto/10 bg-hondo/70 p-2 lg:absolute lg:bottom-3 lg:right-3 lg:top-3 lg:flex lg:w-[400px] lg:flex-col lg:rounded-[22px] lg:border lg:border-texto/12 lg:bg-hondo/75 lg:backdrop-blur-xl">
            <div role="tablist" aria-label={barco.lista} className="pista !mr-0 gap-1.5 !pb-0 !pr-0 px-1 pt-1 lg:flex-wrap lg:overflow-visible">
              {zonas.map((z, i) => {
                const sel = z.id === activa;
                return (
                  <button
                    key={z.id}
                    type="button"
                    role="tab"
                    id={`zona-${z.id}`}
                    aria-selected={sel}
                    aria-controls="zona-panel"
                    tabIndex={sel ? 0 : -1}
                    onClick={() => elegir(z.id)}
                    onKeyDown={teclas(i)}
                    className={clsx('flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full pl-1.5 pr-3.5 text-[14px] font-medium transition-colors', sel ? 'bg-texto text-noche' : 'bg-texto/[0.07] text-texto-2 hover:bg-texto/[0.12] hover:text-texto')}
                  >
                    <span className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold', sel ? 'bg-sol text-noche' : 'bg-texto/12 text-texto')}>{i === 0 ? '0' : i}</span>
                    {z.nombre}
                  </button>
                );
              })}
            </div>
            <div id="zona-panel" role="tabpanel" aria-labelledby={`zona-${zona.id}`} aria-live="polite" className="px-3 pb-4 pt-5 lg:flex-1 lg:px-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={zona.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }} className="flex h-full flex-col">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-texto-3">
                    {String(indice).padStart(2, '0')} / {String(zonas.length - 1).padStart(2, '0')} · {zona.nombre}
                  </p>
                  {/* MA-83: la foto real de la zona, como en el visor de la web (en el modo sin GPU ya
                      ocupa la escena, así que aquí no se repite). */}
                  {!fallo ? (
                    <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-[16px] bg-noche/40 lg:aspect-[2/1]">
                      <Foto nombre={zona.foto} alt={zona.alt} sizes="(min-width: 1200px) 380px, 100vw" />
                    </div>
                  ) : null}
                  <h3 className="mt-3 text-[27px] md:text-[31px] lg:text-[26px]">{zona.titular}</h3>
                  <dl className="mt-5 grid gap-2.5 lg:mt-auto">
                    <div className="rounded-[16px] bg-texto/[0.07] px-4 py-3.5">
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mar-texto">{barco.capaCliente}</dt>
                      <dd className="mt-1 text-[15.5px] text-texto">{zona.cliente}</dd>
                    </div>
                    <div className="rounded-[16px] bg-sol px-4 py-3.5 text-noche">
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-noche/70">{barco.capaNegocio}</dt>
                      <dd className="mt-1 text-[15.5px] font-medium">{zona.negocio}</dd>
                    </div>
                  </dl>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* De un vistazo: tres datos publicados + el aforo y el mínimo que confirmó Karaya (15/10). */}
        <motion.dl variants={entrada} {...enVista} className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          {barco.vistazo.map((d) => (
            <div key={d.valor} className="flex flex-col-reverse justify-end">
              <dt className="mt-1.5 text-[14px] text-texto-3">{d.etiqueta}</dt>
              <dd className="display text-[26px] leading-none md:text-[32px]">{d.valor}</dd>
            </div>
          ))}
          <div>
            <dt className="sr-only">Capacity</dt>
            <dd className="display text-[26px] leading-none md:text-[32px]">{barco.aforo.valor}</dd>
            <dd className="mt-1.5 text-[14px] text-texto-3">
              {barco.aforo.etiqueta}
            </dd>
          </div>
        </motion.dl>
      </div>
    </section>
  );
}
