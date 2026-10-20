// «Start a Partnership Conversation»: el formulario del grupo (mismos campos para las dos marcas) en
// la tarjeta clara de la web. Si el socio armó un brief en «Plan an event», llega adjunto (evento
// `ky-brief`) y se envía con el resto. Validación en línea accesible (aria-invalid, mensajes con
// role=alert, foco al primer error), honeypot contra bots y nombre/email fuera de la analítica.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, CheckCircle2, ChevronDown, ClipboardList, X } from 'lucide-react';
import { Acento, Antetitulo, Boton } from '@/components/ui';
import { Mural } from '@/components/marca';
import { Pendiente } from '@/components/Pendiente';
import { emitir } from '@/lib/analitica';
import { enviar, envioSimulado } from '@/lib/formulario';
import { entrada, entradaTarjeta, entradaTitulo, enVista } from '@/lib/movimiento';
import { textoBrief, type Brief } from '@/secciones/Plan';
import { marca, plan, registro as r } from '@/data/contenido';

// Nombres de campo en inglés para form_error (igual que Hispaniola).
const CAMPO_EN: Record<string, string> = { nombre: 'name', empresa: 'company', email: 'email', pais: 'country', tipo: 'business_type', consentimiento: 'consent' };

const vacio = { nombre: '', empresa: '', email: '', telefono: '', pais: '', tipo: '', intereses: [] as string[], mensaje: '', consentimiento: false, web: '' };
type Datos = typeof vacio;

