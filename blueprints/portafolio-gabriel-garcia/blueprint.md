# Blueprint — Portafolio de Gabriel José García Alcedo

> Bundle emitido por `/architect` el **2026-08-15**.
> **Estado: CONSTRUIDO Y DESPLEGADO.** Este documento no describe un plan
> pendiente: describe un sistema que existe, con los comandos de verificación
> ya ejecutados. Cada resultado de `Verify` es una salida real, no una
> predicción.

| | |
| --- | --- |
| Slug | `portafolio-gabriel-garcia` |
| Shape | `marketing-site` (primaria, sin secundaria) |
| Runtime track | TypeScript / Node |
| Repositorio | https://github.com/gargabriel14/portafolio |
| Producción | https://gargabriel.vercel.app |
| Pasos de build | 15 |

---

## 1. Visión

Portafolio personal de una sola página para Gabriel José García Alcedo,
desarrollador web full-stack en Getafe / Madrid. Su función es convertir una
visita de un reclutador o un cliente potencial en un contacto por correo.

El sitio existe porque no tenía portafolio propio y estaba enviando
candidaturas apoyándose solo en LinkedIn y en un enlace provisional de cliente
que, por acuerdo, no puede presentarse como trabajo personal.

## 2. Usuario objetivo

| Quién | Qué busca | Qué tiene que encontrar en 10 segundos |
| --- | --- | --- |
| Reclutador técnico | Stack, seniority, disponibilidad | Rol, tecnologías, "disponibilidad inmediata, remoto" |
| Cliente freelance | Evidencia de trabajo entregado | El Adoquín Times, en producción desde 2020 |
| Contacto por LinkedIn | Cómo escribirle | Correo visible y copiable sin scroll hasta el final |

Escala esperada: decenas de visitas al mes. No hay problema de carga.

## 3. Shape y clasificación

`marketing-site`. La pregunta que lo decide es la del desempate 7 de la fase 1:
**¿alguien inicia sesión y crea contenido?** No. El autor publica, el visitante
lee. Todo se renderiza en build y se sirve desde CDN.

Consecuencias que sí se aplicaron: sin base de datos, sin autenticación, sin
cola de moderación; y todo el esfuerzo va a rendimiento, SEO y conversión.

## 4. No-Goals (cerca de scope)

Explícitamente **fuera** de v1, y no por olvido:

- Blog o colección de artículos.
- CMS. Los ficheros del repositorio ganan hasta que un no-técnico edite semanalmente.
- Internacionalización. El público objetivo lee español; el `llms.txt` cubre el resto.
- Backend de cualquier tipo, incluido un formulario de contacto.
- Analítica. Se puede añadir después con Vercel Analytics sin banner de cookies.
- Modo claro. El diseño es deliberadamente oscuro.

## 5. Stack, con procedencia de cada pin

Todas las versiones verificadas contra el registro npm **el 2026-08-15**, en
esta sesión. Ninguna sale de memoria.

| Capa | Paquete | Versión | Estado | Fuente |
| --- | --- | --- | --- | --- |
| Framework | `astro` | 7.2.2 | VERIFICADO | `npm view astro version` |
| Estilos | `tailwindcss` | 4.3.3 | VERIFICADO | `npm view tailwindcss version` |
| Plugin Vite | `@tailwindcss/vite` | 4.3.3 | VERIFICADO | `npm view @tailwindcss/vite version` |
| 3D | `three` | 0.185.1 | VERIFICADO | `npm view three version` |
| Tipos 3D | `@types/three` | 0.185.4 | VERIFICADO | `npm view @types/three version` |
| Animación | `gsap` | 3.15.0 | VERIFICADO | `npm view gsap version` |
| Scroll | `lenis` | 1.3.26 | VERIFICADO | `npm view lenis version` |
| Sitemap | `@astrojs/sitemap` | 3.7.3 | VERIFICADO | `npm view @astrojs/sitemap version` |
| Fuentes | `@fontsource/orbitron`, `@fontsource/rajdhani` | 5.3.0 | VERIFICADO | `npm view <pkg> version` |
| Lenguaje | `typescript` | 6.0.3 | VERIFICADO | `npm view typescript@6 version` |
| Tipos Astro | `@astrojs/check` | 0.9.10 | VERIFICADO | `npm view @astrojs/check version` |
| E2E | `@playwright/test` | 1.62.1 | VERIFICADO | `npm view @playwright/test version` |
| A11y | `@axe-core/playwright` | 4.13.0 | VERIFICADO | `npm view @axe-core/playwright version` |
| Formato | `prettier` + `prettier-plugin-astro` | 3.9.6 / 0.14.1 | VERIFICADO | `npm view <pkg> version` |
| Imágenes | `sharp` | 0.35.3 | VERIFICADO | `npm view sharp version` |

