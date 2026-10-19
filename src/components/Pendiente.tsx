// Marca lo que el PDF deja entre corchetes y aún no está verificado: se VE en la preview (para que
// Marketing sepa qué falta) pero discreto. Lista completa en PENDIENTES.md.
// Con VITE_OCULTAR_PENDIENTES=1 (publicación final) no se pinta.
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

const OCULTAR = import.meta.env.VITE_OCULTAR_PENDIENTES === '1';

export function Pendiente({ children, className, claro }: { children: ReactNode; className?: string; claro?: boolean }) {
  if (OCULTAR) return null;
  return (
    <span
      data-pendiente
      className={clsx(
        'inline-flex items-baseline gap-1.5 rounded-md border border-dashed px-2 py-0.5 text-[12.5px] font-medium leading-snug',
        claro ? 'border-noche/30 bg-noche/[0.04] text-noche/70' : 'border-sol/45 bg-sol/[0.08] text-sol-claro/85',
        className,
      )}
    >
      <span aria-hidden className={claro ? 'text-mar' : 'text-sol'}>
        ◆
      </span>
      <span>
        <span className="sr-only">Pending: </span>
        {children}
      </span>
    </span>
  );
}
