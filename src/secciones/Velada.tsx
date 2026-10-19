// «The evening» (la propuesta «El Atardecer» de Marketing): un evento a bordo en seis momentos y tres
// luces del mismo plano de dron (día → golden hour → casi anochecer; nunca noche: Karaya no tiene
// servicios nocturnos).
// Iteración 3 (13/10, Samuel): fuera el deslizador y la lista separada. La foto y el texto de su luz
// van en el mismo bloque y cambian juntos: pasa sola en bucle infinito (día → golden → atardecer → día)
// con fundidos lentos, y se cambia a mano con tres pestañas; al tocar una salta a ella y el bucle sigue
// desde ahí. Bajo la pestaña activa, una barra fina dice cuánto falta para la siguiente. Botón de pausa
// (WCAG 2.2.2) y el bucle se para fuera de pantalla.
// Con reduced-motion: sin bucle ni fundidos; empieza en golden hour y se cambia con las pestañas.
// Fotos en alta (2688 px, AVIF + WebP a 960/1600/2688): README, «Imágenes de The evening». El barco es
// el de la foto real (repegado y medido).
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { clsx } from 'clsx';
import { Pause, Play } from 'lucide-react';
import { Acento, Antetitulo } from '@/components/ui';
import { emitir } from '@/lib/analitica';
import { entrada, entradaTitulo, enVista } from '@/lib/movimiento';
import { velada as v } from '@/data/contenido';

const ALT = 'Karaya sailing off the Bávaro coast, seen from a drone';
const ANCHOS = [960, 1600, 2688];
const PASO = 7; // segundos por luz: ritmo tranquilo
const FUNDIDO = 1.6;
const N = v.luces.length;
const grupo = (k: number) => v.paradas.filter((p) => p.hora === v.luces[k].etiqueta);

