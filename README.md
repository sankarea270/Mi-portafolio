# Portafolio — Sitio estático

Este repositorio contiene una versión estática del portafolio personal. Está preparado para desplegarse en GitHub Pages.

Rápido resumen:
- `inicio.html` — landing / hero
- `projects.html` — sección de proyectos (se cargan repos destacados desde GitHub mediante `github-projects.js`)
- `contact.html` — formulario (envío a Formspree)
- `styles.css`, `scripts.js`, `github-projects.js` — assets principales

Despliegue (GitHub Pages desde `main`)
1. El workflow `/.github/workflows/deploy.yml` publica el contenido del repositorio en la rama `gh-pages` cada vez que haces `push` a `main`.
2. Asegúrate de que el repositorio está en GitHub y tienes Actions habilitadas.
3. El workflow usa `GITHUB_TOKEN` proporcionado por Actions, no necesitas tokens adicionales.
4. Después del primer deploy, ve a la configuración del repo → Pages y confirma que la fuente está en `gh-pages` (o espera a que GitHub la active automáticamente).

Configurar proyectos mostrados
- Edita `github-projects.js`. Cambia `GITHUB_USER` por tu usuario (ya puesto a `sankarea270`) y edita `FEATURED_REPOS` con la lista de repos a mostrar.

Probar localmente
1. Desde la carpeta del proyecto ejecuta:
```powershell
python -m http.server 8000
# y abre http://localhost:8000
```
2. Abre `projects.html` para ver las tarjetas que cargan información desde la API pública de GitHub.

Notas importantes
- `index.bak.html` es una copia de respaldo del antiguo `index.html`; no se elimina automáticamente.
- La API pública de GitHub tiene limitación de 60 peticiones/h por IP sin token. Si necesitas más requests, considera usar un token personal (PAT) y guardarlo en Secrets, modificando `github-projects.js` para usarlo.

Contacto
- El formulario está configurado para enviar a Formspree usando tu endpoint. Para pruebas locales puedes usar el servidor local `local_form_server.py` incluido.
