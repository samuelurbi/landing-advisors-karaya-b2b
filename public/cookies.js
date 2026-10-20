/* Aviso de cookies (20/10) con Consent Mode v2, el mismo de la web principal de Karaya
   (karaya-partyboat: src/components/Cookies.tsx + src/lib/consentimiento.ts) en JS sin framework,
   para que lo compartan la landing y las páginas legales.
   - El default (todo denied) y la elección guardada los aplica el <script> en línea de index.html
     ANTES de GTM; aquí solo se pinta el aviso, se guarda la elección y se manda consent update.
   - Analítica → analytics_storage; marketing → ad_storage, ad_user_data, ad_personalization.
   - Configuración en la etiqueta: data-clave (localStorage), data-privacidad (URL de la política).
   - Cualquier elemento con [data-cookies-abrir] lo vuelve a abrir (enlace del pie).
   - Tarjeta pequeña abajo a la izquierda en escritorio; abajo en móvil, por encima de .barra-cta. */
(function () {
  var s = document.currentScript;
  var CLAVE = (s && s.getAttribute('data-clave')) || 'cookies';
  var PRIV = (s && s.getAttribute('data-privacidad')) || '/privacy/';
  var T = {
    texto: 'We use cookies to measure how the site is used and to improve our ads. You choose.',
    mas: 'Privacy',
    aceptar: 'Accept',
    rechazar: 'Reject',
    preferencias: 'Preferences',
    guardar: 'Save choices',
    analitica: ['Analytics', 'How the site is used, anonymised.'],
    marketing: ['Marketing', 'Measure and personalise our ads.'],
  };

  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (v && typeof v.a === 'boolean' && typeof v.m === 'boolean') return v;
    } catch (e) {}
    return null;
  }
  function estado(b) {
    return b ? 'granted' : 'denied';
  }
  function guardar(a, m) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ v: 1, a: a, m: m }));
    } catch (e) {}
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: estado(a), ad_storage: estado(m), ad_user_data: estado(m), ad_personalization: estado(m) });
    cerrar();
  }

  var css =
    '.ck{position:fixed;z-index:45;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);box-sizing:border-box;padding:16px;border-radius:18px;' +
    'background:var(--ck-fondo,rgba(10,26,64,.96));color:var(--ck-texto,#fff);font-size:14px;line-height:1.4;font-family:inherit;box-shadow:0 10px 40px rgba(0,0,0,.35);' +
    '-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);outline:none}' +
    '.ck.ck--barra{bottom:calc(env(safe-area-inset-bottom) + 84px)}' +
    '@media (min-width:768px){.ck,.ck.ck--barra{left:20px;right:auto;bottom:20px;width:360px}}' +
    '.ck p{margin:0;color:var(--ck-texto-2,rgba(255,255,255,.78))}' +
    '.ck a{color:var(--ck-texto,#fff);font-weight:600;text-decoration:underline;text-decoration-color:var(--ck-acento,#ffc93c);text-decoration-thickness:2px;text-underline-offset:4px}' +
    '.ck-fila{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}' +
    '.ck-b{flex:1;min-height:44px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:600;line-height:1;font-family:inherit;cursor:pointer;border:1px solid transparent}' +
    '.ck-b1{background:var(--ck-acento,#ffc93c);color:var(--ck-sobre-acento,#061a4a)}' +
    '.ck-b2{background:transparent;color:var(--ck-texto,#fff);border-color:var(--ck-borde,rgba(255,255,255,.35))}' +
    '.ck-l{min-height:44px;padding:0 4px;background:none;border:0;color:var(--ck-texto-2,rgba(255,255,255,.78));font-size:14px;font-weight:600;line-height:1;font-family:inherit;text-decoration:underline;text-underline-offset:4px;cursor:pointer}' +
    '.ck-b:focus-visible,.ck-l:focus-visible,.ck-s:focus-visible,.ck a:focus-visible{outline:3px solid var(--ck-acento,#ffc93c);outline-offset:2px}' +
    '.ck-s{display:flex;width:100%;min-height:44px;align-items:center;justify-content:space-between;gap:12px;padding:4px 0;background:none;border:0;border-top:1px solid var(--ck-borde,rgba(255,255,255,.12));color:inherit;text-align:left;font:inherit;cursor:pointer}' +
    '.ck-s:first-child{border-top:0}.ck-s b{display:block;font-size:14px}.ck-s small{display:block;font-size:13px;color:var(--ck-texto-2,rgba(255,255,255,.78))}' +
    '.ck-i{position:relative;flex:none;width:44px;height:24px;border-radius:999px;background:var(--ck-borde,rgba(255,255,255,.25));transition:background .2s}' +
    '.ck-i:after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}' +
    '.ck-s[aria-checked=true] .ck-i{background:var(--ck-acento,#ffc93c)}.ck-s[aria-checked=true] .ck-i:after{transform:translateX(20px)}' +
    '@media (prefers-reduced-motion:reduce){.ck-i,.ck-i:after{transition:none}}';

  var caja = null;
  var vigia = null;

  function interruptor(t, activo) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ck-s';
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', String(activo));
    b.innerHTML = '<span><b></b><small></small></span><span class="ck-i" aria-hidden="true"></span>';
    b.querySelector('b').textContent = t[0];
    b.querySelector('small').textContent = t[1];
    b.onclick = function () {
      b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true'));
    };
    return b;
  }
  function boton(clase, texto, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = clase;
    b.textContent = texto;
    b.onclick = fn;
    return b;
  }

  function abrir(foco) {
    if (!document.getElementById('ck-css')) {
      var st = document.createElement('style');
      st.id = 'ck-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    cerrar();
    var previo = leer();
    caja = document.createElement('div');
    caja.className = 'ck';
    caja.tabIndex = -1;
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'false');
    caja.setAttribute('aria-label', 'Cookies');
    caja.setAttribute('data-cookies', '');
    var p = document.createElement('p');
    p.textContent = T.texto + ' ';
    var a = document.createElement('a');
    a.href = PRIV + '#cookies';
    a.textContent = T.mas;
    p.appendChild(a);
    caja.appendChild(p);
    var fila = document.createElement('div');
    fila.className = 'ck-fila';
    fila.appendChild(boton('ck-b ck-b1', T.aceptar, function () { guardar(true, true); }));
    fila.appendChild(boton('ck-b ck-b2', T.rechazar, function () { guardar(false, false); }));
    fila.appendChild(
      boton('ck-l', T.preferencias, function () {
        var panel = document.createElement('div');
        panel.style.marginTop = '8px';
        var sa = interruptor(T.analitica, previo ? previo.a : false);
        var sm = interruptor(T.marketing, previo ? previo.m : false);
        panel.appendChild(sa);
        panel.appendChild(sm);
        caja.insertBefore(panel, fila);
        fila.innerHTML = '';
        fila.appendChild(boton('ck-b ck-b1', T.guardar, function () { guardar(sa.getAttribute('aria-checked') === 'true', sm.getAttribute('aria-checked') === 'true'); }));
        sa.focus();
      }),
    );
    caja.appendChild(fila);
    document.body.appendChild(caja);
    // ¿Hay barra fija inferior (CTA en móvil)? Entonces el aviso sube por encima.
    var mirar = function () {
      if (caja) caja.classList.toggle('ck--barra', !!document.querySelector('.barra-cta'));
    };
    mirar();
    vigia = new MutationObserver(mirar);
    vigia.observe(document.body, { childList: true, subtree: true });
    if (foco) setTimeout(function () { caja && caja.focus(); }, 50);
  }
  function cerrar() {
    if (vigia) vigia.disconnect();
    vigia = null;
    if (caja) caja.remove();
    caja = null;
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-cookies-abrir]');
    if (t) {
      e.preventDefault();
      abrir(true);
    }
  });
  function arrancar() {
    // Tras el preloader de la landing ([data-preloader], si lo hay) y un respiro: el aviso no
    // compite con la primera impresión. Como mucho se espera 8 s al preloader.
    if (leer()) return;
    var t0 = Date.now();
    (function esperar() {
      if (document.querySelector('[data-preloader]') && Date.now() - t0 < 8000) return setTimeout(esperar, 250);
      setTimeout(function () { if (!leer() && !caja) abrir(false); }, document.querySelector('#root') ? 1200 : 300);
    })();
  }
  if (document.readyState === 'complete') arrancar();
  else window.addEventListener('load', arrancar);
})();
