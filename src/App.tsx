// Versión B2B (13/10): para agencias, tour operadores, DMCs, mayoristas y planners, no solo
// advisors. Orden: el hero con los momentos que se venden → el barco en 3D (qué gana el cliente y
// qué gana el negocio en cada punto, con la foto real de cada zona) → los baños a bordo → la velada de la hora dorada a la noche → el planificador del
// brief → lo que gana la agencia → el puente a Hispaniola → la alianza y la comisión → las condiciones para socios → formulario.
import { MotionConfig } from 'framer-motion';
import { Shell } from '@/components/Shell';
import { Preloader } from '@/components/Preloader';
import { Hero } from '@/secciones/Hero';
import { Recorrido } from '@/secciones/Recorrido';
import { Banos } from '@/secciones/Banos';
import { Velada } from '@/secciones/Velada';
import { Plan } from '@/secciones/Plan';
import { Negocio } from '@/secciones/Negocio';
import { Puente } from '@/secciones/Puente';
import { Programa } from '@/secciones/Programa';
import { Condiciones } from '@/secciones/Condiciones';
import { Registro } from '@/secciones/Registro';
import { Cierre } from '@/secciones/Cierre';

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <Shell cierre={<Cierre />}>
        <Hero />
        <Recorrido />
        <Banos />
        <Velada />
        <Plan />
        <Negocio />
        <Puente />
        <Programa />
        <Condiciones />
        <Registro />
      </Shell>
    </MotionConfig>
  );
}
