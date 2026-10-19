// Primitivas de interfaz (las de la web de Karaya). Un solo acento de acción: el amarillo (sol).
// Aquí no hay rutas: los botones son anclas a secciones de la propia página o enlaces externos.
import type { ComponentProps, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { img, srcset } from '@/lib/assets';
import dimensiones from '@/data/dimensiones.json';
import { emitir } from '@/lib/analitica';

type Nivel = 'primario' | 'secundario' | 'vidrio' | 'marino' | 'terciario';
type Tamano = 'md' | 'lg' | 'sm';

const base = 'group inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-suave active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';
const niveles: Record<Nivel, string> = {
  primario: 'hoja-sm bg-sol text-noche hover:bg-sol-hondo shadow-[0_1px_0_rgb(0_0_0/0.06)]',
  secundario: 'hoja-sm border-2 border-texto text-texto hover:bg-texto hover:text-noche',
  vidrio: 'hoja-sm vidrio text-texto hover:bg-texto hover:text-noche',
  marino: 'hoja-sm bg-noche text-texto hover:bg-fondo-3',
  terciario: 'min-h-[44px] text-mar-texto underline decoration-2 underline-offset-[6px] hover:decoration-sol',
};
const tamanos: Record<Tamano, string> = {
  sm: 'min-h-[44px] px-4 text-[15px]',
  md: 'min-h-[52px] px-6 text-[16px]',
  lg: 'min-h-[60px] px-8 text-[17px]',
};

export function clasesBoton(nivel: Nivel = 'primario', tamano: Tamano = 'md') {
  return clsx(base, niveles[nivel], nivel !== 'terciario' && tamanos[tamano]);
}

type Comun = { nivel?: Nivel; tamano?: Tamano; origen?: string; flecha?: boolean; children: ReactNode; className?: string };

export function Boton({ nivel, tamano, flecha, children, className, origen: _o, ...rest }: Comun & Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button {...rest} className={clsx(clasesBoton(nivel, tamano), className)}>
      {children}
      {flecha ? <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" /> : null}
    </button>
  );
}

// Enlace con forma de botón: ancla interna (#registro) o externo (↗). Siempre mide el clic.
export function BotonEnlace({ href, nivel, tamano, origen, flecha, children, className, onClick }: Comun & { href: string; onClick?: () => void }) {
  const externo = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(externo ? { target: '_blank', rel: 'noopener' } : {})}
      className={clsx(clasesBoton(nivel, tamano), className)}
      onClick={() => {
        emitir('cta_click', { destino: href, origen });
        onClick?.();
      }}
    >
      {children}
      {externo ? <ArrowUpRight size={18} /> : flecha ? <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" /> : null}
    </a>
  );
}

// Acento: en los titulares, `*palabra*` se pinta en Gilroy itálica y amarillo.
export function Acento({ texto }: { texto: string }) {
  const partes = texto.split(/(\*[^*]+\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') ? (
          <em key={i} className="acento">
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
export const sinMarcas = (s: string) => s.replace(/\*/g, '');

// Foto responsive (1600/800 WebP). `prioridad` para la del hero: sin lazy y con fetchpriority.
export function Foto({ nombre, alt, className, sizes = '100vw', prioridad, posicion }: { nombre: string; alt: string; className?: string; sizes?: string; prioridad?: boolean; posicion?: string }) {
  const [ancho, alto] = (dimensiones as Record<string, number[]>)[nombre] ?? [];
  return (
    <img
      width={ancho}
      height={alto}
      src={img(nombre)}
      srcSet={srcset(nombre)}
      sizes={sizes}
      alt={alt}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding={prioridad ? 'sync' : 'async'}
      {...(prioridad ? { fetchpriority: 'high' } : {})}
      className={clsx('block h-full w-full object-cover', className)}
      style={posicion ? { objectPosition: posicion } : undefined}
    />
  );
}

// Antetítulo (como los del PDF: mayúsculas espaciadas). En la web van en texto-3; aquí en amarillo
// solo el del hero, el resto en texto-3.
export function Antetitulo({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx('text-[12px] font-semibold uppercase tracking-[0.16em] md:text-[13px]', className ?? 'text-texto-3')}>{children}</p>;
}
