/* =========================================================
   CONFIGURACIÓN EDITABLE · Las Estrellas Underwater
   Este archivo es público (se descarga en el navegador):
   NUNCA pongas aquí contraseñas ni claves privadas.
   ========================================================= */
window.SITE_CONFIG = {
  // ---- Evento ----
  // Fecha y hora del evento para la cuenta regresiva (hora de Colombia, -05:00).
  // Ahora está a las 00:00 del 5 de diciembre: cámbiala a la hora real de inicio,
  // por ejemplo '2026-12-05T20:00:00-05:00'.
  eventDate: '2026-12-05T00:00:00-05:00',

  // Precio de la boleta en preventa (texto tal como se muestra).
  ticketPrice: '$70.000 COP',

  // ---- WhatsApp que recibe las inscripciones ----
  // Número con prefijo de país, solo dígitos (57 = Colombia).
  whatsappNumber: '573052308859',

  // ---- Google Sheets (opcional pero recomendado) ----
  // URL del Web App de Google Apps Script (termina en /exec). Ver README, paso 3.
  // Si está vacía, las inscripciones llegan solo por WhatsApp.
  endpoint: '',

  // ---- Redes sociales ----
  // Si dejas una vacía, ese botón no se muestra.
  // Ejemplo: 'https://www.instagram.com/tu_usuario'
  instagramUrl: '',
  tiktokUrl: '',

  // Correo de contacto para la política de privacidad (opcional).
  contactEmail: '',

  // ---- Reglas de edad del formulario ----
  minAge: 18,
  maxAge: 99
};