function Campo({ etiqueta, opcional, error, children, className }: { etiqueta: string; opcional?: boolean; error?: string; children: (id: string, extra: { 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold">
        {etiqueta} {opcional ? <span className="font-normal text-noche/60">{r.campos.opcional}</span> : null}
      </label>
      {children(id, { 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-e` : undefined })}
      {error ? (
        <p id={`${id}-e`} className="mt-1.5 text-[14px] font-medium text-[#b42318]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Desplegable({ opciones, value, onChange, ...rest }: { opciones: string[]; value: string; onChange: (v: string) => void } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>) {
  return (
    <div className="relative">
      <select {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={clsx('campo-claro', !value && 'text-noche/50')}>
        <option value="">{r.seleccionar}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-noche/60" />
    </div>
  );
}

function Casilla({ marcada, onChange, children, name, invalida, describe }: { marcada: boolean; onChange: (v: boolean) => void; children: ReactNode; name: string; invalida?: boolean; describe?: string }) {
  return (
    <label className="group flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" name={name} checked={marcada} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalida || undefined} aria-describedby={describe} className="peer sr-only" />
      <span aria-hidden className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-mar', marcada ? 'border-noche bg-noche text-sol' : invalida ? 'border-[#b42318] bg-white' : 'border-noche/25 bg-white group-hover:border-noche/45')}>
        {marcada ? <Check size={15} strokeWidth={3} /> : null}
      </span>
      <span>{children}</span>
    </label>
  );
}

// Interés como pastilla conmutable (varias a la vez).
function Pastilla({ marcada, onChange, children }: { marcada: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className={clsx('flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mar', marcada ? 'border-noche bg-noche font-semibold text-texto' : 'border-noche/20 hover:border-noche/45')}>
      <input type="checkbox" checked={marcada} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      {marcada ? <Check size={14} strokeWidth={3} aria-hidden /> : null}
      {children}
    </label>
  );
}

export function Registro() {
  const [d, setD] = useState<Datos>(vacio);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [tocado, setTocado] = useState(false);
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado' | 'error'>('editando');
  const empezado = useRef(false);
  // Antispam: el servidor rechaza envíos hechos a menos de 3 s de ver el formulario.
  const visto = useRef(Date.now());
  const tarjeta = useRef<HTMLDivElement>(null);
  const idConsent = useId();

  // El brief de «Plan an event» llega adjunto; también marca su interés en el formulario.
  useEffect(() => {
    const f = (e: Event) => {
      const b = (e as CustomEvent<Brief>).detail;
      setBrief(b);
      setEstado('editando');
      // Los tipos del planificador y los cuatro primeros intereses van en el mismo orden.
      const interes = r.intereses[plan.pasos.tipo.opciones.indexOf(b.tipo)];
      setD((x) => {
        const sumar = [interes, b.hispaniola ? r.intereses[4] : ''].filter((v) => v && !x.intereses.includes(v));
        return { ...x, intereses: [...x.intereses, ...sumar] };
      });
    };
    window.addEventListener('ky-brief', f);
    return () => window.removeEventListener('ky-brief', f);
  }, []);

  const cambiar = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    if (!empezado.current) {
      empezado.current = true;
      emitir('form_start');
    }
    setD((x) => ({ ...x, [k]: v }));
  };
  const alternarInteres = (i: string, on: boolean) => cambiar('intereses', on ? [...d.intereses, i] : d.intereses.filter((x) => x !== i));

  const errores: Partial<Record<keyof Datos, string>> = {
    nombre: d.nombre.trim().length > 1 ? undefined : r.errores.nombre,
    empresa: d.empresa.trim() ? undefined : r.errores.empresa,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()) ? undefined : r.errores.email,
    pais: d.pais ? undefined : r.errores.pais,
    tipo: d.tipo ? undefined : r.errores.tipo,
    consentimiento: d.consentimiento ? undefined : r.errores.consentimiento,
  };
  const ver = (k: keyof Datos) => (tocado ? errores[k] : undefined);
  const hayErrores = Object.values(errores).some(Boolean);

  const mandar = async () => {
    setTocado(true);
    const fallos = Object.entries(errores).filter(([, v]) => v);
    if (fallos.length) {
      emitir('form_error', { fields: fallos.map(([k]) => CAMPO_EN[k] ?? k).join(',') });
      requestAnimationFrame(() => tarjeta.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    // Honeypot: un humano no ve el campo «website»; si viene relleno, se finge el éxito y no se envía.
    if (d.web) {
      setEstado('enviado');
      return;
    }
    setEstado('enviando');
    const campos = {
      nombre: d.nombre.trim(),
      empresa: d.empresa.trim(),
      email: d.email.trim(),
      telefono: d.telefono.trim(),
      pais: d.pais,
      tipo: d.tipo,
      intereses: d.intereses,
      mensaje: d.mensaje.trim(),
      brief: brief ? textoBrief(brief) : '',
    };
    const res = await enviar({ campos, consentimiento: d.consentimiento, hp: d.web, ms: Date.now() - visto.current });
    if (res.ok) {
      // Solo cuando el servidor confirma. Sin nombre ni email en la analítica.
      emitir('form_submit_success', { business_type: d.tipo, country: d.pais, interests: d.intereses.join(','), brief: !!brief, ...(envioSimulado ? { simulated: true } : {}) });
      setEstado('enviado');
    } else setEstado('error');
  };

  return (
    <section id="join" className="relative overflow-hidden py-16 md:py-24">
      <Mural nombre="borde-venue-izquierda" ancho={675} alto={900} clase="left-0 top-[48%] hidden w-[14%] max-w-[220px] xl:block" />
      <div className="contenedor relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.div variants={entrada} {...enVista}>
            <Antetitulo>{r.antetitulo}</Antetitulo>
          </motion.div>
          <motion.h2 variants={entradaTitulo} {...enVista} className="mt-4 max-w-[13ch] text-[42px] md:text-[60px]">
            <Acento texto={r.titulo} />
          </motion.h2>
          <motion.p variants={entrada} {...enVista} className="mt-5 max-w-[44ch] text-[17px] text-texto-2">
            {r.texto}
          </motion.p>
        </div>

        <motion.div ref={tarjeta} variants={entradaTarjeta} {...enVista} className="tarjeta-clara scroll-mt-28 rounded-[24px] bg-texto p-5 text-noche md:p-9">
          <AnimatePresence mode="wait">
            {estado === 'enviado' ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[420px] flex-col items-start justify-center py-6" role="status">
                <CheckCircle2 size={48} className="text-verde" />
                <h3 className="mt-4 text-[32px] md:text-[40px]">{r.hecho.titulo}</h3>
                <p className="mt-2 max-w-[44ch] text-noche/75">{r.hecho.texto}</p>
                <button
                  type="button"
                  onClick={() => {
                    setD(vacio);
                    setBrief(null);
                    setTocado(false);
                    setEstado('editando');
                  }}
                  className="mt-6 min-h-[44px] font-semibold text-mar-hondo underline underline-offset-4"
                >
                  {r.hecho.otro}
                </button>
              </motion.div>
            ) : (
              <motion.form
                action="/api/enviar.php"
                method="post"
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                noValidate
                // WebMCP declarativo: un agente puede rellenar el formulario, pero no lo envía solo
                // (sin `toolautosubmit`): la persona revisa y pulsa el botón.
                {...{
                  toolname: 'start_karaya_partnership_conversation',
                  tooldescription: 'Fill in a partnership inquiry for Karaya Punta Cana (company, business type, country, areas of interest). Nothing is charged; the person must review and press the submit button.',
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  mandar();
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {brief ? (
                  <div className="flex items-start gap-3 rounded-[16px] bg-sol/25 px-4 py-3 sm:col-span-2">
                    <ClipboardList size={20} className="mt-0.5 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-noche/70">{r.briefAdjunto}</p>
                      <p className="mt-0.5 text-[15px] font-medium">{textoBrief(brief)}</p>
                    </div>
                    <button type="button" onClick={() => setBrief(null)} className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-noche/10" aria-label={r.quitarBrief}>
                      <X size={18} />
                    </button>
                  </div>
                ) : null}

                {tocado && hayErrores ? (
                  <p className="text-[14px] font-medium text-[#b42318] sm:col-span-2" role="alert">
                    {r.errores.resumen}
                  </p>
                ) : null}

                <Campo etiqueta={r.campos.nombre} error={ver('nombre')}>
                  {(id, a) => <input id={id} {...a} name="name" autoComplete="name" className="campo-claro" value={d.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />}
                </Campo>
                <Campo etiqueta={r.campos.empresa} error={ver('empresa')}>
                  {(id, a) => <input id={id} {...a} name="company" autoComplete="organization" className="campo-claro" value={d.empresa} onChange={(e) => cambiar('empresa', e.target.value)} />}
                </Campo>
                <Campo etiqueta={r.campos.email} error={ver('email')}>
                  {(id, a) => <input id={id} {...a} name="email" type="email" autoComplete="email" inputMode="email" className="campo-claro" value={d.email} onChange={(e) => cambiar('email', e.target.value)} />}
                </Campo>
                <Campo etiqueta={r.campos.telefono} opcional>
                  {(id) => <input id={id} name="phone" type="tel" autoComplete="tel" inputMode="tel" className="campo-claro" value={d.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />}
                </Campo>
                <Campo etiqueta={r.campos.pais} error={ver('pais')}>
                  {(id, a) => <Desplegable id={id} {...a} name="country" autoComplete="country-name" opciones={r.paises} value={d.pais} onChange={(v) => cambiar('pais', v)} />}
                </Campo>
                <Campo etiqueta={r.campos.tipo} error={ver('tipo')}>
                  {(id, a) => <Desplegable id={id} {...a} name="business_type" opciones={r.tipos} value={d.tipo} onChange={(v) => cambiar('tipo', v)} />}
                </Campo>

                <fieldset className="sm:col-span-2">
                  <legend className="mb-2 text-[14px] font-semibold">
                    {r.campos.intereses} <span className="font-normal text-noche/60">{r.campos.opcional}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {r.intereses.map((i) => (
                      <Pastilla key={i} marcada={d.intereses.includes(i)} onChange={(on) => alternarInteres(i, on)}>
                        {i}
                      </Pastilla>
                    ))}
                  </div>
                </fieldset>

                <Campo etiqueta={r.campos.mensaje} opcional className="sm:col-span-2">
                  {(id) => <textarea id={id} name="message" rows={3} className="campo-claro" value={d.mensaje} onChange={(e) => cambiar('mensaje', e.target.value)} />}
                </Campo>

                {/* Honeypot: fuera de la vista y del tabulador. */}
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" name="website" value={d.web} onChange={(e) => setD((x) => ({ ...x, web: e.target.value }))} />
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <Casilla name="consent" marcada={d.consentimiento} onChange={(v) => cambiar('consentimiento', v)} invalida={!!ver('consentimiento')} describe={ver('consentimiento') ? idConsent : undefined}>
                    <span className="text-[14px] text-noche/75">
                      {r.campos.consentimiento}{' '}
                      {/* En pestaña nueva: no se pierde lo escrito en el formulario. */}
                      <a href="/privacy/" target="_blank" rel="noopener" className="font-semibold text-noche underline underline-offset-4">
                        {r.campos.politica}
                      </a>
                      .
                    </span>
                  </Casilla>
                  {ver('consentimiento') ? (
                    <p id={idConsent} className="mt-1 text-[14px] font-medium text-[#b42318]" role="alert">
                      {ver('consentimiento')}
                    </p>
                  ) : null}
                  <Pendiente claro className="mt-2">{r.privacidad}</Pendiente>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 sm:col-span-2">
                  <Boton type="submit" nivel="marino" tamano="lg" flecha={estado !== 'enviando'} disabled={estado === 'enviando'} className="w-full !rounded-full sm:w-auto">
                    {estado === 'enviando' ? r.enviando : r.enviar}
                  </Boton>
                  {estado === 'error' ? (
                    <p className="text-[14px] font-medium text-[#b42318]" role="alert">
                      {r.errores.envio}{' '}
                      {/* Salida si falla el guardado o el aviso: nunca un «enviado» falso. */}
                      <a href={`https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(r.errores.whatsappTexto)}`} target="_blank" rel="noopener" className="font-semibold text-noche underline underline-offset-4">
                        {r.errores.whatsapp}
                      </a>{' '}
                      · <a href={`mailto:${marca.email}`} className="font-semibold text-noche underline underline-offset-4">{marca.email}</a>
                    </p>
                  ) : null}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
