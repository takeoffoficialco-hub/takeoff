/* =========================================================
   Validadores del formulario (funciones puras, sin DOM).
   Se usan en el navegador (window.EstrellasValidators)
   y se pueden probar con Node (require).
   ========================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EstrellasValidators = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .\-]*$/u;
  var IG_USER_RE = /^(?!.*\.\.)[A-Za-z0-9._]{1,30}$/;
  var WA_RE = /^\+[1-9]\d{7,14}$/;
  var IG_RESERVED = ['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'tv'];

  function fail(error) { return { ok: false, error: error }; }
  function pass(value) { return { ok: true, value: value }; }

  /** Nombre o apellido: 2–60 caracteres, solo letras, espacios, ' . - */
  function name(raw, label) {
    var v = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
    if (!v) return fail('Escribe tu ' + label + '.');
    if (v.length < 2) return fail('Tu ' + label + ' es demasiado corto.');
    if (v.length > 60) return fail('Tu ' + label + ' es demasiado largo.');
    if (!NAME_RE.test(v)) return fail('Usa solo letras en tu ' + label + '.');
    return pass(v);
  }

  /** Edad: número entero entre min y max. */
  function age(raw, min, max) {
    min = min || 18; max = max || 99;
    var v = String(raw == null ? '' : raw).trim();
    if (!v) return fail('Indica tu edad.');
    if (!/^\d{1,3}$/.test(v)) return fail('Escribe tu edad solo con números.');
    var n = parseInt(v, 10);
    if (n < min) return fail('Debes tener al menos ' + min + ' años para inscribirte.');
    if (n > max) return fail('Revisa tu edad, parece incorrecta.');
    return pass(n);
  }

  /** Instagram: acepta @usuario, usuario o enlace de instagram.com. Devuelve "@usuario". */
  function instagram(raw) {
    var v = String(raw == null ? '' : raw).trim();
    if (!v) return fail('Escribe tu usuario de Instagram.');
    var user = v;
    if (/instagram\.com/i.test(v) || /^https?:\/\//i.test(v)) {
      try {
        var u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v);
        var host = u.hostname.toLowerCase();
        if (!/^(www\.|m\.)?instagram\.com$/.test(host)) return fail('Ese enlace no es de Instagram.');
        user = u.pathname.split('/').filter(Boolean)[0] || '';
        if (IG_RESERVED.indexOf(user.toLowerCase()) !== -1) user = '';
      } catch (e) { return fail('El enlace de Instagram no es válido.'); }
    }
    user = user.replace(/^@+/, '');
    if (!IG_USER_RE.test(user)) return fail('Usuario de Instagram no válido. Ejemplo: @tu_usuario');
    return pass('@' + user);
  }

  /** WhatsApp: formato internacional E.164 (+ y 8–15 dígitos). Admite espacios, guiones y paréntesis. */
  function whatsapp(raw) {
    var v = String(raw == null ? '' : raw).trim();
    if (!v) return fail('Escribe tu número de WhatsApp.');
    var s = v.replace(/[\s\-().]/g, '');
    if (s.indexOf('00') === 0) s = '+' + s.slice(2);
    if (s.charAt(0) !== '+') return fail('Incluye el prefijo internacional, por ejemplo +57.');
    if (!WA_RE.test(s)) return fail('Número no válido. Usa el formato +57 300 000 0000.');
    return pass(s);
  }

  return { name: name, age: age, instagram: instagram, whatsapp: whatsapp };
});
