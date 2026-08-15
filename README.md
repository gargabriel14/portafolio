# Portafolio — Gabriel José García Alcedo

Portafolio personal de una sola página. Estático, sin backend, desplegado en Vercel.

**Producción:** https://gabrielgarcia.vercel.app

---

## Stack

| Capa      | Elección                     | Por qué                                                         |
| --------- | ---------------------------- | --------------------------------------------------------------- |
| Framework | Astro 7 (`output: 'static'`) | Cero JavaScript por defecto; solo se envía lo que se usa.       |
| Estilos   | Tailwind CSS 4               | Configuración en CSS con `@theme`. No hay `tailwind.config.js`. |
| 3D        | three.js                     | Fondo WebGL, empaquetado y cargado bajo demanda.                |
| Animación | GSAP + ScrollTrigger, Lenis  | Reveals por scroll y desplazamiento suave.                      |
| Tipos     | TypeScript 6.0.x             | El tooling de Astro no soporta la línea 7.x.                    |
| Tests     | Playwright + axe-core        | Smoke, accesibilidad y responsive.                              |

Las fuentes (Orbitron y Rajdhani) van **self-hosted** desde npm. El sitio no
hace ni una petición a un dominio externo, y por eso puede permitirse una CSP
estricta.

## Desarrollo

```bash
npm install
npm run dev
```

| Comando             | Qué hace                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo en http://localhost:4321 |
| `npm run build`     | Build de producción en `dist/`                  |
| `npm run check`     | Comprobación de tipos (`astro check`)           |
| `npm run test:e2e`  | Build + suite de Playwright                     |
| `npm run check:csp` | Verifica que el build cumple la CSP declarada   |
| `npm run format`    | Formatea con Prettier                           |
| `npm run og`        | Regenera `public/og.png`                        |
| `npm run verify`    | Todo lo anterior, en el orden del CI            |

## Añadir un proyecto

Los proyectos son una colección tipada. Crea un `.md` en
`src/content/projects/`:

```markdown
---
title: 'Nombre del proyecto'
category: 'Web' # Web | App | Automatización | SEO
summary: 'Una frase que se lee en la tarjeta.'
status: 'live' # live | development | pre-launch
tags: ['React', 'Node.js']
link: 'https://ejemplo.com' # opcional
linkLabel: 'Ver sitio' # opcional
order: 5
ongoing: false
---

Descripción larga en Markdown.
```

Si el frontmatter no cumple el esquema de `src/content.config.ts`, **el build
falla con el nombre del campo**. Eso es intencionado: mejor romper aquí que
publicar una tarjeta a medias.

La portada se dibuja sola a partir del título, así que no hace falta imagen.

## Dónde vive el contenido

`src/data/profile.ts` es la fuente única de verdad: nombre, contacto, stack,
trayectoria, formación e idiomas. Cambia ahí y cambia en toda la web, incluidos
el JSON-LD y el `llms.txt`.

**Regla que gobierna ese archivo:** no se inventan empresas, clientes, estudios,
certificaciones, fechas, tecnologías ni métricas. Por eso no hay contadores de
"clientes satisfechos" ni "premios": no hay cifras verificables detrás. Los
proyectos en desarrollo se marcan como tales.

## Seguridad

- **CSP estricta** en `vercel.json`: `script-src 'self'`, sin `unsafe-inline`.
  `scripts/check-csp.mjs` verifica en CI que el build la cumple de verdad.
- **Sin formulario ni backend.** No hay endpoint, ni secretos, ni spam.
- **Sin CDN.** Todo se empaqueta desde npm; nada se carga de terceros.
- **Sin `innerHTML` con datos variables.** El botón de copiar construye su
  icono con el DOM.
- CI ejecuta `npm audit`, gitleaks y un pentest de Strix por pull request.

### Secretos que hay que configurar en GitHub

El escaneo de Strix se **omite** con un aviso si no están puestos. Para
activarlo, en _Settings → Secrets and variables → Actions_:

| Secreto       | Valor                                                  |
| ------------- | ------------------------------------------------------ |
| `STRIX_LLM`   | Identificador del modelo, por ejemplo `openai/gpt-5.4` |
| `LLM_API_KEY` | La clave del proveedor                                 |

## Accesibilidad

- `prefers-reduced-motion` desactiva Lenis, el fondo 3D y todas las animaciones.
- Enlace de salto al contenido, foco visible y navegación por teclado.
- La suite falla si axe encuentra una incidencia crítica o seria.
- Contraste verificado contra WCAG AA.

## Licencia

Código y contenido son propiedad de Gabriel José García Alcedo. No reutilizar
sin permiso.
