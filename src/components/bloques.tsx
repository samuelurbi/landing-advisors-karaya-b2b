// Bloques del sistema de la web de Karaya (components/bloques.tsx y Visor.tsx), adaptados a la
// landing: panel con divisiones y luz de borde, titular de sección.
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Acento } from '@/components/ui';
import { useLuzBorde } from '@/lib/luzBorde';
import { entrada, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';

// Titular de sección a la izquierda y, opcional, texto a la derecha alineado a su base.
export function CabeceraSeccion({ titulo, children, className, ancho = 'max-w-[18ch]', idTitulo }: { titulo: string; children?: ReactNode; className?: string; ancho?: string; idTitulo?: string }) {
  return (
    <div className={clsx('grid gap-5 md:grid-cols-[1fr_1fr] md:items-end md:gap-16', className)}>
      <motion.h2 id={idTitulo} variants={entradaTitulo} {...enVista} className={clsx('text-[38px] md:text-[56px]', ancho)}>
        <Acento texto={titulo} />
      </motion.h2>
      {children ? (
        <motion.div variants={entrada} {...enVista} className="max-w-[52ch] text-[17px] text-texto-2 md:justify-self-end md:text-[18px]">
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}

// ─── Panel con divisiones (pasos, ventajas) ───────────────────────────────────
type Celda = { titulo: ReactNode; texto?: ReactNode; icono?: LucideIcon; numero?: string };
function Divisor({ movil, escritorio, vertical }: { movil: boolean; escritorio: boolean; vertical?: boolean }) {
  if (!movil && !escritorio) return null;
  const visible = movil && escritorio ? 'block' : movil ? 'block md:hidden' : 'hidden md:block';
  return <span aria-hidden className={clsx('luz-cursor absolute left-0 top-0 bg-texto/10', vertical ? 'h-full w-px' : 'h-px w-full', visible)} />;
}

export function Panel({ celdas, columnas = 3, className }: { celdas: Celda[]; columnas?: 2 | 3 | 4; className?: string }) {
  const luz = useLuzBorde<HTMLDivElement>();
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[columnas];
  return (
    <div ref={luz} className={clsx('borde-luz borde-luz-fino relative rounded-[24px] border border-texto/10', className)}>
      <motion.ol variants={escalonado(0.1)} {...enVista} className={clsx('group/pasos grid overflow-hidden rounded-[23px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.06),rgb(var(--ky-texto)/0.015))] backdrop-blur-xl', cols)}>
        {celdas.map((c, i) => {
          const Icono = c.icono;
          return (
            <motion.li key={i} variants={entrada} className="group/paso relative transition-colors duration-300 [@media(hover:hover)]:hover:bg-texto/[0.05]">
              <Divisor movil={false} escritorio={i % columnas !== 0} vertical />
              <Divisor movil={i > 0} escritorio={i >= columnas} />
              <div className="flex gap-5 p-5 transition-opacity duration-300 md:block md:p-8 [@media(hover:hover)]:group-hover/pasos:opacity-50 [@media(hover:hover)]:group-hover/paso:!opacity-100">
                {Icono || c.numero ? (
                  <div className="flex shrink-0 items-center gap-4 md:justify-between">
                    {Icono ? (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sol/10 text-sol ring-1 ring-sol/40 transition-colors duration-300 [@media(hover:hover)]:group-hover/paso:bg-sol [@media(hover:hover)]:group-hover/paso:text-noche">
                        <Icono size={22} strokeWidth={1.75} />
                      </span>
                    ) : null}
                    {c.numero ? (
                      <span aria-hidden className={clsx('display leading-none transition-colors duration-300', Icono ? 'hidden text-[56px] text-texto/15 md:block [@media(hover:hover)]:group-hover/paso:text-sol' : 'w-[1.4em] text-[44px] text-sol md:w-auto md:text-[64px]')}>
                        {c.numero}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className={Icono || c.numero ? 'md:mt-7' : ''}>
                  <h3 className="text-[22px] md:text-[25px]">{c.titulo}</h3>
                  {c.texto ? <div className="mt-2 text-[15px] leading-[1.5] text-texto-2 md:text-[16px]">{c.texto}</div> : null}
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}