// Una luz en <picture>: AVIF con WebP de respaldo, tres anchos. Las tres se cargan desde el principio
// (apiladas) para que el fundido nunca enseñe un hueco.
function FotoLuz({ luz, sizes }: { luz: string; sizes: string }) {
  const set = (ext: string) => ANCHOS.map((w) => `/img/velada/karaya-velada-${luz}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <img src={`/img/velada/karaya-velada-${luz}-1600.webp`} srcSet={set('webp')} sizes={sizes} width={2688} height={1792} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 55%' }} />
    </picture>
  );
}

// Fundido cruzado: la luz anterior se queda debajo, opaca, mientras la nueva entra encima; al acabar,
// la anterior se apaga sin que se note. Así nunca asoma el fondo a mitad del fundido.
function Fotos({ actual, quieto }: { actual: number; quieto: boolean }) {
  const [previa, setPrevia] = useState(actual);
  const [entrando, setEntrando] = useState(actual);
  useEffect(() => {
    if (actual === entrando) return;
    setPrevia(entrando);
    setEntrando(actual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual]);
  const sizes = '(min-width: 1440px) 820px, (min-width: 1200px) 60vw, calc(100vw - 32px)';
  return (
    <div aria-hidden className="absolute inset-0">
      {v.luces.map((l, k) => {
        const esNueva = k === entrando;
        const esPrevia = k === previa && previa !== entrando;
        return (
          <motion.div
            key={l.id}
            className="absolute inset-0"
            style={{ zIndex: esNueva ? 2 : esPrevia ? 1 : 0 }}
            initial={false}
            animate={{ opacity: esNueva || esPrevia ? 1 : 0 }}
            transition={{ duration: esNueva && !quieto ? FUNDIDO : 0, ease: 'easeInOut' }}
            onAnimationComplete={() => esNueva && setPrevia(entrando)}
          >
            <FotoLuz luz={l.id} sizes={sizes} />
          </motion.div>
        );
      })}
    </div>
  );
}

function Pestanas({ actual, progreso, animado, alElegir }: { actual: number; progreso: MotionValue<number>; animado: boolean; alElegir: (k: number) => void }) {
  const ancho = useTransform(progreso, (x) => `${x * 100}%`);
  return (
    <div role="tablist" aria-label={v.control} className="grid grid-cols-3 gap-2">
      {v.luces.map((l, k) => {
        const sel = k === actual;
        return (
          <button
            key={l.id}
            type="button"
            role="tab"
            id={`luz-${l.id}`}
            aria-selected={sel}
            aria-controls="luz-panel"
            tabIndex={sel ? 0 : -1}
            onClick={() => alElegir(k)}
            onKeyDown={(e) => {
              const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const n = (k + d + N) % N;
              alElegir(n);
              document.getElementById(`luz-${v.luces[n].id}`)?.focus();
            }}
            className={clsx('group flex min-h-[48px] flex-col justify-end gap-2.5 text-left text-[14px] font-semibold transition-colors sm:text-[15px]', sel ? 'text-texto' : 'text-texto-3 hover:text-texto-2')}
          >
            {l.etiqueta}
            {/* Barra fina: llena en la activa según el progreso; las demás, solo la pista. */}
            <span aria-hidden className="block h-[3px] w-full overflow-hidden rounded-full bg-texto/15">
              {sel ? animado ? <motion.span className="block h-full rounded-full bg-sol" style={{ width: ancho }} /> : <span className="block h-full w-full rounded-full bg-sol" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Velada() {
  const quieto = !!useReducedMotion();
  const [actual, setActual] = useState(0);
  const [pausa, setPausa] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const visible = useInView(caja, { amount: 0.35 });
  const progreso = useMotionValue(0);
  const [vuelta, setVuelta] = useState(0); // reinicia el temporizador al elegir a mano

  // Reduced-motion: empieza en golden hour y no hay bucle.
  useEffect(() => {
    if (quieto) setActual(1);
  }, [quieto]);

  // Bucle: la barra se llena en PASO segundos y pasa a la siguiente luz; pausado o fuera de pantalla,
  // se congela donde esté y sigue desde ahí.
  useEffect(() => {
    if (quieto || pausa || !visible) return;
    const c = animate(progreso, 1, {
      duration: PASO * (1 - progreso.get()),
      ease: 'linear',
      onComplete: () => {
        progreso.set(0);
        setActual((k) => (k + 1) % N);
      },
    });
    return () => c.stop();
  }, [actual, vuelta, pausa, visible, quieto, progreso]);

  const elegir = (k: number) => {
    progreso.set(0);
    setActual(k);
    setVuelta((x) => x + 1);
    emitir('evening_light', { luz: v.luces[k].id, origen: 'pestana' });
  };

  const luz = v.luces[actual];
  return (
    <section id="the-evening" aria-labelledby="velada-titulo" className="relative py-16 md:py-24">
      <div className="contenedor">
        <div className="grid gap-4 md:grid-cols-[1.15fr_1fr] md:items-end">
          <div>
            <motion.div variants={entrada} {...enVista}>
              <Antetitulo>{v.antetitulo}</Antetitulo>
            </motion.div>
            <motion.h2 id="velada-titulo" variants={entradaTitulo} {...enVista} className="mt-4 max-w-[15ch] text-[38px] md:text-[56px] lg:text-[64px]">
              <Acento texto={v.titulo} />
            </motion.h2>
          </div>
          <motion.p variants={entrada} {...enVista} className="max-w-[44ch] text-[17px] text-texto-2 md:justify-self-end md:text-[18px]">
            {v.intro}
          </motion.p>
        </div>

        {/* Un solo bloque: foto a la izquierda y, a su lado (debajo en móvil), las pestañas y el texto
            de la luz que se ve. Mismo marco para los dos: se leen como una sola cosa. */}
        <div ref={caja} className="mt-10 grid overflow-hidden rounded-[24px] bg-hondo ring-1 ring-texto/10 md:rounded-[28px] lg:mt-12 lg:grid-cols-[1.55fr_1fr]">
          <div className="relative aspect-[3/2] lg:aspect-auto lg:min-h-[560px]">
            <Fotos actual={actual} quieto={quieto} />
            <p className="sr-only">{`${ALT}, ${luz.etiqueta.toLowerCase()} light.`}</p>
            {!quieto ? (
              <button type="button" onClick={() => setPausa(!pausa)} aria-pressed={pausa} aria-label={pausa ? v.reanudar : v.pausar} className="absolute bottom-3 left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-hondo/70 text-texto backdrop-blur-md transition-colors hover:bg-hondo sm:bottom-4 sm:left-4">
                {pausa ? <Play size={16} /> : <Pause size={16} />}
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:p-8">
            <Pestanas actual={actual} progreso={progreso} animado={!quieto} alElegir={elegir} />
            <div id="luz-panel" role="tabpanel" aria-labelledby={`luz-${luz.id}`} aria-live="polite" className="relative min-h-[300px] sm:min-h-[220px] lg:min-h-0 lg:flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={luz.id} initial={quieto ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={quieto ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.45 }}>
                  <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-sol">
                    <span className="h-2 w-2 rounded-full bg-sol" />
                    {luz.etiqueta}
                  </p>
                  <ol className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
                    {grupo(actual).map((p) => (
                      <li key={p.id}>
                        <p className="text-[12px] font-semibold tracking-[0.14em] text-texto-3">{String(v.paradas.indexOf(p) + 1).padStart(2, '0')} / {String(v.paradas.length).padStart(2, '0')}</p>
                        <h3 className="mt-1 text-[24px] leading-tight md:text-[26px]">{p.titulo}</h3>
                        <p className="mt-1.5 text-[15.5px] leading-snug text-texto-2">{p.texto}</p>
                        <p className="mt-2 text-[14.5px] leading-snug text-texto">
                          <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mar-texto">{v.paraTi}</span>
                          {p.socio}
                        </p>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
