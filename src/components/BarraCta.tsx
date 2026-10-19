import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { BotonEnlace } from './ui';

// CTA fijo que acompaña el recorrido. Iteración 1 (13/10, Samuel: que nunca tape contenido; mismo
// criterio que en Hispaniola): ya no es una cápsula ancha centrada sino un botón compacto en la
// esquina inferior derecha, y se calla
// - en las secciones que ya tienen su propio CTA o controles abajo: hero, visor del barco (botón
//   «Take the tour»), escena de la velada (tarjeta), planificador (tarjeta del brief), puente a
//   Hispaniola, programa, formulario, cierre y pie;
// - y, por si acaso, en cuanto quedaría encima de texto o de un control (se mira qué hay debajo de
//   su caja en cada frame de scroll).
const SECCIONES_CON_CTA = ['#hero', '#the-boat', '#the-evening', '#plan', '#two-brands', '#partnership', '#join', 'footer', '[data-cierre]'];
const INTERACTIVO = 'a, button, input, select, textarea, label, [role="tab"]';

// ¿Hay texto o un control bajo la caja del botón? Se prueban nueve puntos de la caja.
function tapa(caja: DOMRect, propio: Element) {
  for (const fx of [0.08, 0.5, 0.92])
    for (const fy of [0.1, 0.5, 0.9]) {
      const capas = document.elementsFromPoint(caja.left + caja.width * fx, caja.top + caja.height * fy);
      for (const el of capas) {
        if (propio.contains(el) || el === document.body || el === document.documentElement) continue;
        if (el.matches(INTERACTIVO)) return true;
        if ([...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())) return true;
      }
    }
  return false;
}

export function BarraCta() {
  const [enSeccionLibre, setEnSeccionLibre] = useState(false);
  const [libre, setLibre] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const visible = enSeccionLibre && libre;
  // Oculta = fuera del orden de tabulación (React 18 no tipa `inert` como prop).
  useEffect(() => {
    if (ref.current) ref.current.inert = !visible;
  }, [visible]);

  useEffect(() => {
    const vigilados = SECCIONES_CON_CTA.map((s) => document.querySelector(s)).filter((el): el is Element => !!el);
    const enVista = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => enVista.set(e.target, e.isIntersecting));
        setEnSeccionLibre(![...enVista.values()].some(Boolean));
      },
      { threshold: 0 },
    );
    vigilados.forEach((el) => {
      enVista.set(el, true);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Guarda contra tapar texto: se comprueba en scroll y al cambiar el tamaño (una vez por frame).
  useEffect(() => {
    if (!enSeccionLibre) return;
    let raf = 0;
    const mirar = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      // La caja donde quedará el botón (oculto está desplazado hacia abajo): esquina inferior
      // derecha con el margen de .barra-cta.
      const m = innerWidth >= 900 ? 24 : 16;
      const w = el.offsetWidth, h = el.offsetHeight;
      setLibre(!tapa(new DOMRect(document.documentElement.clientWidth - m - w, innerHeight - m - h, w, h), el));
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(mirar);
    };
    pedir();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
    };
  }, [enSeccionLibre]);

  return (
    <div className={clsx('barra-cta', visible && 'barra-cta--visible')} ref={ref} aria-hidden={!visible}>
      <BotonEnlace href="#join" nivel="primario" tamano="sm" origen="barra-registro" flecha className="group whitespace-nowrap !rounded-full shadow-[0_12px_30px_-12px_rgb(0_0_0/0.7)]">
        Become a partner
      </BotonEnlace>
    </div>
  );
}