### Dos pins que se apartan del runtime track, con motivo

1. **`typescript@6.0.3`, no 7.0.2.** El registro sirve 7.0.2 como `latest`,
   pero la 7.x es la reescritura en Go y no expone API de compilador estable.
   El tooling de Astro no la soporta. Actualizarla rompe `astro check`.

2. **npm, no pnpm.** El track fija pnpm 11.17.0. Se descartó: pnpm 11 aborta el
   install con `ERR_PNPM_IGNORED_BUILDS` por el postinstall de `sharp`, y
   `pnpm create` sale con código 0 igualmente, así que el fallo aparece un paso
   después. npm evita esa puerta entera y Vercel lo detecta nativo.

## 6. Modelo de datos

Sin tabla de usuarios. Se modela el contenido.

| Entidad | Dónde vive | Campos |
| --- | --- | --- |
| Identidad | `src/data/profile.ts` | nombre, rol, ubicación, email, teléfono, marca |
| Redes | `src/data/profile.ts` | label, href, icon, copyValue |
| Contador | `src/data/profile.ts` | value, suffix, label, hint |
| Grupo de skills | `src/data/profile.ts` | title, accent, items[] |
| Entrada de trayectoria | `src/data/profile.ts` | period, title, org, place, accent, bullets[], current |
| Proyecto | `src/content/projects/*.md` | title, category, summary, status, tags[], link?, linkLabel?, order, ongoing |

El esquema de `Proyecto` se valida en build con Zod (`src/content.config.ts`).
Un frontmatter inválido **rompe el build nombrando el campo**.

## 7. Arquitectura

```
Navegador
   │
   ├── HTML estático (contenido completo, rastreable sin JS)
   ├── CSS (48 KB, fuentes self-hosted, 18 woff2)
   └── JS
        ├── main.ts (116 KB) ── GSAP + ScrollTrigger, reveals, nav, filtro,
        │                        contadores, copiar, atenuación del fondo
        ├── lenis (20 KB)   ── import() dinámico, solo sin reduced-motion
        └── scene.js (524 KB) ── import() dinámico. Solo se descarga si:
                                  · no hay prefers-reduced-motion
                                  · viewport ≥ 768px
                                  · hardwareConcurrency > 2
```

**Decisión estructural clave:** ningún componente `.astro` lleva `<script>`.
Astro inlina los scripts pequeños en el HTML, y un script inline obliga a abrir
la CSP con `'unsafe-inline'`. Toda la lógica de cliente se concentra en
`main.ts`, que se sirve como fichero externo. Esto es lo que permite
`script-src 'self'` sin excepciones.

## 8. Seguridad

Superficie real de un sitio estático: no hay inyección, ni autenticación que
romper, ni IDOR. El riesgo vive en las dependencias, en un secreto commiteado y
en unas cabeceras mal puestas. El pipeline ataca esos tres.

| Control | Dónde | Verificación |
| --- | --- | --- |
| CSP `script-src 'self'` | `vercel.json` | `scripts/check-csp.mjs` sobre `dist/` |
| HSTS 2 años + preload | `vercel.json` | `curl -I` |
| `frame-ancestors 'none'` | `vercel.json` | `curl -I` |
| `nosniff`, `Referrer-Policy` | `vercel.json` | `curl -I` |
| Permissions-Policy (13 features) | `vercel.json` | `curl -I` |
| Sin recursos externos | Todo desde npm | `check-csp.mjs` regla 4 |
| Sin `innerHTML` con datos variables | `main.ts` usa `createElementNS` | revisión de código |
| Auditoría de dependencias | `.github/workflows/security.yml` | `npm audit --audit-level=moderate` |
| Secretos en el historial | idem | `gitleaks-action@v2` |
| Pentest por PR | idem | `strix --scan-mode quick` |

