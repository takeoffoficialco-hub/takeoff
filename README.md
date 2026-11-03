# Las Estrellas Underwater · Web de inscripción

Sitio estático (HTML + CSS + JavaScript, sin dependencias ni build) para la pool party nocturna de **TAKEOFF**.

```
las-estrellas-underwater/
├── index.html            Página principal
├── privacidad.html       Política de privacidad (plantilla editable)
├── vercel.json           Configuración de Vercel
├── css/styles.css        Estilos y paleta de colores
├── js/config.js          ⭐ Configuración: fecha, precio, WhatsApp, redes, Sheets
├── js/validators.js      Validación de campos
├── js/main.js            Estrellas, cuenta regresiva y formulario
├── assets/               Logo TAKEOFF, favicon e imagen para redes (og-image.png)
└── apps-script/Code.gs   Código opcional para guardar inscripciones en Google Sheets
```

## Cómo llegan las inscripciones

1. La persona llena el formulario (todo se valida en la página).
2. Al pulsar **ASEGURAR MI INSCRIPCIÓN**, aparece el último paso con un botón que abre **WhatsApp con sus datos ya escritos**, dirigido al número configurado en `js/config.js` (`whatsappNumber`).
3. La inscripción queda completa cuando la persona **pulsa enviar** en WhatsApp. Una página web no puede enviar mensajes a un WhatsApp por sí sola (haría falta la API de WhatsApp Business, de pago), por eso se usa este paso final.
4. Opcional y recomendado: conecta Google Sheets (sección 3). Así cada inscripción se guarda **automáticamente** en una hoja, aunque la persona no llegue a enviar el WhatsApp, y te avisa por correo.

El número configurado es `573052308859` (57 = Colombia). Si no es de Colombia, cambia el prefijo en `js/config.js`.

## 1. Descomprimir el proyecto

Descomprime `las-estrellas-underwater.zip` (doble clic en Mac; clic derecho → *Extraer todo* en Windows). Obtendrás la carpeta `las-estrellas-underwater`.

## 2. Configurar fecha, precio y WhatsApp (`js/config.js`)

| Ajuste | Qué hace |
|---|---|
| `eventDate` | Fecha y hora del evento para la cuenta regresiva. Ahora está a las 00:00 del 5 de diciembre de 2026; cámbiala a la hora real de inicio, por ejemplo `'2026-12-05T20:00:00-05:00'`. El texto "sábado 5 de diciembre" se genera solo desde esta fecha. |
| `ticketPrice` | Precio de preventa que se muestra (`'$70.000 COP'`). |
| `whatsappNumber` | Número que recibe las inscripciones, con prefijo de país y solo dígitos. |
| `instagramUrl`, `tiktokUrl` | Enlaces del cierre. Si dejas uno vacío, ese botón no se muestra. |
| `minAge` | Edad mínima del formulario (18 por defecto). |

Cuando termine la cuenta regresiva, el contador muestra "¡La noche llegó!".

## 3. (Opcional) Guardar en Google Sheets con Apps Script

1. Crea una hoja nueva en [sheets.new](https://sheets.new).
2. En la hoja: **Extensiones → Apps Script**.
3. Borra el contenido del editor, abre `apps-script/Code.gs`, copia todo y pégalo. Guarda (💾).
4. Pulsa **Implementar → Nueva implementación**.
   - Tipo (⚙️): **Aplicación web**.
   - *Ejecutar como*: **Yo**.
   - *Quién tiene acceso*: **Cualquier persona**.
   - Pulsa **Implementar** y **autoriza** los permisos (Google avisa “app no verificada”: *Avanzado → Ir a proyecto*; es tu propio script). Los permisos incluyen enviar correos: es para avisarte de cada inscripción. Si no quieres ese aviso, pon `NOTIFY_OWNER = false` en `Code.gs`.
5. Copia la **URL de la aplicación web** (termina en `/exec`) y pégala en `js/config.js`:

   ```js
   endpoint: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```

6. Comprueba que está vivo: abre esa URL en el navegador; debe mostrar `{"ok":true,"service":"Las Estrellas Underwater","status":"activo"}`.

Notas:
- La pestaña **Inscripciones** se crea sola con la primera inscripción.
- El script rechaza WhatsApp duplicados y vuelve a validar todo en el servidor.
- Si modificas `Code.gs`, publica una **nueva versión**: *Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar*. La URL no cambia.
- La URL del endpoint es pública por diseño; no da acceso a tu hoja, solo permite añadir inscripciones válidas. No pongas contraseñas en `config.js`.
- Si cambias la edad mínima, hazlo en `minAge` (config.js) y en `MIN_AGE` (Code.gs).
- Si el guardado en Sheets falla, la persona igualmente ve el paso de WhatsApp, y la web no dice que quedó guardada.

## 4. Probarlo localmente

Desde una terminal, dentro de la carpeta del proyecto:

```bash
python3 -m http.server 8080
# o bien: npx serve .
```

Abre <http://localhost:8080>. Prueba el contador, el formulario vacío (errores bajo cada campo), edad menor a 18, WhatsApp sin `+`, y una inscripción válida: debe aparecer el botón de WhatsApp con tus datos escritos.

## 5. Subirlo a Vercel

**Con GitHub (recomendada)**
1. Sube el contenido de la carpeta a un repositorio (con `index.html` en la raíz).
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio.
3. *Framework Preset*: **Other**. Deja *Build Command* y *Output Directory* vacíos. **Deploy**.

**Con la terminal**
```bash
npm i -g vercel
cd las-estrellas-underwater
vercel          # primera vez
vercel --prod   # producción
```

Después de publicar, en `index.html` cambia `og:image` por la URL absoluta (`https://tu-dominio.com/assets/og-image.png`) y añade `<meta property="og:url" content="https://tu-dominio.com">`.

Para actualizar la web: edita el archivo en GitHub y pulsa *Commit changes*; Vercel republica solo.

## 6. Personalizar

| Qué | Dónde |
|---|---|
| Textos, tarjetas de la experiencia (mansión, artistas, cócteles, food truck, premios) | `index.html` |
| Fecha, precio, WhatsApp y redes | `js/config.js` |
| Colores | Variables al inicio de `css/styles.css` (`--electric`, `--turq`, `--black`…) |
| Logo TAKEOFF | `assets/takeoff-logo.png` (PNG blanco con fondo transparente) |
| Imagen al compartir en redes | `assets/og-image.png` (1200 × 630 px) |
| Política de privacidad | `privacidad.html` (plantilla general: que la revise un abogado) |

Pendiente de definir cuando lo tengas: lugar/ciudad, nombres de artistas, detalle de los premios y fin de la preventa. Añádelos en `index.html` con el estilo de las tarjetas `.card`.

## Accesibilidad y rendimiento

- Contraste alto, etiquetas en todos los campos, errores anunciados a lectores de pantalla, foco visible y contador accesible.
- Respeta `prefers-reduced-motion`: se desactivan animaciones y el cielo queda estático.
- Animaciones con CSS y un único `<canvas>` que se pausa cuando no se ve. Sin librerías.
