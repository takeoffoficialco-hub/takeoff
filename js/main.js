/* =========================================================
   LAS ESTRELLAS UNDERWATER · Lógica de la página
   1) Utilidades y configuración
   2) Cielo estrellado (canvas)
   3) Animaciones de entrada y resplandor del puntero
   4) Datos del evento, cuenta regresiva y redes sociales
   5) Formulario de inscripción (Sheets opcional + WhatsApp)
   ========================================================= */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var V = window.EstrellasValidators;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) Utilidades ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function isHttpsUrl(u) {
    try { return new URL(u).protocol === 'https:'; } catch (e) { return false; }
  }

  /* ---------- 2) Cielo estrellado ---------- */
  (function stars() {
    var canvas = document.getElementById('stars');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var hero = document.getElementById('inicio');
    var w = 0, h = 0, list = [], raf = 0, running = false, shoot = null, nextShoot = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(220, (w * h) / 6500));
      list = [];
      for (var i = 0; i < n; i++) {
        list.push({
          x: Math.random() * w, y: Math.random() * h * 0.72,
          r: Math.random() * 1.3 + 0.25, p: Math.random() * Math.PI * 2, s: Math.random() * 1.4 + 0.5,
          c: Math.random() < 0.25 ? '170,225,255' : '255,255,255'
        });
      }
      draw(performance.now());
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        var a = reduceMotion ? 0.75 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.0012 * s.s + s.p));
        ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
        if (s.r > 1.2) { // destello en cruz para las estrellas grandes
          ctx.strokeStyle = 'rgba(' + s.c + ',' + (a * 0.6).toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 4, s.y); ctx.lineTo(s.x + s.r * 4, s.y);
          ctx.moveTo(s.x, s.y - s.r * 4); ctx.lineTo(s.x, s.y + s.r * 4);
          ctx.stroke();
        }
      }
      if (reduceMotion) return;
      if (!shoot && t > nextShoot) {
        shoot = { x: Math.random() * w * 0.8, y: Math.random() * h * 0.3, life: 0 };
        nextShoot = t + 6000 + Math.random() * 6000;
      }
      if (shoot) {
        shoot.life += 0.02;
        var px = shoot.x + shoot.life * 260, py = shoot.y + shoot.life * 120;
        var g = ctx.createLinearGradient(px, py, px - 90, py - 42);
        g.addColorStop(0, 'rgba(255,255,255,' + (1 - shoot.life).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 90, py - 42); ctx.stroke();
        if (shoot.life >= 1) shoot = null;
      }
    }

    function loop(t) { if (!running) return; draw(t); raf = requestAnimationFrame(loop); }
    function start() { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    nextShoot = performance.now() + 3000;

    // Solo animar mientras el hero es visible (ahorra batería).
    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
    } else { start(); }
  })();

  /* ---------- 3) Entrada al hacer scroll + resplandor del puntero ---------- */
  (function reveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    items.forEach(function (el) {
      var parentIndex = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', (Math.min(parentIndex, 6) * 0.09).toFixed(2) + 's');
    });
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  })();

  (function pointerGlow() {
    var hero = document.getElementById('inicio');
    if (!hero || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    var ticking = false, x = 0, y = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        hero.style.setProperty('--mx', x + 'px'); hero.style.setProperty('--my', y + 'px');
        ticking = false;
      });
    });
  })();

  /* ---------- 4) Datos del evento, cuenta regresiva y redes ---------- */
  var eventTime = new Date(cfg.eventDate || '').getTime(); // NaN si no hay fecha válida

  (function eventInfo() {
    // Fecha legible (ej. "sábado 5 de diciembre") a partir de eventDate
    if (!isNaN(eventTime)) {
      try {
        var txt = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' })
          .format(new Date(eventTime)).replace(',', '');
        Array.prototype.forEach.call(document.querySelectorAll('.js-event-date'), function (el) { el.textContent = txt; });
      } catch (e) { /* se queda el texto por defecto del HTML */ }
    }
    // Precio de preventa
    if (cfg.ticketPrice) {
      Array.prototype.forEach.call(document.querySelectorAll('.js-price'), function (el) { el.textContent = cfg.ticketPrice; });
    }
  })();

  (function countdown() {
    var box = document.getElementById('countdown');
    if (!box) return;
    if (isNaN(eventTime)) { box.hidden = true; return; }
    var grid = box.querySelector('.countdown__grid');
    var label = box.querySelector('.countdown__label');
    var done = document.getElementById('cd-done');
    var els = { d: document.getElementById('cd-d'), h: document.getElementById('cd-h'), m: document.getElementById('cd-m'), s: document.getElementById('cd-s') };
    var timer;

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var diff = eventTime - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        grid.hidden = true; label.hidden = true; done.hidden = false;
        return;
      }
      var total = Math.floor(diff / 1000);
      els.d.textContent = pad(Math.floor(total / 86400));
      els.h.textContent = pad(Math.floor((total % 86400) / 3600));
      els.m.textContent = pad(Math.floor((total % 3600) / 60));
      els.s.textContent = pad(total % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  (function social() {
    var map = { 'link-instagram': cfg.instagramUrl, 'link-tiktok': cfg.tiktokUrl };
    var visible = 0;
    Object.keys(map).forEach(function (id) {
      var a = document.getElementById(id);
      if (!a) return;
      if (map[id] && isHttpsUrl(map[id])) { a.href = map[id]; visible++; }
      else { a.hidden = true; }
    });
    var nav = document.querySelector('.social');
    if (nav && !visible) nav.hidden = true;
  })();

  /* ---------- 5) Formulario ---------- */
  (function signup() {
    var form = document.getElementById('signup-form');
    if (!form || !V) return;

    var btn = document.getElementById('submit-btn');
    var statusEl = document.getElementById('form-status');
    var successEl = document.getElementById('success');
    var waBtn = document.getElementById('wa-btn');
    var submitting = false;
    var STORE_KEY = 'eu_registered_v1';

    var minAge = Number(cfg.minAge) || 18;
    var maxAge = Number(cfg.maxAge) || 99;
    var waNumber = String(cfg.whatsappNumber || '').replace(/\D/g, '');
    var hasWA = /^\d{8,15}$/.test(waNumber);
    var ENDPOINT_RE = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;
    var endpoint = String(cfg.endpoint || '').trim();
    var hasEndpoint = ENDPOINT_RE.test(endpoint);

    // Cada regla devuelve {ok, value|error}
    var rules = {
      nombre: function (f) { return V.name(f.nombre.value, 'nombre'); },
      apellido: function (f) { return V.name(f.apellido.value, 'apellido'); },
      edad: function (f) { return V.age(f.edad.value, minAge, maxAge); },
      instagram: function (f) { return V.instagram(f.instagram.value); },
      whatsapp: function (f) { return V.whatsapp(f.whatsapp.value); },
      consentimiento: function (f) {
        return f.consentimiento.checked ? { ok: true, value: true } : { ok: false, error: 'Debes aceptar el tratamiento de datos para continuar.' };
      }
    };
    var order = ['nombre', 'apellido', 'edad', 'instagram', 'whatsapp', 'consentimiento'];

    function wrapper(input) { return input.closest('.field'); }
    function setFieldError(name, msg) {
      var input = form.elements[name];
      wrapper(input).classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      document.getElementById('err-' + name).textContent = msg;
    }
    function clearFieldError(name) {
      var input = form.elements[name];
      wrapper(input).classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      document.getElementById('err-' + name).textContent = '';
    }
    function checkField(name) {
      var r = rules[name](form);
      if (r.ok) clearFieldError(name); else setFieldError(name, r.error);
      return r;
    }

    // Validación en vivo: al salir del campo; al escribir solo se limpia el error si ya es válido.
    order.forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { if (input.value || input.type === 'checkbox') checkField(name); });
      input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', function () {
        if (wrapper(input).classList.contains('is-invalid') && rules[name](form).ok) clearFieldError(name);
      });
    });

    function setStatus(kind, msg) {
      statusEl.className = 'status' + (kind ? ' is-' + kind : '');
      statusEl.textContent = msg || '';
    }
    function setLoading(on) {
      btn.disabled = on;
      btn.classList.toggle('is-loading', on);
      btn.setAttribute('aria-busy', on ? 'true' : 'false');
    }

    // Protección contra duplicados en este dispositivo (guarda un hash, no el número).
    function hash(str) {
      var h = 2166136261;
      for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0).toString(36);
    }
    function readStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return []; } }
    function alreadyRegistered(wa) { return readStore().indexOf(hash(wa)) !== -1; }
    function remember(wa) {
      try { var l = readStore(); l.push(hash(wa)); localStorage.setItem(STORE_KEY, JSON.stringify(l.slice(-20))); } catch (e) { /* sin almacenamiento */ }
    }

    function uuid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }

    // Mensaje prellenado que se enviará al WhatsApp del evento
    function whatsappUrl(d) {
      var msg = 'Hola, quiero inscribirme a Las Estrellas Underwater ✨\n' +
        'Nombre: ' + d.nombre + ' ' + d.apellido + '\n' +
        'Edad: ' + d.edad + '\n' +
        'Instagram: ' + d.instagram + '\n' +
        'WhatsApp: ' + d.whatsapp;
      return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);
    }

    /**
     * Pantalla final. mode:
     *  - 'saved'   → guardado en Google Sheets
     *  - 'dup'     → ya estaba registrado en Google Sheets
     *  - 'waonly'  → no hay Sheets (o falló): la inscripción se completa al enviar el WhatsApp
     *  - 'again'   → ya se había inscrito desde este dispositivo
     */
    function showStep(mode, data) {
      var title = document.getElementById('success-title');
      var text = document.getElementById('success-text');
      var note = document.getElementById('success-note');
      note.textContent = '';

      if (mode === 'saved' || mode === 'dup') {
        title.textContent = mode === 'dup' ? '¡Ya estabas en la lista!' : '¡Ya estás dentro!';
        text.textContent = hasWA
          ? 'Registramos tu inscripción. Toca el botón para confirmarla por WhatsApp con el equipo.'
          : 'Registramos tu inscripción. Te escribiremos por WhatsApp con las novedades del evento.';
      } else if (mode === 'again') {
        title.textContent = 'Ya te inscribiste desde este dispositivo';
        text.textContent = 'Si aún no enviaste el mensaje por WhatsApp, puedes hacerlo con el botón.';
      } else {
        title.textContent = 'Último paso';
        text.textContent = 'Toca el botón y envía el mensaje por WhatsApp. Tu inscripción queda completa cuando lo recibamos.';
        note.textContent = 'Se abrirá WhatsApp con tus datos ya escritos; solo tienes que pulsar enviar.';
      }

      if (hasWA) { waBtn.href = whatsappUrl(data); waBtn.hidden = false; } else { waBtn.hidden = true; }

      form.hidden = true;
      successEl.hidden = false;
      successEl.focus();
      successEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (submitting) return; // evita doble envío
      setStatus('', '');

      // Validar todo
      var data = {}, firstInvalid = null;
      order.forEach(function (name) {
        var r = checkField(name);
        if (r.ok) data[name] = r.value; else if (!firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Honeypot: un humano nunca rellena este campo.
      if (form.elements.website.value) return;

      if (!hasWA && !hasEndpoint) {
        setStatus('warn', 'Configuración pendiente: las inscripciones aún no están conectadas y tu información NO se ha guardado. Inténtalo más tarde.');
        if (window.console) console.warn('[Las Estrellas Underwater] Configura whatsappNumber o endpoint en js/config.js (ver README).');
        return;
      }

      if (alreadyRegistered(data.whatsapp)) { showStep('again', data); return; }

      // Sin Google Sheets: la inscripción llega por WhatsApp.
      if (!hasEndpoint) { remember(data.whatsapp); showStep('waonly', data); return; }

      var payload = {
        id: uuid(),
        nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad,
        instagram: data.instagram,
        whatsapp: data.whatsapp,
        consentimiento: true,
        enviadoEn: new Date().toISOString()
      };

      submitting = true; setLoading(true);
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 20000);

      // text/plain evita el preflight CORS, que Apps Script no soporta.
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
        redirect: 'follow'
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json && json.ok) { remember(data.whatsapp); showStep('saved', data); }
          else if (json && json.error === 'duplicate') { remember(data.whatsapp); showStep('dup', data); }
          else { throw new Error((json && json.error) || 'respuesta inválida'); }
        })
        .catch(function (err) {
          if (window.console) console.error('[Las Estrellas Underwater] Error al guardar en Sheets:', err);
          if (hasWA) { showStep('waonly', data); } // no se guardó, pero el WhatsApp sí puede completar la inscripción
          else { setStatus('error', 'No pudimos confirmar tu inscripción. Revisa tu conexión e inténtalo de nuevo.'); }
        })
        .then(function () { clearTimeout(timer); submitting = false; setLoading(false); });
    });
  })();
})();
