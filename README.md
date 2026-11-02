# Las Estrellas Underwater · Web de inscripción

Sitio estático (HTML + CSS + JavaScript, sin dependencias ni build) para la pool party nocturna de **TAKEOFF**.
Las inscripciones se guardan en una hoja de Google Sheets mediante Google Apps Script.

```
las-estrellas-underwater/
├── index.html            Página principal
├── privacidad.html       Política de privacidad (plantilla editable)
├── vercel.json           Configuración de Vercel
├── css/styles.css        Estilos y paleta de colores
├── js/config.js          ⭐ Configuración: endpoint, redes, edad mínima
├── js/validators.js      Validación de campos
├── js/main.js            Estrellas, animaciones y envío del formulario
├── assets/               Logo TAKEOFF, favicon e imagen para redes (og-image.png)
└── apps-script/Code.gs   Código del endpoint para Google Sheets
```

## 1. Descomprimir el proyecto

Descomprime `las-estrellas-underwater.zip` (clic derecho → *Extraer todo* en Windows, doble clic en Mac).
Obtendrás la carpeta `las-estrellas-underwater`.

## 2. Configurar el formulario (Google Sheets + Apps Script)

1. Crea una hoja nueva en [sheets.new](https://sheets.new) y ponle un nombre, por ejemplo *Inscripciones Las Estrellas*.
2. En la hoja: **Extensiones → Apps Script**.
3. Borra el contenido del editor, abre `apps-script/Code.gs` de este proyecto, copia todo y pégalo. Guarda (💾).
4. Pulsa **Implementar → Nueva implementación**.
   - Tipo (⚙️): **Aplicación web**.
   - *Ejecutar como*: **Yo**.
   - *Quién tiene acceso*: **Cualquier persona**.
   - Pulsa **Implementar** y **autoriza** los permisos cuando Google lo pida (aparece una advertencia de “app no verificada”: *Avanzado → Ir a proyecto*; es tu propio script).
5. Copia la **URL de la aplicación web** (termina en `/exec`).
6. Abre `js/config.js` y pégala:

   ```js
   endpoint: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```

7. Comprueba que el endpoint está vivo: abre la URL en el navegador; debe mostrar `{"ok":true,"service":"Las Estrellas Underwater","status":"activo"}`.

Notas importantes:
- La pestaña **Inscripciones** se crea sola con la primera inscripción.
- El script rechaza WhatsApp duplicados y vuelve a validar todo en el servidor.
- Si modificas `Code.gs` más adelante, debes publicar una **nueva versión**: *Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar*. La URL no cambia.
- La URL del endpoint es pública por diseño; no da acceso a tu hoja, solo permite añadir inscripciones válidas. No pongas contraseñas en `config.js`.
- Si `endpoint` está vacío, el formulario muestra “Configuración pendiente” y **no** simula que guardó nada.

Si cambias la edad mínima, hazlo en dos sitios: `minAge` en `js/config.js` y `MIN_AGE` en `Code.gs`.

## 3. Probarlo localmente

Desde una terminal, dentro de la carpeta del proyecto:

```bash
python3 -m http.server 8080
# o bien: npx serve .
```

Abre <http://localhost:8080>. Prueba:
- Enviar el formulario vacío → errores bajo cada campo.
- Edad menor al mínimo, Instagram con caracteres raros, WhatsApp sin `+` → mensajes claros.
- Con el endpoint configurado, una inscripción válida → confirmación y una fila nueva en la hoja.

> Abrir `index.html` con doble clic también muestra la página, pero el envío del formulario debe probarse desde un servidor (local o Vercel).

## 4. Subirlo a Vercel

**Opción A · Con GitHub (recomendada)**
1. Sube la carpeta a un repositorio nuevo de GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio.
3. *Framework Preset*: **Other**. Deja *Build Command* y *Output Directory* vacíos. Pulsa **Deploy**.

**Opción B · Con la terminal**
```bash
npm i -g vercel
cd las-estrellas-underwater
vercel          # primera vez: sigue las preguntas
vercel --prod   # publicar en producción
```

Después de publicar:
1. En `index.html`, dentro de `<head>`, cambia `og:image` por la URL absoluta (`https://tu-dominio.com/assets/og-image.png`) y añade `<meta property="og:url" content="https://tu-dominio.com">`.
2. Opcional: añade tu dominio propio en *Project → Settings → Domains*.

## 5. Personalizar

| Qué | Dónde |
|---|---|
| Textos de la página | `index.html` (busca los títulos y párrafos de cada sección) |
| Instagram, TikTok y correo de contacto | `js/config.js` (si dejas una red vacía, su botón no se muestra) |
| Colores | Variables al inicio de `css/styles.css` (`--electric`, `--turq`, `--black`…) |
| Logo TAKEOFF | Reemplaza `assets/takeoff-logo.png` (PNG blanco con fondo transparente) |
| Imagen al compartir en redes | Reemplaza `assets/og-image.png` (1200 × 630 px) |
| Favicon | `assets/favicon.svg` |
| Política de privacidad | `privacidad.html` (es una plantilla general: haz que la revise un abogado) |
| Mes del evento (“Diciembre”) | Etiqueta superior del hero en `index.html` |

El proyecto no incluye fecha, lugar, artistas ni precios porque aún no están definidos. Cuando los tengas, añade una sección en `index.html` con el mismo estilo de `.card`.

## Accesibilidad y rendimiento

- Contraste alto, etiquetas en todos los campos, errores anunciados a lectores de pantalla y foco visible.
- Respeta `prefers-reduced-motion`: se desactivan animaciones y el cielo se queda estático.
- Animaciones con CSS y un único `<canvas>` que se pausa cuando no se ve. Sin librerías ni imágenes pesadas (solo el logo y las fuentes de Google Fonts).
