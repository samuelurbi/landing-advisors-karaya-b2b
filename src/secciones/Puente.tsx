// El puente a Hispaniola (la piscina natural): Karaya es la celebración y la marca hermana cubre el
// día. Una sola conversación de partnership para las dos. MA-83 (15/10): sin el Museo, que es solo de
// Hispaniola; con una sola pieza, la foto ocupa toda la columna.
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Acento, Antetitulo, BotonEnlace, Foto } from '@/components/ui';
import { Mural } from '@/components/marca';
import { useLuzBorde } from '@/lib/luzBorde';
import { entradaTarjeta, enVista, escalonado } from '@/lib/movimiento';
import { puente as p } from '@/data/contenido';

export function Puente() {
  const luzPuente = useLuzBorde<HTMLDivElement>();
  const una = p.piezas.length === 1;
  return (
    <section id="two-brands" aria-label={p.antetitulo} className="relative overflow-hidden">
      <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[4%] hidden w-[15%] max-w-[240px] xl:block" />
      <div className="contenedor relative py-16 md:py-24">
        {/* Puente a Hispaniola: tarjeta clara (la de la sección del barco de la web) + foto. */}
        <div ref={luzPuente} className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <motion.div variants={entradaTarjeta} {...enVista} className="acento-mar tarjeta-clara flex flex-col justify-between rounded-[24px] bg-texto p-7 text-noche md:p-10">
            <div>
              <Antetitulo className="text-mar-hondo">{p.antetitulo}</Antetitulo>
              <h2 className="mt-4 max-w-[14ch] text-[34px] leading-[1.02] md:text-[46px]">
                <Acento texto={p.titulo} />
              </h2>
              <p className="mt-5 max-w-[40ch] text-[17px] text-noche/75">{p.texto}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <BotonEnlace href="#join" nivel="marino" flecha origen="puente-hispaniola">
                Talk to us about both brands
              </BotonEnlace>
            </div>
          </motion.div>
          <motion.ul variants={escalonado(0.12)} {...enVista} className={clsx('grid gap-4', !una && 'sm:grid-cols-2')}>
            {p.piezas.map((x) => (
              <motion.li key={x.titulo} variants={entradaTarjeta} className="borde-luz group relative flex flex-col rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.08),rgb(var(--ky-texto)/0.02))] p-2.5 ring-1 ring-texto/10 transition-[transform,ring-color] duration-500 ease-suave hover:-translate-y-1.5 hover:ring-texto/25 motion-reduce:transform-none">
                <div className={clsx('relative overflow-hidden rounded-[18px]', una ? 'aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[340px] lg:flex-1' : 'aspect-[4/3.6]')}>
                  <div className="h-full w-full transition-transform duration-[900ms] ease-suave group-hover:scale-[1.06] lg:absolute lg:inset-0">
                    <Foto nombre={x.foto} alt={x.alt} sizes={una ? '(min-width: 1200px) 55vw, 100vw' : '(min-width: 1200px) 28vw, (min-width: 640px) 45vw, 100vw'} />
                  </div>
                  <span className="vidrio absolute left-3 top-3 rounded-full px-3 py-1.5 text-[12px] font-semibold text-texto">{x.etiqueta}</span>
                </div>
                <div className="px-3 pb-3 pt-5">
                  <h3 className="display text-[24px]">{x.titulo}</h3>
                  <p className="mt-1.5 text-[15px] text-texto-2">{x.texto}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
