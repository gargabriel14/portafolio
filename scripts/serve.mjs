/**
 * Servidor estático para los tests end-to-end.
 *
 * Existe porque `astro preview` se pasa a segundo plano cuando no hay TTY
 * (como bajo Playwright o en CI) y el runner cree que el proceso ha muerto.
 * Este se queda en primer plano y reproduce el comportamiento de Vercel que
 * declaramos en vercel.json: cleanUrls y un 404 con estado 404 de verdad.
 *
 * Uso: node scripts/serve.mjs [puerto]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath y no `new URL(...).pathname`: en Windows este último
// devuelve "/C:/Users/..." con barras hacia delante, que no case con lo
// que produce path.join y rompe la comprobación de contención de abajo.
const ROOT = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const PORT = Number(process.argv[2] ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/** Resuelve una ruta URL a un archivo dentro de dist/, o null. */
async function resolveFile(pathname) {
  // normalize + el prefijo comprobado abajo cierran el path traversal:
  // una petición a /../../secreto no puede salir de dist/.
  const clean = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.[/\\])+/,
    '',
  );
  const candidates = clean.endsWith('/')
    ? [join(clean, 'index.html')]
    : [clean, `${clean}.html`, join(clean, 'index.html')];

  for (const candidate of candidates) {
    const full = resolve(ROOT, `.${sep}${candidate}`);
    if (full !== ROOT && !full.startsWith(ROOT + sep)) continue;
    try {
      const info = await stat(full);
      if (info.isFile()) return full;
    } catch {
      /* siguiente candidato */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const file = await resolveFile(url.pathname);

  if (!file) {
    try {
      const body = await readFile(join(ROOT, '404.html'));
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('404');
    }
    return;
  }

  const body = await readFile(file);
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`Sirviendo dist/ en http://localhost:${PORT}`);
});
