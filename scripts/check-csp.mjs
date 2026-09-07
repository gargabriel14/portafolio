/**
 * Comprueba que el HTML construido cumple la CSP declarada en vercel.json.
 *
 * Una CSP estricta que el propio sitio incumple es peor que no tener CSP:
 * el navegador la aplica, bloquea el recurso y la página se rompe en
 * producción — normalmente después del despliegue, no antes. Este script
 * mueve ese descubrimiento al CI.
 *
 * Uso: node scripts/check-csp.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

/** Lee la directiva CSP declarada para todas las rutas. */
async function readPolicy() {
  const config = JSON.parse(await readFile(join(ROOT, 'vercel.json'), 'utf8'));
  const global = config.headers?.find((h) => h.source === '/(.*)');
  const csp = global?.headers?.find(
    (h) => h.key.toLowerCase() === 'content-security-policy',
  );

  if (!csp) throw new Error('vercel.json no declara Content-Security-Policy.');

  return Object.fromEntries(
    csp.value
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...values] = part.split(/\s+/);
        return [name, values];
      }),
  );
}

async function filesWithExt(dir, ext) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await filesWithExt(full, ext)));
    else if (extname(entry.name) === ext) found.push(full);
  }
  return found;
}

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (extname(entry.name) === '.html') found.push(full);
  }
  return found;
}

const policy = await readPolicy();
const scriptSrc = policy['script-src'] ?? policy['default-src'] ?? [];
const allowsInlineScript = scriptSrc.includes("'unsafe-inline'");

const problems = [];

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  const name = file.slice(DIST.length + 1);

  // 1. Scripts inline sin src. Los bloques application/ld+json son datos,
  //    no código: el navegador no los ejecuta y la CSP no los alcanza.
  if (!allowsInlineScript) {
    const tags = html.match(/<script\b[^>]*>/gi) ?? [];
    for (const tag of tags) {
      if (/\bsrc=/i.test(tag)) continue;
      if (/type=["']application\/(ld\+)?json["']/i.test(tag)) continue;
      problems.push(`${name}: <script> inline sin src → ${tag.slice(0, 90)}`);
    }
  }

  // 2. Manejadores de eventos en atributos (onclick, onload...). La CSP
  //    los bloquea igual que a un script inline.
  for (const match of html.matchAll(
    /\son(click|load|error|submit|focus|mouseover)\s*=/gi,
  )) {
    problems.push(`${name}: manejador inline "on${match[1]}" en un atributo`);
  }

  // 3. URLs javascript:
  if (/(?:href|src)\s*=\s*["']\s*javascript:/i.test(html)) {
    problems.push(`${name}: URL javascript: en un atributo`);
  }

  // 4. Recursos cargados desde dominios externos. Con default-src 'self'
  //    el navegador los bloquea; un <a href> sí puede salir fuera.
  for (const match of html.matchAll(
    /<(script|img|iframe|source|video|audio)\b[^>]*?\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/gi,
  )) {
    problems.push(`${name}: <${match[1]}> externo desde ${match[2]}`);
  }

  //    Los <link> solo cuentan cuando su rel provoca una descarga.
  //    canonical, alternate y sitemap son metadatos: no se piden nunca,
  //    y de hecho DEBEN llevar el dominio absoluto.
  const FETCHING_RELS = new Set([
    'stylesheet',
    'preload',
    'prefetch',
    'preconnect',
    'modulepreload',
    'icon',
    'shortcut icon',
    'apple-touch-icon',
    'manifest',
  ]);
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const href = tag.match(/\bhref\s*=\s*["'](https?:\/\/[^"']+)["']/i)?.[1];
    if (href && rel && FETCHING_RELS.has(rel)) {
      problems.push(`${name}: <link rel="${rel}"> externo desde ${href}`);
    }
  }
}

/*
 * 5. El CSS construido, contra font-src e img-src.
 *
 * Esto existe por un fallo real: Vite inlina por defecto todo asset menor
 * de 4 KB, varios subconjuntos de JetBrains Mono caían ahí, y un
 * `data:font/woff2` viola `font-src 'self'`. El navegador los bloqueaba y
 * la única señal era un error en consola que este script no miraba, porque
 * solo revisaba el HTML. Nueve violaciones llegaron a producción así.
 */
const fontSrc = policy['font-src'] ?? policy['default-src'] ?? [];
const imgSrc = policy['img-src'] ?? policy['default-src'] ?? [];

for (const file of await filesWithExt(DIST, '.css')) {
  const css = await readFile(file, 'utf8');
  const name = file.slice(DIST.length + 1);

  if (!fontSrc.includes('data:')) {
    const dataFonts =
      css.match(/url\(\s*["']?data:(?:application\/)?font/gi) ?? [];
    const woffData = css.match(/url\(\s*["']?data:[^)"']*woff/gi) ?? [];
    const total = dataFonts.length + woffData.length;
    if (total > 0) {
      problems.push(
        `${name}: ${total} fuente(s) en data: URI, y font-src no permite data: — el navegador las bloquea`,
      );
    }
  }

  if (!imgSrc.includes('data:')) {
    const dataImgs = css.match(/url\(\s*["']?data:image/gi) ?? [];
    if (dataImgs.length > 0) {
      problems.push(
        `${name}: ${dataImgs.length} imagen(es) en data: URI, y img-src no permite data:`,
      );
    }
  }

  for (const m of css.matchAll(/url\(\s*["']?(https?:\/\/[^)"']+)/gi)) {
    problems.push(`${name}: recurso externo en CSS desde ${m[1]}`);
  }
}

// 6. La política tiene que traer los cierres mínimos.
for (const [directive, expected] of [
  ['object-src', "'none'"],
  ['frame-ancestors', "'none'"],
  ['base-uri', "'self'"],
]) {
  if (!policy[directive]?.includes(expected)) {
    problems.push(`vercel.json: falta ${directive} ${expected}`);
  }
}

if (problems.length > 0) {
  console.error('✖ El build incumple su propia CSP:\n');
  for (const p of problems) console.error(`  · ${p}`);
  console.error(
    `\nO arreglas el HTML, o relajas la política en vercel.json — pero de forma consciente.`,
  );
  process.exit(1);
}

console.log(
  `✔ CSP verificada: script-src ${scriptSrc.join(' ') || '(hereda default-src)'}, font-src ${fontSrc.join(' ') || '(hereda)'} — sin scripts inline, sin manejadores en atributos, sin recursos externos y sin fuentes en data: URI.`,
);
