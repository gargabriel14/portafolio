/**
 * Genera public/og.png (1200x630) — la tarjeta que se ve al compartir el enlace
 * en LinkedIn, WhatsApp, X o Slack.
 *
 * Se ejecuta a mano (`npm run og`) y el PNG resultante se commitea. No corre en
 * cada build: es un asset estático que solo cambia cuando cambia el diseño o el
 * texto, y así el build de producción no depende del render de fuentes del SO.
 *
 * Uso: node scripts/generate-og.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1200;
const H = 630;
const PHOTO = 300;

const escapeXml = (s) =>
  s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[c],
  );

const name = escapeXml('GABRIEL GARCÍA');
const role = escapeXml('Desarrollador Web Full-Stack');
const stack = escapeXml(
  'WordPress · JavaScript · TypeScript · PHP · React · SEO',
);
const location = escapeXml(
  'Madrid, España  ·  Disponible para proyectos remotos',
);

const background = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glowCyan" cx="18%" cy="22%" r="62%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowMagenta" cx="88%" cy="82%" r="60%">
      <stop offset="0%" stop-color="#ff2fd6" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#ff2fd6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="55%" stop-color="#ff2fd6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#00f0ff" stroke-opacity="0.09" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="#04010f"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glowCyan)"/>
  <rect width="${W}" height="${H}" fill="url(#glowMagenta)"/>

  <!-- marco -->
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}"
        fill="none" stroke="#00f0ff" stroke-opacity="0.28" stroke-width="1.5"/>

  <!-- esquinas -->
  <path d="M28 84 L28 28 L84 28" fill="none" stroke="#00f0ff" stroke-width="3"/>
  <path d="M${W - 28} ${H - 84} L${W - 28} ${H - 28} L${W - 84} ${H - 28}"
        fill="none" stroke="#ff2fd6" stroke-width="3"/>

  <g font-family="Segoe UI, Arial, Helvetica, sans-serif">
    <text x="84" y="196" fill="#00f0ff" font-size="21" font-weight="700"
          letter-spacing="7">PORTAFOLIO</text>

    <text x="82" y="290" fill="#ffffff" font-size="72" font-weight="800"
          letter-spacing="1.5">${name}</text>

    <text x="84" y="344" fill="#ff2fd6" font-size="31" font-weight="700"
          letter-spacing="1">${role}</text>

    <text x="84" y="404" fill="#9fb8d8" font-size="22" font-weight="500">${stack}</text>

    <text x="84" y="452" fill="#7d94b8" font-size="20" font-weight="500">${location}</text>
  </g>

  <rect x="84" y="500" width="330" height="4" fill="url(#accent)"/>
</svg>`;

/** Máscara circular para recortar la foto. */
const circleMask = `
<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO}" height="${PHOTO}">
  <circle cx="${PHOTO / 2}" cy="${PHOTO / 2}" r="${PHOTO / 2}" fill="#fff"/>
</svg>`;

/** Anillo neón alrededor del retrato. */
const ring = `
<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO + 40}" height="${PHOTO + 40}">
  <defs>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#ff2fd6"/>
    </linearGradient>
  </defs>
  <circle cx="${(PHOTO + 40) / 2}" cy="${(PHOTO + 40) / 2}" r="${PHOTO / 2 + 12}"
          fill="none" stroke="url(#ringGrad)" stroke-width="3"/>
  <circle cx="${(PHOTO + 40) / 2}" cy="${(PHOTO + 40) / 2}" r="${PHOTO / 2 + 19}"
          fill="none" stroke="#8b5cf6" stroke-opacity="0.45" stroke-width="1"
          stroke-dasharray="7 9"/>
</svg>`;

const photo = await sharp('src/assets/gabriel-garcia.png')
  .resize(PHOTO, PHOTO, { fit: 'cover' })
  .composite([{ input: Buffer.from(circleMask), blend: 'dest-in' }])
  .png()
  .toBuffer();

await mkdir('public', { recursive: true });

await sharp(Buffer.from(background))
  .composite([
    {
      input: Buffer.from(ring),
      left: W - 40 - (PHOTO + 40),
      top: H / 2 - (PHOTO + 40) / 2,
    },
    { input: photo, left: W - 40 - PHOTO - 20, top: H / 2 - PHOTO / 2 },
  ])
  .png({ compressionLevel: 9 })
  .toFile('public/og.png');

console.log('✔ public/og.png generado (1200x630)');
