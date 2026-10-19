// Baños a bordo (MA-83, 15/10). Va tras el visor del barco: es parte del venue. Texto a la izquierda y
// tres fotos (una grande y dos pequeñas) a la derecha; en móvil, debajo. Mientras no lleguen las fotos
// reales, cada hueco es un marco discontinuo con su nombre y el aviso de pendiente; sin fotos y con
// VITE_OCULTAR_PENDIENTES=1 la sección no se pinta (cómo meterlas: ver `banos` en contenido.ts).
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ImageIcon } from 'lucide-react';
import { Acento, Antetitulo, Foto } from '@/components/ui';
import { Pendiente } from '@/components/Pendiente';
import { entrada, entradaTarjeta, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';
import { banos } from '@/data/contenido';

const OCULTAR = import.meta.env.VITE_OCULTAR_PENDIENTES === '1';

export function Banos() {
  // Oculta mientras Marketing no mande las fotos y los datos (punto 05, 15/10).
  if (!banos.visible) return null;
  const conFotos = banos.fotos.length > 0;
  if (!conFotos && OCULTAR) return null;
  const celdas = conFotos ? banos.fotos.slice(0, 3) : banos.huecos.map((h) => ({ nombre: '', alt: h }));
  return (
    <section id="restrooms" aria-labelledby="banos-titulo" className="relative py-12 md:py-20">
      <div className="contenedor grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
        <div>
          <motion.div variants={entrada} {...enVista}>
            <Antetitulo>{banos.antetitulo}</Antetitulo>
          </motion.div>
          <motion.h2 id="banos-titulo" variants={entradaTitulo} {...enVista} className="mt-4 max-w-[12ch] text-[40px] md:text-[56px]">
            <Acento texto={banos.titulo} />
          </motion.h2>
          <motion.p variants={entrada} {...enVista} className="mt-5 max-w-[40ch] text-[17px] text-texto-2 md:text-[18px]">
            {banos.texto}
          </motion.p>
          <motion.p variants={entrada} {...enVista} className="mt-6 w-fit max-w-full rounded-[16px] bg-sol px-4 py-3.5 text-[15.5px] font-medium text-noche">
            <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-noche/70">Your business gets</span>
            <span className="mt-1 block">{banos.negocio}</span>
          </motion.p>
          {!conFotos ? <Pendiente className="mt-5 flex w-fit max-w-full">{banos.pendiente}</Pendiente> : null}
        </div>
        <motion.ul variants={escalonado(0.1)} {...enVista} className="grid grid-cols-2 gap-3 md:gap-4">
          {celdas.map((c, i) => (
            <motion.li
              key={i}
              variants={entradaTarjeta}
              className={clsx('relative overflow-hidden rounded-[20px]', i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]', !conFotos && 'border border-dashed border-texto/25 bg-texto/[0.04]')}
            >
              {conFotos ? (
                <Foto nombre={c.nombre} alt={c.alt} sizes={i === 0 ? '(min-width: 1200px) 55vw, 100vw' : '(min-width: 1200px) 27vw, 50vw'} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-texto-3">
                  <ImageIcon size={i === 0 ? 30 : 22} strokeWidth={1.6} aria-hidden />
                  <span className="text-[13px]">{c.alt}</span>
                </div>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
