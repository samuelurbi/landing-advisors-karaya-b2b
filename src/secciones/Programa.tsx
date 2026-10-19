// La alianza (punto 10, Marketing 15/10): sin pasos ni bloque de comisión. Una sola frase, la que
// indicaron, en grande sobre el fondo, y el botón al formulario.
import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';
import { Acento, Antetitulo, BotonEnlace } from '@/components/ui';
import { Mural, SombraPalma } from '@/components/marca';
import { entrada, entradaTitulo, enVista } from '@/lib/movimiento';
import { programa } from '@/data/contenido';

export function Programa() {
  return (
    <section id="partnership" aria-labelledby="programa-frase" className="relative overflow-hidden py-16 md:py-24">
      <Mural nombre="borde-reserva-izquierda" ancho={675} alto={900} clase="left-0 top-[10%] hidden w-[15%] max-w-[240px] xl:block" />
      <SombraPalma variante={5} lado="derecha" intensidad={0.25} className="top-0" />
      <div className="contenedor relative">
        <motion.div variants={entrada} {...enVista} className="flex items-center gap-4">
          <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-sol/10 text-sol ring-1 ring-sol/40">
            <Handshake size={22} strokeWidth={1.75} />
          </span>
          <Antetitulo>{programa.antetitulo}</Antetitulo>
        </motion.div>
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
          <motion.h2 id="programa-frase" variants={entradaTitulo} {...enVista} className="max-w-[22ch] text-[34px] md:text-[52px]">
            <Acento texto={programa.frase} />
          </motion.h2>
          <motion.div variants={entrada} {...enVista}>
            <BotonEnlace href="#join" tamano="lg" flecha origen="programa" className="!rounded-full">
              {programa.cta}
            </BotonEnlace>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
