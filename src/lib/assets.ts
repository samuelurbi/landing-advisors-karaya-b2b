// Cada foto existe en 1600 px y en 800 px (-800), en public/img (copiadas de la web de Karaya).
import { medio } from '@/lib/medios';

export const img = (nombre: string, ancho: 800 | 1600 = 1600) => medio(`/img/${nombre}${ancho === 800 ? '-800' : ''}.webp`);
export const srcset = (nombre: string) => `${img(nombre, 800)} 800w, ${img(nombre)} 1600w`;
