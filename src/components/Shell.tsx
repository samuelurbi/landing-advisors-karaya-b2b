// Marco de la landing: la cabecera, el pie y el «revelado» de la web de Karaya, con anclas en vez
// de rutas. Un solo primario en la cabecera: «Become a partner». Sin WhatsApp (el de clientes finales no
// se usa para socios).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { BarraCta } from './BarraCta';
import { clsx } from 'clsx';
import { ArrowUpRight, Mail, Menu, Phone, X } from 'lucide-react';
import { Logo, PalabraKaraya } from '@/components/marca';
import { BotonEnlace } from '@/components/ui';
import { listo, usePreloader } from '@/lib/preloader';
import { medio } from '@/lib/medios';
import { vigilarSecciones } from '@/lib/analitica';
import { cta, marca, nav, pie } from '@/data/contenido';

const enlaceNav = (activo: boolean) =>
  clsx(
    'relative flex min-h-[38px] items-center rounded-full px-3.5 text-[14px] font-medium transition-colors',
    activo ? 'bg-texto/[0.16] text-texto' : 'text-texto/85 hover:bg-texto/[0.08] hover:text-texto',
  );

// Sección visible para marcar la pestaña activa de la navegación. Se observan TODAS las secciones
// (también las que no están en el menú) para que la pestaña se apague al salir de la suya.
const SECCIONES = ['hero', 'the-boat', 'the-evening', 'plan', 'business', 'two-brands', 'partnership', 'join'];
function useSeccionActiva() {
  const [activa, setActiva] = useState('');
  useEffect(() => {
    const ids = SECCIONES;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActiva(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return activa;
}

function LogoCabecera() {
  const fase = usePreloader();
  return (
    <span id="logo-cabecera" className={fase === 'fin' ? 'block' : 'invisible block'}>
      <Logo className="w-[118px] md:w-[136px]" />
    </span>
  );
}

// Cabecera sobre el hero: transparente arriba, desenfoque progresivo al hacer scroll; el primario
// va en vidrio mientras se ve el hero (ahí el amarillo lo lleva el CTA del propio hero).
function Cabecera() {
  const [abierto, setAbierto] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [pasadoHero, setPasadoHero] = useState(false);
  const activa = useSeccionActiva();
  useEffect(() => {
    const f = () => {
      setScroll(window.scrollY > 24);
      setPasadoHero(window.scrollY > window.innerHeight * 0.75);
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
  }, [abierto]);

  return (
    // Solo el menú es fijo: el logo y «Become a partner» forman parte de la página y se van con
    // el scroll. En escritorio queda fija la píldora de navegación (centrada, a la altura de la
    // fila de la cabecera); en móvil, el botón del menú.
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="contenedor flex h-[var(--ky-cabecera)] items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <a href="#top" className="-ml-1 shrink-0 p-1 lg:justify-self-start" aria-label="Karaya Punta Cana · Partners">
          <LogoCabecera />
        </a>
        <span aria-hidden className="hidden lg:block" />
        <div className="flex items-center gap-2 pr-12 lg:justify-self-end lg:pr-0">
          <BotonEnlace href="#join" nivel={pasadoHero ? 'primario' : 'vidrio'} tamano="sm" origen="cabecera" className="!rounded-full !px-4 md:!px-5">
            {cta.partner}
          </BotonEnlace>
        </div>
      </div>
      <nav
        className={clsx(
          'vidrio fixed left-1/2 top-[calc((var(--ky-cabecera)-46px)/2)] z-40 hidden -translate-x-1/2 items-center gap-0.5 rounded-full p-1 transition-[background-color] duration-300 lg:flex',
          scroll && 'nav-fija--sobre',
        )}
        aria-label="Main"
      >
        {nav.map((n) => (
          <a key={n.href} href={n.href} className={enlaceNav(activa === n.href.slice(1))}>
            {n.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={clsx('vidrio fixed right-4 top-[calc((var(--ky-cabecera)-44px)/2)] z-40 flex h-11 w-11 items-center justify-center rounded-full sm:right-6 md:right-10 lg:hidden', scroll && 'nav-fija--sobre')}
        aria-label="Menu"
        aria-expanded={abierto}
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {abierto ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-fondo lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(var(--ky-sol)/0.35),transparent_65%)]" />
            <div className="contenedor relative flex h-[var(--ky-cabecera)] shrink-0 items-center justify-between">
              <Logo className="w-[118px]" />
              <button type="button" onClick={() => setAbierto(false)} className="vidrio -mr-1 flex h-11 w-11 items-center justify-center rounded-full" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <nav className="contenedor relative mt-6 flex flex-col" aria-label="Main">
              {nav.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setAbierto(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * i } }}
                  className="display flex min-h-[64px] items-center border-b border-texto/10 text-[30px]"
                >
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <div className="contenedor relative mt-auto flex flex-col gap-3 pb-8 pt-6">
              <BotonEnlace href="#join" origen="menu-movil" flecha onClick={() => setAbierto(false)} className="!rounded-full">
                {cta.partner}
              </BotonEnlace>
              <BotonEnlace href="#the-boat" nivel="secundario" origen="menu-movil-barco" onClick={() => setAbierto(false)} className="!rounded-full">
                {cta.barco}
              </BotonEnlace>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

// Pie: el de la web (esquinas de mural, «Karaya» gigante tenue), reducido a lo que pide el PDF:
// marca y lugar, el partner desk (correo y teléfonos que dio Karaya) y la web principal.
function Pie() {
  return (
    <footer className="relative overflow-hidden bg-hondo text-texto">
      <img aria-hidden src={medio('/img/karaya-esquina-izquierda.webp')} alt="" width={900} height={675} loading="lazy" decoding="async" className="pointer-events-none absolute bottom-0 left-0 w-[46%] max-w-[460px] select-none md:w-[27%]" />
      <img aria-hidden src={medio('/img/karaya-esquina-derecha.webp')} alt="" width={900} height={675} loading="lazy" decoding="async" className="pointer-events-none absolute bottom-0 right-0 w-[46%] max-w-[460px] select-none md:w-[27%]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-[58%] justify-center opacity-[0.05]">
        <PalabraKaraya className="w-[110%] max-w-none md:w-[62%]" />
      </div>

      <div className="contenedor relative grid gap-y-8 pb-10 pt-12 md:grid-cols-[1.3fr_1fr] md:gap-x-16 md:pb-28 md:pt-16">
        <div>
          <Logo className="w-[150px]" />
          <p className="mt-4 max-w-[30ch] text-[16px] text-texto/80">{pie.lema}</p>
        </div>
        <div>
          <p className="pb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-texto-3">Partner desk</p>
          <ul className="space-y-1 text-[15px] text-texto/85">
            <li>
              <a href={`mailto:${marca.email}`} className="flex min-h-[44px] items-center gap-2 hover:text-sol">
                <Mail size={17} /> {marca.email}
              </a>
            </li>
            {marca.telefonos.map((t) => (
              <li key={t.tel}>
                <a href={`tel:${t.tel}`} className="flex min-h-[44px] items-center gap-2 hover:text-sol">
                  <Phone size={17} /> <span className="text-texto-3">{t.etiqueta}</span> {t.numero}
                </a>
              </li>
            ))}
            <li>
              <a href={marca.web} target="_blank" rel="noopener" className="flex min-h-[44px] items-center gap-2 text-sol underline decoration-sol/40 underline-offset-4 hover:decoration-sol">
                Main website <ArrowUpRight size={16} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative pb-[120px] md:pb-0">
        <div className="contenedor flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-texto/10 py-5 text-[14px] text-texto/60 md:mx-auto md:max-w-[46%] md:px-0">
          <span>© {new Date().getFullYear()} {marca.lugar}</span>
          <a href="/privacy/" className="flex min-h-[44px] items-center hover:text-texto">Privacy Policy</a>
          <a href="/terms/" className="flex min-h-[44px] items-center hover:text-texto">Terms of Use</a>
          <button type="button" data-cookies-abrir className="flex min-h-[44px] items-center hover:text-texto">Cookie settings</button>
        </div>
      </div>
    </footer>
  );
}

// Revelado del final (web de Karaya, 02/10): el cierre y el pie van por debajo del contenido y suben
// más despacio que el scroll; el contenido, opaco, se levanta como una hoja y los descubre.
function Revelado({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-160, 0]);
  return (
    <div ref={ref} data-cierre className="relative -z-10">
      <motion.div style={quieto ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

export function Shell({ children, cierre }: { children: ReactNode; cierre?: ReactNode }) {
  useEffect(() => listo('pagina'), []);
  useEffect(() => vigilarSecciones(), []);
  return (
    <div id="top" className="isolate flex min-h-screen flex-col">
      <div aria-hidden className="grano" />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-sol focus:px-4 focus:py-3 focus:text-noche">
        Skip to content
      </a>
      <Cabecera />
      <main id="contenido" className="relative flex-1 bg-fondo">
        {children}
      </main>
      <Revelado>
        {cierre}
        <Pie />
      </Revelado>
      <BarraCta />
    </div>
  );
}
