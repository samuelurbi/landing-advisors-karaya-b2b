// «Plan an event»: el planificador de la propuesta «El Atardecer», sin calcular comisión (la regla del
// grupo no deja publicar porcentajes). Iteración 1 (13/10, Samuel: los selectores eran confusos): una
// pregunta cada vez, numerada, con opciones grandes; al elegir se pasa sola a la siguiente y la tarjeta
// de la derecha se va rellenando. Al final, el extra de Hispaniola y «Send this brief», que adjunta el
// brief al formulario (evento `ky-brief`) y baja hasta él.
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, Briefcase, CalendarClock, CalendarDays, CalendarRange, Cake, Check, CircleHelp, Heart, Music, PartyPopper, Plus, RotateCcw, Sparkles, Users, UsersRound, Utensils, Wine, type LucideIcon } from 'lucide-react';
import { Acento, Antetitulo, Foto, clasesBoton } from '@/components/ui';
import { emitir } from '@/lib/analitica';
import { entrada, entradaTarjeta, entradaTitulo, enVista } from '@/lib/movimiento';
import { plan } from '@/data/contenido';

export type Brief = { tipo: string; invitados: string; formato: string; mes: string; hispaniola: boolean };
type Clave = keyof typeof plan.pasos;
const CLAVES = Object.keys(plan.pasos) as Clave[];
const N = CLAVES.length;

// Un icono por opción, en el mismo orden que en contenido.ts.
const ICONOS: Record<Clave, LucideIcon[]> = {
  tipo: [Cake, PartyPopper, Briefcase, Heart],
  invitados: [UsersRound, Sparkles, Users, CircleHelp],
  formato: [Utensils, Wine, Music],
  mes: [CalendarClock, CalendarDays, CalendarRange, CalendarRange],
};

export const textoBrief = (b: Brief) => [b.tipo, `${b.invitados} guests`, b.formato, b.mes, b.hispaniola ? '+ Hispaniola daytime' : ''].filter(Boolean).join(' · ');

