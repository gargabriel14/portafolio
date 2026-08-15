# CLAUDE.md — Portafolio de Gabriel José García Alcedo

Contexto para cualquier agente que trabaje en este repositorio.

## Qué es

Portafolio personal de una página. **Astro 7 con `output: 'static'`** — no hay
servidor, ni base de datos, ni autenticación, ni endpoints. El resultado del
build son ficheros que Vercel sirve desde su CDN.

Si una tarea parece necesitar un backend, revisa la premisa antes de añadirlo:
la ausencia de superficie de servidor es una decisión de diseño, no un olvido.

## La regla que no se negocia

`src/data/profile.ts` y `src/content/projects/*.md` son la única fuente de
verdad del contenido, y están sujetos a esta regla, heredada del perfil
profesional del autor:

> No se inventan empresas, clientes, estudios, certificaciones, fechas,
> tecnologías, métricas ni permisos laborales.

En la práctica, esto significa:

- **Nada de vanity metrics.** No hay "+50 clientes" ni "15 premios" porque no
  hay cifras verificables detrás. Los contadores del hero son comprobables:
  año de inicio, años de experiencia, proyectos documentados, idiomas.
- **Un proyecto en desarrollo se marca `status: 'development'`** y el texto lo
  dice. No se presenta como terminado.
- **El proyecto de cliente pre-lanzamiento no nombra al cliente.**
- **No se declara autorización laboral europea** (no la tiene).
- **No se declara inglés B2 certificado.** La formulación correcta es
  "intermedio, comunicación escrita más sólida que la hablada".
- La FP en ASIR es **"previsto"**, nunca "en curso", hasta que empiece.

Si te piden añadir un dato que no puedes verificar, pregunta en vez de rellenar.

## Comandos

```bash
npm run dev          # desarrollo, http://localhost:4321
npm run verify       # el gate completo: tipos, formato, build, e2e, CSP
```

`npm run verify` es lo que corre el CI. Si pasa en local, pasa en CI.

| Comando | Qué hace |
| --- | --- |
| `npm run check` | `astro check` — tipos de TS y de las plantillas |
| `npm run format:check` | Prettier en modo verificación (es un gate de CI) |
| `npm run test:e2e` | Build + Playwright (escritorio y móvil) |
| `npm run check:csp` | Comprueba que `dist/` cumple la CSP de `vercel.json` |
| `npm run og` | Regenera `public/og.png` |

## Restricciones técnicas que cuestan tiempo si se ignoran

1. **TypeScript se queda en `~6.0.3`.** La línea 7.x es la reescritura en Go y
   no tiene API de compilador estable, así que el tooling de Astro no la
   soporta. No lo "actualices".

2. **Nada de `<script>` en componentes `.astro`.** Astro inlina los scripts
   pequeños dentro del HTML, y un script inline obliga a abrir la CSP con
   `'unsafe-inline'`. Toda la lógica de cliente vive en `src/scripts/main.ts`,
   que se sirve como fichero externo. `npm run check:csp` falla si esto se
   incumple.

3. **Nada de CDN ni recursos externos.** Fuentes, three.js, GSAP — todo se
   instala desde npm y se empaqueta. La CSP es `default-src 'self'` y un
   recurso externo se bloquea en producción.

4. **Tailwind 4 se configura en CSS.** Los tokens están en el bloque `@theme`
   de `src/styles/global.css`. No existe `tailwind.config.js` y no debe
   crearse.

5. **`prefers-reduced-motion` desactiva de verdad.** Con esa preferencia no
   arranca Lenis, no se carga three.js y no hay animaciones. No es un modo
   degradado: la página queda completa. Cualquier animación nueva respeta la
   guarda `reduceMotion` de `main.ts`.

6. **Cuidado con las cajas que rotan.** Un elemento cuadrado con `rotate`
   tiene un bounding box que crece hasta √2 veces su lado, y arrastra scroll
   horizontal en móvil de forma intermitente. Si añades decoración giratoria,
   la sección que la contiene necesita `overflow-hidden`. Hay un test que
   muestrea el ancho en el tiempo para cazar exactamente esto.

7. **Astro colapsa el espacio en blanco** entre una expresión `{}` y un
   elemento adyacente. Usa `{' '}` explícito o saldrá "Alcedo,desarrollador".

## Estructura

```
src/
  data/profile.ts        # fuente única de verdad del contenido
  content/projects/      # un .md por proyecto, esquema en content.config.ts
  components/            # una sección por archivo
  layouts/Base.astro     # head, SEO, JSON-LD, capas de fondo
  scripts/
    main.ts              # toda la lógica de cliente
    scene.ts             # fondo WebGL, import() dinámico
  styles/global.css      # tokens @theme + componentes
scripts/                 # utilidades de build y CI (Node, no del bundle)
tests/site.spec.ts       # Playwright: smoke, a11y, responsive
```

## Añadir un proyecto

Crea `src/content/projects/<slug>.md` con el frontmatter del esquema. Si algún
campo no cumple, **el build falla nombrando el campo** — es lo que queremos. La
portada se genera a partir del título; no hace falta imagen.

## Despliegue

Vercel, desde `main`. `vercel.json` fija las cabeceras de seguridad y el
cacheado. El sitemap y las URLs canónicas salen de `astro.config.mjs`, que lee
`VERCEL_PROJECT_PRODUCTION_URL` en build, así que un cambio de dominio no
requiere tocar código.