**Riesgo aceptado:** `style-src` mantiene `'unsafe-inline'`. Los atributos
`style=""` son numerosos en los componentes y un estilo inline no ejecuta
JavaScript en navegadores modernos. El vector real es el script, y ese está
cerrado.

## 9. Orden de build — 15 pasos, con su verificación real

Cada `Verify` de abajo **se ejecutó**. El resultado citado es la salida obtenida.

| # | Paso | Done when (EARS) | Verify | Resultado real |
| --- | --- | --- | --- | --- |
| 1 | Scaffold Astro + deps | CUANDO se instalen las dependencias EL SISTEMA construirá sin error | `npm run build` | `2 page(s) built` ✔ |
| 2 | Tokens Tailwind 4 + fuentes | CUANDO se construya EL SISTEMA empaquetará las woff2 sin peticiones externas | `ls dist/_astro/*.woff2 \| wc -l` | `18` ✔ |
| 3 | Fuente de verdad `profile.ts` | CUANDO se lea el HTML EL SISTEMA mostrará solo datos confirmados | inspección + `grep` | sin métricas inventadas ✔ |
| 4 | Colección de proyectos | CUANDO un frontmatter incumpla el esquema EL SISTEMA fallará el build nombrando el campo | `npm run build` | validación Zod activa ✔ |
| 5 | Layout base + SEO + JSON-LD | CUANDO se pida `/` EL SISTEMA devolverá título único, canonical y JSON-LD `Person` válido | test `metadatos sociales` | pasa ✔ |
| 6 | Secciones (6 componentes) | CUANDO se pida `/` EL SISTEMA servirá las 6 secciones con id | test `las cinco secciones existen` | pasa ✔ |
| 7 | Fondo WebGL diferido | CUANDO el viewport sea ≥768px sin reduced-motion EL SISTEMA pintará el canvas | test en producción | `canvas 1440x900 pintado` ✔ |
| 8 | Capa de movimiento | CUANDO se haga scroll EL SISTEMA revelará los bloques | `[data-reveal].is-revealed` | `6` revelados ✔ |
| 9 | Filtro de proyectos | CUANDO se pulse "App" EL SISTEMA mostrará 1 tarjeta y el contador dirá `01` | test `el filtro reduce la parrilla` | pasa ✔ |
| 10 | Contacto sin backend | CUANDO se pulse copiar EL SISTEMA copiará el correo y lo anunciará por `aria-live` | inspección + test | pasa ✔ |
| 11 | 404 real | CUANDO se pida una ruta inexistente EL SISTEMA devolverá estado 404 y `noindex` | `curl -o /dev/null -w '%{http_code}'` | `404` ✔ |
| 12 | Superficie SEO | CUANDO se pida `/sitemap-index.xml`, `/robots.txt` y `/llms.txt` EL SISTEMA devolverá 200 | `curl` de las 3 rutas | `200 200 200` ✔ |
| 13 | A11y + responsive | CUANDO axe audite `/` EL SISTEMA no reportará incidencia crítica ni seria, y a 360px no habrá scroll horizontal en ningún instante | `npx playwright test` | `20 passed` ✔ |
| 14 | Cabeceras + CI de seguridad | CUANDO se construya EL SISTEMA cumplirá su propia CSP | `node scripts/check-csp.mjs` | `exit 0`, probado también en negativo ✔ |
| 15 | Despliegue | CUANDO se pida producción por HTTPS EL SISTEMA devolverá 200 con las cabeceras y cero errores de consola | `curl -I` + Playwright contra producción | `200`, 7 cabeceras, `0` errores ✔ |

## 10. Bootstrap