export function Plan() {
  const quieto = useReducedMotion();
  const [b, setB] = useState<Brief>({ tipo: '', invitados: '', formato: '', mes: '', hispaniola: false });
  const [paso, setPaso] = useState(0); // 0..N-1 preguntas; N = listo
  // El foco va al titular del paso nuevo cuando ya está montado (con AnimatePresence en modo «wait»
  // el nuevo entra cuando el anterior ha salido): teclado y lectores siguen el flujo.
  const pedirFoco = useRef(false);
  const enfocar = (el: HTMLElement | null) => {
    if (el && pedirFoco.current) {
      pedirFoco.current = false;
      el.focus({ preventScroll: true });
    }
  };
  const completo = CLAVES.every((k) => b[k]);

  const irA = (p: number) => {
    pedirFoco.current = true;
    setPaso(p);
  };
  const elegir = (k: Clave, valor: string) => {
    setB((x) => ({ ...x, [k]: valor }));
    emitir('planner_change', { campo: k, valor });
    const i = CLAVES.indexOf(k);
    // Siguiente pregunta sin respuesta (o el final si ya están todas).
    const siguiente = CLAVES.findIndex((c, j) => j > i && !b[c]);
    window.setTimeout(() => irA(siguiente === -1 ? N : siguiente), quieto ? 0 : 280);
  };
  const enviar = () => {
    if (!completo) return;
    window.dispatchEvent(new CustomEvent<Brief>('ky-brief', { detail: b }));
    emitir('planner_send', { tipo: b.tipo, invitados: b.invitados, formato: b.formato, mes: b.mes, hispaniola: b.hispaniola });
    document.getElementById('join')?.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' });
  };
  const reiniciar = () => {
    setB({ tipo: '', invitados: '', formato: '', mes: '', hispaniola: false });
    irA(0);
  };

  const clave = CLAVES[paso];
  const g = clave ? plan.pasos[clave] : null;
  const foto = b.tipo || plan.pasos.tipo.opciones[0];

  return (
    <section id="plan" aria-labelledby="plan-titulo" className="relative py-16 md:py-28">
      <div className="contenedor">
        <div className="max-w-[760px]">
          <motion.div variants={entrada} {...enVista}>
            <Antetitulo>{plan.antetitulo}</Antetitulo>
          </motion.div>
          <motion.h2 id="plan-titulo" variants={entradaTitulo} {...enVista} className="mt-4 text-[40px] md:text-[60px]">
            <Acento texto={plan.titulo} />
          </motion.h2>
          <motion.p variants={entrada} {...enVista} className="mt-4 max-w-[52ch] text-[17px] text-texto-2 md:text-[18px]">
            {plan.intro}
          </motion.p>
        </div>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1fr_440px] lg:gap-14">
          <motion.div variants={entrada} {...enVista} className="min-w-0">
            {/* Progreso: cuatro pasos numerados; los ya respondidos se pueden revisar. */}
            <ol className="grid grid-cols-4 gap-2" aria-label={plan.progreso}>
              {CLAVES.map((k, i) => {
                const hecho = !!b[k];
                const actual = i === paso;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => irA(i)}
                      disabled={!hecho && !actual && !CLAVES.slice(0, i).every((c) => b[c])}
                      aria-current={actual ? 'step' : undefined}
                      className="group flex w-full flex-col items-start gap-2 text-left disabled:cursor-default"
                    >
                      <span className={clsx('block h-1 w-full rounded-full transition-colors duration-300', actual ? 'bg-sol' : hecho ? 'bg-texto/70' : 'bg-texto/15')} />
                      <span className={clsx('flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] sm:text-[13px]', actual ? 'text-texto' : hecho ? 'text-texto-2 group-hover:text-texto' : 'text-texto-3')}>
                        <span className={clsx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]', hecho ? 'bg-texto/80 text-noche' : actual ? 'bg-sol text-noche' : 'bg-texto/10')}>{hecho ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                        <span className="hidden sm:inline">{plan.pasos[k].titulo}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative mt-8 min-h-[380px] md:mt-10">
              <AnimatePresence mode="wait" initial={false}>
                {g && clave ? (
                  <motion.fieldset key={clave} initial={quieto ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={quieto ? undefined : { opacity: 0, x: -24, transition: { duration: 0.16 } }} transition={{ duration: 0.26 }} className="min-w-0">
                    <legend className="contents">
                      <span className="block text-[13px] font-semibold uppercase tracking-[0.14em] text-sol">
                        {plan.pasoDe.replace('{n}', String(paso + 1)).replace('{total}', String(N))}
                      </span>
                      <span ref={enfocar} tabIndex={-1} className="display mt-2 block text-[30px] leading-[1.05] outline-none md:text-[40px]">
                        {g.pregunta}
                      </span>
                      {'nota' in g && typeof g.nota === 'string' ? <span className="mt-2 block text-[15px] font-semibold text-texto-2 md:text-[16px]">{g.nota}</span> : null}
                    </legend>
                    <div className={clsx('mt-6 grid gap-3', g.opciones.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2')}>
                      {g.opciones.map((o, j) => {
                        const sel = b[clave] === o;
                        const Icono = ICONOS[clave][j];
                        return (
                          <button
                            key={o}
                            type="button"
                            aria-pressed={sel}
                            onClick={() => elegir(clave, o)}
                            className={clsx(
                              'group flex min-h-[112px] flex-col items-start justify-between gap-4 rounded-[20px] border p-4 text-left transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] md:min-h-[132px] md:p-5',
                              sel ? 'border-sol bg-sol text-noche' : 'border-texto/15 bg-texto/[0.04] text-texto hover:border-texto/40 hover:bg-texto/[0.08]',
                            )}
                          >
                            <span className={clsx('flex h-10 w-10 items-center justify-center rounded-full transition-colors', sel ? 'bg-noche text-sol' : 'bg-texto/10 text-texto group-hover:bg-sol group-hover:text-noche')}>
                              {sel ? <Check size={20} strokeWidth={2.6} aria-hidden /> : <Icono size={20} aria-hidden />}
                            </span>
                            <span className="text-[17px] font-semibold leading-tight md:text-[19px]">{o}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      {paso > 0 ? (
                        <button type="button" onClick={() => irA(paso - 1)} className="flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-texto-2 hover:text-texto">
                          <ArrowLeft size={18} aria-hidden /> {plan.atras}
                        </button>
                      ) : (
                        <span />
                      )}
                      {b[clave] ? (
                        <button type="button" onClick={() => irA(CLAVES.findIndex((c, j) => j > paso && !b[c]) === -1 ? N : CLAVES.findIndex((c, j) => j > paso && !b[c]))} className="flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-sol hover:text-sol-hondo">
                          {plan.siguiente} <ArrowRight size={18} aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </motion.fieldset>
                ) : (
                  <motion.div key="listo" initial={quieto ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={quieto ? undefined : { opacity: 0 }} transition={{ duration: 0.28 }}>
                    <span className="block text-[13px] font-semibold uppercase tracking-[0.14em] text-sol">{plan.listo.antetitulo}</span>
                    <p ref={enfocar} tabIndex={-1} className="display mt-2 text-[30px] leading-[1.05] outline-none md:text-[40px]">
                      {plan.listo.titulo}
                    </p>
                    <p className="mt-3 max-w-[46ch] text-[16px] text-texto-2">{plan.listo.texto}</p>
                    <label className="mt-6 flex min-h-[64px] cursor-pointer items-center gap-4 rounded-[20px] border border-texto/15 bg-texto/[0.04] px-4 py-3 transition-colors hover:border-texto/40 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-mar">
                      <input type="checkbox" checked={b.hispaniola} onChange={(e) => { setB((x) => ({ ...x, hispaniola: e.target.checked })); emitir('planner_change', { campo: 'hispaniola', valor: e.target.checked }); }} className="sr-only" />
                      <span aria-hidden className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors', b.hispaniola ? 'bg-sol text-noche' : 'bg-texto/10 text-texto')}>
                        {b.hispaniola ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
                      </span>
                      <span>
                        <span className="block text-[17px] font-semibold">{plan.extra.titulo}</span>
                        <span className="block text-[14px] text-texto-3">{plan.extra.texto}</span>
                      </span>
                    </label>
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <button type="button" onClick={enviar} className={clsx(clasesBoton('primario', 'md'), '!rounded-full lg:hidden')}>
                        {plan.enviar} <ArrowRight size={18} aria-hidden />
                      </button>
                      <button type="button" onClick={reiniciar} className="flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-texto-2 hover:text-texto">
                        <RotateCcw size={16} aria-hidden /> {plan.listo.otra}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Borrador del brief: se rellena con cada respuesta. */}
          <motion.aside variants={entradaTarjeta} {...enVista} aria-label={plan.borrador} className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[26px] bg-texto text-noche">
              <div className="relative aspect-[16/9] overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div key={foto} className="absolute inset-0" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                    <Foto nombre={plan.fotos[foto]} alt={plan.alts[foto]} sizes="(min-width: 1200px) 440px, 100vw" />
                  </motion.div>
                </AnimatePresence>
                <span className="absolute left-4 top-4 rounded-full bg-noche/70 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-texto backdrop-blur-md">{plan.borrador}</span>
              </div>
              <div className="p-5 md:p-6" aria-live="polite">
                <p className={clsx('display text-[26px] leading-tight', !b.tipo && 'text-noche/40')}>{b.tipo || plan.porElegir.tipo}</p>
                <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-noche/10 py-4 text-[14px]">
                  {(['invitados', 'formato', 'mes'] as const).map((k) => (
                    <div key={k} className="flex flex-col-reverse justify-end">
                      <dt className="mt-0.5 text-noche/60">{plan.pasos[k].titulo}</dt>
                      <dd className={clsx('font-semibold', !b[k] && 'text-noche/35')}>{b[k] || '—'}</dd>
                    </div>
                  ))}
                </dl>
                {b.hispaniola ? <p className="mt-3 text-[14px] font-semibold text-mar-hondo">+ {plan.extra.titulo}</p> : null}
                <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-noche/60">{plan.recibes}</p>
                <ul className="mt-2 grid gap-1.5 text-[15px]">
                  {plan.incluye.map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check size={18} className="mt-0.5 shrink-0 text-mar-hondo" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={enviar} disabled={!completo} className={clsx(clasesBoton('marino', 'md'), 'mt-6 w-full !rounded-full disabled:!opacity-100 disabled:bg-noche/10 disabled:text-noche/50')}>
                  {completo ? plan.enviar : plan.faltan}
                  {completo ? <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" /> : null}
                </button>
                <p className="mt-3 text-center text-[13px] text-noche/60">{plan.nota}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
