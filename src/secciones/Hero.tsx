// Hero de la versión B2B: foto a sangre con parallax y el selector de momentos de la propuesta
// «El Atardecer» (bodas, celebraciones, corporativo). Cada momento cambia la foto y la línea de abajo;
// avanza solo cada 6 s hasta que el usuario elige uno (o con reduced-motion, nunca). Titular letra a
// letra, que arranca cuando el preloader descubre la página.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { Antetitulo, BotonEnlace, Foto } from '@/components/ui';
import { usePreloader } from '@/lib/preloader';
import { emitir } from '@/lib/analitica';
import { cta, hero } from '@/data/contenido';

const curva = [0.22, 1, 0.36, 1] as const;
const OCULTA = { opacity: 0, y: '0.5em', rotate: 6, filter: 'blur(8px)' };
const VISIBLE = { opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' };
const PASO = 6000;

function TitularAnimado({ texto, arrancar }: { texto: string; arrancar: boolean }) {
  const quieto = useReducedMotion();
  const partes = useMemo(() => texto.split(/(\*[^*]+\*)/g).filter(Boolean), [texto]);
  let n = 0;
  const letras = (w: string, k: string) => (
    <span key={k} className="inline-block whitespace-nowrap">
      {[...w].map((c, j) => {
        const retardo = 0.022 * n++;
        return (
          <motion.span key={j} className="inline-block" initial={quieto ? false : OCULTA} animate={quieto || arrancar ? VISIBLE : OCULTA} transition={{ duration: 0.6, delay: retardo, ease: curva }}>
            {c}
          </motion.span>
        );
      })}
    </span>
  );
  return (
    <>
      <span className="sr-only">{texto.replace(/\*/g, '')}</span>
      <span aria-hidden>
        {partes.map((p, i) => {
          const acento = p.startsWith('*') && p.endsWith('*');
          const palabras = (acento ? p.slice(1, -1) : p).split(/(\s+)/);
          const nodos = palabras.map((w, j) => (/^\s+$/.test(w) ? ' ' : w ? letras(w, `${i}-${j}`) : null));
          return acento ? (
            <em key={i} className="acento inline-block">
              {nodos}
            </em>
          ) : (
            <span key={i}>{nodos}</span>
          );
        })}
      </span>
    </>
  );
}

export function Hero() {
  const quieto = useReducedMotion();
  const fase = usePreloader();
  const arrancar = !!quieto || fase !== 'cargando';
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const m = hero.momentos[i];

  useEffect(() => {
    if (quieto || !auto || !arrancar) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % hero.momentos.length), PASO);
    return () => window.clearTimeout(t);
  }, [i, auto, quieto, arrancar]);

  const elegir = (k: number) => {
    setAuto(false);
    setI(k);
    emitir('moment_select', { moment: hero.momentos[k].id, source: 'hero' });
  };

  const aparece = (retardo: number) => ({
    initial: quieto ? false : { opacity: 0, y: 18 },
    animate: arrancar ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.7, delay: retardo, ease: curva },
  });

  return (
    <section ref={ref} id="hero" className="relative">
      <div className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden md:min-h-[760px]">
        <motion.div aria-hidden className="absolute inset-0 -z-20" style={quieto ? undefined : { y }}>
          <motion.div className="relative h-[115%] w-full" initial={quieto ? false : { scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: curva }}>
            {/* La primera foto siempre está (LCP); las demás entran encima en fundido. */}
            <Foto nombre={hero.momentos[0].foto} alt="" prioridad posicion={hero.momentos[0].posicion} />
            <AnimatePresence initial={false}>
              {i > 0 ? (
                <motion.div key={m.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: curva }}>
                  <Foto nombre={m.foto} alt="" posicion={m.posicion} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
        {/* Velos neutros: arriba para la cabecera, abajo y a la izquierda para el texto. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.68)_0%,rgb(0_0_0/0.35)_38%,rgb(0_0_0/0)_64%,rgb(0_0_0/0)_80%,rgb(0_0_0/0.4)_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(to_right,rgb(0_0_0/0.45)_0%,rgb(0_0_0/0.12)_45%,transparent_70%)] md:block" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[22%] bg-[linear-gradient(to_bottom,rgb(var(--ky-fondo)/0)_0%,rgb(var(--ky-fondo)/0.5)_55%,rgb(var(--ky-fondo))_100%)]" />

        <div className="contenedor relative grid gap-6 pb-10 pt-28 md:pb-14 md:pt-36 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <motion.div {...aparece(0)}>
              <Antetitulo className="text-sol">{hero.antetitulo}</Antetitulo>
            </motion.div>
            <h1 className="mt-4 max-w-[13ch] text-[44px] leading-[0.98] sm:text-[58px] md:text-[76px] lg:text-[86px] [@media(min-width:768px)_and_(max-height:820px)]:text-[68px]">
              <TitularAnimado texto={hero.h1} arrancar={arrancar} />
            </h1>
            <motion.p {...aparece(0.55)} className="mt-5 max-w-[46ch] text-[17px] text-texto/90 md:text-[19px]">
              {hero.bajada}
            </motion.p>
            <motion.div {...aparece(0.75)} className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
              <BotonEnlace href="#join" tamano="lg" flecha origen="hero">
                {cta.partner}
              </BotonEnlace>
              <BotonEnlace href="#the-boat" nivel="vidrio" tamano="lg" origen="hero-barco">
                {cta.barco}
              </BotonEnlace>
            </motion.div>
            <motion.p {...aparece(0.9)} className="mt-6 max-w-[52ch] text-[14px] text-texto/75 md:text-[15px]">
              {hero.publico}
            </motion.p>
          </div>

          {/* Selector de momentos (iteración 1, Samuel: que acompañe a la foto y no compita con ella):
              solo texto, sin cajas; la activa en blanco con un filete amarillo que se llena mientras
              dura (el autoavance) y una línea pequeña debajo. */}
          <motion.div {...aparece(1)} className="lg:justify-self-end lg:text-right">
            <p id="momentos-titulo" className="sr-only">
              {hero.selector}
            </p>
            <div role="tablist" aria-labelledby="momentos-titulo" className="flex flex-wrap items-center gap-x-1 lg:justify-end">
              {hero.momentos.map((x, k) => {
                const sel = k === i;
                return (
                  <span key={x.id} className="flex items-center">
                    {k > 0 ? <span aria-hidden className="mx-1.5 h-1 w-1 rounded-full bg-texto/35" /> : null}
                    <button
                      type="button"
                      role="tab"
                      id={`momento-${x.id}`}
                      aria-selected={sel}
                      aria-controls="momento-linea"
                      tabIndex={sel ? 0 : -1}
                      onClick={() => elegir(k)}
                      onKeyDown={(e) => {
                        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                        if (!d) return;
                        e.preventDefault();
                        const n = (k + d + hero.momentos.length) % hero.momentos.length;
                        elegir(n);
                        document.getElementById(`momento-${hero.momentos[n].id}`)?.focus();
                      }}
                      className={clsx('relative flex min-h-[44px] items-center px-1 text-[15px] font-medium transition-colors duration-300 md:text-[16px]', sel ? 'text-texto' : 'text-texto/60 hover:text-texto/90')}
                    >
                      {x.etiqueta}
                      <span aria-hidden className="absolute inset-x-1 bottom-2 h-px overflow-hidden bg-texto/0">
                        {sel ? (
                          auto && !quieto && arrancar ? (
                            <motion.span key={`${x.id}-${i}`} className="block h-full bg-sol" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: PASO / 1000, ease: 'linear' }} />
                          ) : (
                            <span className="block h-full w-full bg-sol" />
                          )
                        ) : null}
                      </span>
                    </button>
                  </span>
                );
              })}
            </div>
            <div id="momento-linea" role="tabpanel" aria-labelledby={`momento-${m.id}`} aria-live="polite" className="mt-1 min-h-[44px] max-w-[36ch] px-1 lg:ml-auto">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-[14px] leading-snug text-texto/70">
                  {m.linea}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
