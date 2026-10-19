// Cierre a sangre con la fiesta en cubierta, que va bajo el contenido con el efecto «revelado».
import { motion, useReducedMotion } from 'framer-motion';
import { Acento, BotonEnlace, Foto } from '@/components/ui';
import { entradaTitulo, enVista } from '@/lib/movimiento';
import { cierre, cta } from '@/data/contenido';

export function Cierre() {
  const quieto = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden">
      <motion.div aria-hidden className="absolute inset-0 -z-10" initial={quieto ? false : { scale: 1.12 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}>
        <Foto nombre="karaya-punta-cana-deck-party-crowd" alt="" posicion="50% 45%" sizes="100vw" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(var(--ky-noche)/0.7),rgb(var(--ky-noche)/0.2)_65%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(var(--ky-hondo))_0%,rgb(var(--ky-hondo)/0.85)_14%,rgb(var(--ky-hondo)/0.5)_42%,rgb(var(--ky-hondo)/0.15)_80%)]" />
      <div className="contenedor flex min-h-[560px] flex-col justify-end pb-12 pt-40 md:min-h-[660px] md:pb-14">
        <motion.h2 variants={entradaTitulo} {...enVista} className="max-w-[16ch] text-[40px] leading-[1.02] md:text-[64px]">
          <Acento texto={cierre.titulo} />
        </motion.h2>
        <p className="mt-5 max-w-[46ch] text-[17px] text-texto/85 md:text-[19px]">{cierre.texto}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3 md:gap-4">
          <BotonEnlace href="#join" tamano="lg" flecha origen="cierre" className="!rounded-full">
            {cta.partner}
          </BotonEnlace>
          <BotonEnlace href="#the-boat" tamano="lg" nivel="vidrio" origen="cierre-barco" className="!rounded-full">
            {cta.barco}
          </BotonEnlace>
        </div>
      </div>
    </section>
  );
}