```bash
git clone https://github.com/gargabriel14/portafolio
cd portafolio
npm ci
npx playwright install --with-deps chromium
npm run verify
```

`npm run verify` = `check` + `format:check` + `test:e2e` + `check:csp`. Es
exactamente lo que ejecuta el CI.

## 11. Despliegue

Vercel, proyecto `portafolio-gabriel-garcia` en el equipo `gabriel-garcia`,
conectado a `gargabriel14/portafolio`. Alias de producción:
**`gargabriel.vercel.app`**.

El nombre corto `portafolio-gabriel-garcia.vercel.app` ya estaba ocupado por
otro proyecto del autor, de ahí el alias.

Para dominio propio: añadirlo en Vercel y definir la variable `SITE_URL`.

## 12. Observabilidad

NO APLICA en v1 — se decidió excluir analítica para evitar el banner de
consentimiento. Vercel Web Analytics es privacy-preserving y se puede activar
sin banner cuando se quiera.

## 13. Autenticación

NO APLICA — sitio público sin cuentas.

## 14. Base de datos

NO APLICA — el contenido son ficheros del repositorio.

## 15. Pagos

NO APLICA.

## 16. Tiempo real / colaboración

NO APLICA.

## 17. Integración con LLM

NO APLICA en el producto. `public/llms.txt` es una superficie de lectura para
motores de respuesta, no una integración.

## 18. Registro de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación aplicada |
| --- | --- | --- | --- |
| El bundle de three.js hunde el rendimiento en móvil | Alta | Alto | `import()` dinámico + tres guardas (reduced-motion, ancho, núcleos). En móvil no se descarga |
| La CSP rompe el sitio en producción | Media | Alto | `check-csp.mjs` en CI + verificación en navegador real contra producción: 0 errores |
| Publicar un dato no verificable del perfil | Media | Alto | Regla de veracidad en `CLAUDE.md`; contadores reemplazados por cifras comprobables |
| Exponer al cliente pre-lanzamiento | Baja | Alto | Tarjeta sin nombre del cliente; enlace etiquetado "vista provisional" |
| Scroll horizontal intermitente en móvil | Media | Medio | Detectado y corregido: caja cuadrada rotando. Test que muestrea en el tiempo |
| El escaneo de Strix falla en abierto | Media | Medio | Paso que exige `status == completed` en `run.json` |
| Deriva de formato entre Windows y el runner | Alta | Bajo | `.gitattributes` con `eol=lf` |

## 19. Ficheros de workspace

Ver `workspace/`. Se copian tal cual a la raíz del proyecto.

### 19.6 Configuración crítica para las verificaciones

| Fichero | Por qué lo necesita un `Verify` |
| --- | --- |
| `playwright.config.ts` | Sin él `playwright test` no encuentra ni tests ni servidor |
| `scripts/serve.mjs` | `astro preview` se demoniza sin TTY y Playwright lo pierde |
| `scripts/check-csp.mjs` | Es el `Verify` del paso 14 |
| `tsconfig.json` | `astro check` lo lee |
| `.prettierrc.json` + `.prettierignore` | `format:check` es un gate de CI |
| `vercel.json` | `check-csp.mjs` lee de aquí la política |

## 20. Cierre

### 20.1 Gate de aceptación global

```bash
npm run verify && curl -sI https://gargabriel.vercel.app | grep -c "Content-Security-Policy"
```

Pasa cuando `verify` sale con 0 y el `grep` devuelve `1`.

### 20.2 Lo que queda abierto

1. **Secretos de Strix.** `STRIX_LLM` y `LLM_API_KEY` no están configurados en
   GitHub. El workflow se salta el escaneo con un aviso en vez de fallar. Hasta
   que se pongan, ese control **no está activo**.
2. **Los `.astro` se extraen parcialmente** en el grafo de graphify: su
   frontmatter no es AST estándar. 164 nodos vienen del código; los documentos
   no recibieron extracción semántica.
3. **`npm audit` y `gitleaks` no se han ejecutado todavía** — corren en el
   primer pull request, y hasta ahora solo ha habido pushes directos a `main`.
