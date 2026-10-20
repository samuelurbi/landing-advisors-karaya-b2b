// «Built for your business»: lo que gana la agencia (no solo el advisor), en un bento abierto con los
// objetos 3D de la casa. Sin sombras ni cajas pesadas (Kevin): celdas con filete fino y luz de borde;
// al pasar por encima el objeto se inclina y flota. Sin cifras: niveles y bonos con número quedan
// fuera por la regla de comisión del grupo.
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Acento, Antetitulo } from '@/components/ui';
import { useLuzBorde } from '@/lib/luzBorde';
import { medio } from '@/lib/medios';
import { entrada, entradaTarjeta, entradaTitulo, enVista, escalonado } from '@/lib/movimiento';
import { marca, negocio } from '@/data/contenido';

type Item = (typeof negocio.items)[number] & { grande?: boolean; contacto?: boolean };

// Iteración 1 (Samuel: los objetos flotaban completos y «colocados»): cada objeto es más grande que
// su hueco, asoma por el borde superior de la tarjeta y queda recortado por otro (el derecho o el
// inferior). El recorte lo hace un clip-path de la tarjeta que se abre solo hacia arriba.
// El barco trae mucho aire transparente arriba y abajo: va más grande para pesar lo mismo.
const AMPLIAR: Record<string, string> = { 'objeto-01-barco': 'scale-[1.35] origin-top-right' };

function Objeto({ nombre, grande }: { nombre: string; grande?: boolean }) {
  return (
    <img
      aria-hidden
      alt=""
      src={medio(`/objetos/${nombre}-360.webp`)}
      srcSet={medio(`/objetos/${nombre}-360.webp 360w, /objetos/${nombre}-640.webp 640w`)}
      sizes={grande ? '(min-width: 640px) 380px, 280px' : '(min-width: 640px) 220px, 180px'}
      width={360}
      height={360}
      loading="lazy"
      decoding="async"
      className={clsx(
        'pointer-events-none absolute select-none object-contain transition-transform duration-700 ease-suave motion-reduce:transition-none [@media(hover:hover)]:group-hover:-translate-y-2 [@media(hover:hover)]:group-hover:-rotate-3',
        AMPLIAR[nombre],
        grande
          ? // Grande: asoma por arriba a la derecha y lo corta el borde inferior.
            '-top-12 right-[-8%] h-[280px] w-[280px] rotate-[-8deg] sm:-top-10 sm:right-[2%] sm:h-[380px] sm:w-[380px]'
          : // Pequeña: asoma por arriba y lo corta el borde derecho.
            '-right-10 -top-12 h-[180px] w-[180px] rotate-[10deg] md:-right-12 md:-top-14 md:h-[210px] md:w-[210px]',
      )}
    />
  );
}

// El recorte: se abre 120 px por arriba (por donde asoma el objeto) y ciñe los otros tres lados.
const RECORTE = { clipPath: 'inset(-120px -1px -1px -1px round 24px)' };

function Celda({ it, ultima }: { it: Item; ultima: boolean }) {
  return (
    <motion.li
      variants={entradaTarjeta}
      style={RECORTE}
      className={clsx(
        'borde-luz group relative flex rounded-[24px] bg-[linear-gradient(170deg,rgb(var(--ky-texto)/0.07),rgb(var(--ky-texto)/0.015))] ring-1 ring-inset ring-texto/10 transition-[ring-color] duration-500 hover:ring-texto/25',
        it.grande ? 'min-h-[430px] flex-col justify-end p-6 sm:col-span-2 sm:min-h-[260px] md:p-8' : 'min-h-[340px] flex-col justify-end p-6 md:min-h-[370px]',
        // En dos columnas, la última pequeña se queda sola: ocupa la fila.
        ultima && !it.grande && 'sm:col-span-2 lg:col-span-1',
        // Con los tres contactos el texto es más alto: hueco arriba para que no suba bajo el objeto.
        it.contacto && 'pt-36 md:pt-40',
      )}
    >
      <Objeto nombre={it.objeto} grande={it.grande} />
      <div className={clsx('relative', it.grande ? 'sm:max-w-[30ch]' : 'max-w-[30ch]')}>
        <h3 className={clsx(it.grande ? 'text-[26px] md:text-[32px]' : 'text-[21px] md:text-[22px]')}>{it.titulo}</h3>
        <p className="mt-2 text-[15.5px] font-semibold leading-[1.4] text-sol">{it.lema}</p>
        <p className="mt-1.5 text-[15px] leading-[1.5] text-texto-2">{it.texto}</p>
        {/* Punto 11 (Marketing 15/10): los tres contactos en esta tarjeta y en el pie, sin plazo de respuesta. */}
        {it.contacto ? (
          <div className="mt-3 flex flex-col">
            <a href={`mailto:${marca.email}`} className="inline-flex min-h-[44px] max-w-full items-center break-all text-[15px] font-semibold text-texto underline decoration-sol/60 underline-offset-4 hover:decoration-sol">
              {marca.email}
            </a>
            {marca.telefonos.map((t) => (
              <a key={t.tel} href={`tel:${t.tel}`} className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-texto hover:text-sol">
                <span className="font-medium text-texto-3">{t.etiqueta}</span> {t.numero}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </motion.li>
  );
}

export function Negocio() {
  const luz = useLuzBorde<HTMLDivElement>();
  return (
    <section id="business" aria-labelledby="negocio-titulo" className="relative overflow-x-clip py-16 md:py-24">
      <div ref={luz} className="contenedor relative">
        <motion.div variants={entrada} {...enVista}>
          <Antetitulo>{negocio.antetitulo}</Antetitulo>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end md:gap-16">
          <motion.h2 id="negocio-titulo" variants={entradaTitulo} {...enVista} className="mt-4 max-w-[16ch] text-[40px] md:text-[60px]">
            <Acento texto={negocio.titulo} />
          </motion.h2>
          <motion.div variants={entrada} {...enVista} className="max-w-[52ch] md:justify-self-end">
            <p className="text-[19px] font-semibold text-texto md:text-[21px]">{negocio.subtitulo}</p>
            <p className="mt-3 text-[16px] text-texto-2 md:text-[17px]">{negocio.intro}</p>
          </motion.div>
        </div>
        <motion.ul variants={escalonado(0.08)} {...enVista} className="mt-20 grid gap-x-3 gap-y-16 sm:grid-cols-2 md:mt-24 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-20">
          {(negocio.items as readonly Item[]).map((it, i, todos) => (
            <Celda key={it.id} it={it} ultima={i === todos.length - 1} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
