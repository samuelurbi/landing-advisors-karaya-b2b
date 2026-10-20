// Condiciones para socios (punto 9, Karaya 15/10). Va tras la alianza: es el paso «Agree the terms».
// Lo esencial en cuatro bloques con filete fino (como el bento de Negocio) y el texto largo en un
// <details> nativo: se abre con teclado, se lee sin JS y el buscador lo indexa.
import { motion } from 'framer-motion';
import { ChevronDown, CloudSun, FileText, Ship, Undo2, Wallet } from 'lucide-react';
import { Antetitulo } from '@/components/ui';
import { CabeceraSeccion } from '@/components/bloques';
import { entrada, entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';
import { condiciones } from '@/data/contenido';
import { emitir } from '@/lib/analitica';

const ICONOS = { deposito: Wallet, cancelacion: Undo2, clima: CloudSun, bordo: Ship } as const;

export function Condiciones() {
  return (
    <section id="terms" aria-labelledby="condiciones-titulo" className="relative py-12 md:py-20">
      <div className="contenedor relative">
        <motion.div variants={entrada} {...enVista}>
          <Antetitulo>{condiciones.antetitulo}</Antetitulo>
        </motion.div>
        <CabeceraSeccion titulo={condiciones.titulo} ancho="max-w-[16ch]" className="mt-4" idTitulo="condiciones-titulo">
          {condiciones.intro}
        </CabeceraSeccion>

        <motion.ul variants={escalonado(0.08)} {...enVista} className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 lg:gap-4">
          {condiciones.bloques.map((b) => {
            const Icono = ICONOS[b.id as keyof typeof ICONOS];
            return (
              <motion.li key={b.id} variants={entradaTarjeta} className="rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.015))] p-6 ring-1 ring-inset ring-texto/10">
                <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-sol/10 text-sol ring-1 ring-sol/40">
                  <Icono size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-[21px] md:text-[22px]">{b.titulo}</h3>
                <ul className="mt-3 space-y-2.5 text-[15px] leading-[1.5] text-texto-2">
                  {b.puntos.map((p) => (
                    <li key={p} className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-sol/70">
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.details variants={entrada} {...enVista} onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && emitir('terms_open')} className="group mt-4 rounded-[24px] ring-1 ring-inset ring-texto/10 lg:mt-5">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 rounded-[24px] px-6 py-4 text-[16px] font-semibold text-texto hover:text-sol focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-mar [&::-webkit-details-marker]:hidden">
            <FileText size={19} strokeWidth={1.75} aria-hidden className="shrink-0 text-sol" />
            <span className="flex-1">{condiciones.desplegable}</span>
            <ChevronDown size={20} aria-hidden className="shrink-0 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="grid gap-x-12 gap-y-8 border-t border-texto/10 px-6 pb-8 pt-6 md:grid-cols-2">
            {condiciones.legal.map((g) => (
              <div key={g.titulo}>
                <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-texto-3">{g.titulo}</h4>
                <ul className="mt-3 space-y-2 text-[14.5px] leading-[1.55] text-texto-2">
                  {g.puntos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.details>
      </div>
    </section>
  );
}
