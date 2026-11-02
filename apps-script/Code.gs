/**
 * LAS ESTRELLAS UNDERWATER · Endpoint de inscripciones (Google Apps Script)
 *
 * Se pega en Extensiones > Apps Script de una hoja de Google Sheets.
 * Recibe un POST con JSON, valida los datos en el servidor, evita duplicados
 * por número de WhatsApp y guarda una fila en la pestaña "Inscripciones".
 * No contiene credenciales ni secretos.
 */

var SHEET_NAME = 'Inscripciones';
var HEADERS = ['Fecha', 'Nombre', 'Apellido', 'Edad', 'Instagram', 'WhatsApp', 'Consentimiento', 'ID'];
var WHATSAPP_COL = 6;   // columna F
var MIN_AGE = 18;       // mantener igual que minAge en js/config.js
var MAX_AGE = 99;

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    lock.waitLock(20000);
    locked = true;

    var raw = e && e.postData && e.postData.contents;
    if (!raw) return json_({ ok: false, error: 'empty' });

    var d;
    try { d = JSON.parse(raw); } catch (err) { return json_({ ok: false, error: 'invalid_json' }); }

    var v = validate_(d);
    if (!v.ok) return json_({ ok: false, error: v.error });

    var sheet = getSheet_();
    if (exists_(sheet, v.data.whatsapp)) return json_({ ok: false, error: 'duplicate' });

    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    var row = sheet.getLastRow() + 1;
    var range = sheet.getRange(row, 1, 1, HEADERS.length);
    range.setNumberFormat('@'); // todo como texto: conserva el "+" del WhatsApp
    range.setValues([[
      stamp,
      safe_(v.data.nombre),
      safe_(v.data.apellido),
      String(v.data.edad),
      safe_(v.data.instagram),
      v.data.whatsapp,
      'Sí',
      safe_(v.data.id)
    ]]);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (e2) {} }
  }
}

/** Sirve para comprobar en el navegador que el despliegue está activo. */
function doGet() {
  return json_({ ok: true, service: 'Las Estrellas Underwater', status: 'activo' });
}

/* ---------- Validación en servidor (no te fíes solo del navegador) ---------- */
function validate_(d) {
  if (!d || typeof d !== 'object') return { ok: false, error: 'invalid' };

  var nombre = clean_(d.nombre), apellido = clean_(d.apellido);
  var nameRe = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ][A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ' .\-]*$/;
  if (nombre.length < 2 || nombre.length > 60 || !nameRe.test(nombre)) return { ok: false, error: 'invalid_nombre' };
  if (apellido.length < 2 || apellido.length > 60 || !nameRe.test(apellido)) return { ok: false, error: 'invalid_apellido' };

  var edad = parseInt(d.edad, 10);
  if (isNaN(edad) || edad < MIN_AGE || edad > MAX_AGE) return { ok: false, error: 'invalid_edad' };

  var ig = clean_(d.instagram).replace(/^@+/, '');
  if (!/^(?!.*\.\.)[A-Za-z0-9._]{1,30}$/.test(ig)) return { ok: false, error: 'invalid_instagram' };

  var wa = clean_(d.whatsapp);
  if (!/^\+[1-9]\d{7,14}$/.test(wa)) return { ok: false, error: 'invalid_whatsapp' };

  if (d.consentimiento !== true) return { ok: false, error: 'no_consent' };

  return { ok: true, data: { nombre: nombre, apellido: apellido, edad: edad, instagram: '@' + ig, whatsapp: wa, id: clean_(d.id).slice(0, 64) } };
}

function clean_(v) { return String(v == null ? '' : v).trim().replace(/\s+/g, ' '); }

/** Evita que un texto que empiece por = + - @ se interprete como fórmula. */
function safe_(v) { v = String(v); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function exists_(sheet, whatsapp) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, WHATSAPP_COL, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) { if (String(values[i][0]) === whatsapp) return true; }
  return false;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
