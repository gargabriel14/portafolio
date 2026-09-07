/**
 * Genera src/assets/projects/app.png — la portada del proyecto de la app.
 *
 * La app está en desarrollo, así que la portada la dibuja EN CONSTRUCCIÓN:
 * armazón, bloques sin contenido y andamio de medidas. Pintar una app
 * terminada que no existe sería exactamente lo que el proyecto dice que no
 * hace.
 *
 * Uso: node scripts/generate-app-mockup.mjs
 */
import sharp from 'sharp';

const W = 1400,
  H = 788;
const PW = 300,
  PH = 600;
const px = 120,
  py = 96;

/** Bloque de contenido aún sin rellenar. */
const skel = (x, y, w, h, o = 0.5, r = 6) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#1b1546" stroke="rgba(0,240,255,.26)" stroke-width="1" stroke-dasharray="5 4" opacity="${o}"/>`;

/** Cota de medida, como en un plano. */
const cota = (x1, y, x2, label) => `
  <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#ff2fd6" stroke-width="1" opacity="0.7"/>
  <line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}" stroke="#ff2fd6" stroke-width="1" opacity="0.7"/>
  <line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}" stroke="#ff2fd6" stroke-width="1" opacity="0.7"/>
  <text x="${(x1 + x2) / 2}" y="${y - 11}" fill="#ff2fd6" font-size="12.5" text-anchor="middle"
        font-family="Consolas, Menlo, monospace" opacity="0.85">${label}</text>`;

const pantalla = `
  <rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="30" fill="#0a0524" stroke="#00f0ff" stroke-opacity="0.55" stroke-width="2"/>
  <rect x="${px + 10}" y="${py + 10}" width="${PW - 20}" height="${PH - 20}" rx="22" fill="#070320"/>
  <rect x="${px + PW / 2 - 34}" y="${py + 16}" width="68" height="9" rx="4.5" fill="#1b1546"/>

  <text x="${px + 26}" y="${py + 62}" fill="#e8f4ff" font-size="20" font-weight="700"
        font-family="Segoe UI, Arial, sans-serif">El Adoquín</text>
  <line x1="${px + 26}" y1="${py + 76}" x2="${px + PW - 26}" y2="${py + 76}" stroke="#00f0ff" stroke-opacity="0.3"/>

  ${skel(px + 26, py + 92, 78, 22, 0.75, 11)}
  ${skel(px + 112, py + 92, 62, 22, 0.4, 11)}
  ${skel(px + 182, py + 92, 70, 22, 0.4, 11)}

  ${skel(px + 26, py + 130, PW - 52, 130, 0.65, 10)}
  ${skel(px + 26, py + 272, 176, 14)}
  ${skel(px + 26, py + 294, 132, 14, 0.35)}

  ${skel(px + 26, py + 336, 84, 66, 0.55)}
  ${skel(px + 122, py + 336, 152, 13)}
  ${skel(px + 122, py + 358, 124, 13, 0.35)}
  ${skel(px + 122, py + 380, 96, 13, 0.25)}

  ${skel(px + 26, py + 420, 84, 66, 0.55)}
  ${skel(px + 122, py + 420, 152, 13)}
  ${skel(px + 122, py + 442, 138, 13, 0.35)}
  ${skel(px + 122, py + 464, 84, 13, 0.25)}

  <line x1="${px + 12}" y1="${py + PH - 62}" x2="${px + PW - 12}" y2="${py + PH - 62}" stroke="#00f0ff" stroke-opacity="0.22"/>
  ${[0, 1, 2, 3].map((i) => skel(px + 34 + i * 62, py + PH - 46, 30, 24, 0.5, 7)).join('')}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0630"/><stop offset="100%" stop-color="#22064a"/>
    </linearGradient>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="#00f0ff" stroke-opacity="0.11" stroke-width="0.9"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  ${pantalla}
  ${cota(px, py + PH + 34, px + PW, '390 px')}

  <g font-family="Consolas, Menlo, monospace">
    <text x="520" y="150" fill="#ff2fd6" font-size="15" letter-spacing="5">EN CONSTRUCCIÓN</text>
    <text x="520" y="196" fill="#e8f4ff" font-size="34" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Maqueta en curso</text>

    <line x1="520" y1="224" x2="900" y2="224" stroke="#00f0ff" stroke-opacity="0.35"/>

    <text x="520" y="266" fill="#9fb8d8" font-size="17">React Native  ·  navegación por secciones</text>
    <text x="520" y="298" fill="#9fb8d8" font-size="17">Lector de artículos  ·  pendiente</text>
    <text x="520" y="330" fill="#9fb8d8" font-size="17">Avisos push  ·  pendiente</text>

    <g opacity="0.85">
      <rect x="520" y="372" width="14" height="14" fill="none" stroke="#00f0ff" stroke-width="1.6"/>
      <path d="M523 379 l4 4 l7 -8" fill="none" stroke="#00f0ff" stroke-width="2"/>
      <text x="548" y="385" fill="#e8f4ff" font-size="16">Arquitectura de pantallas</text>

      <rect x="520" y="410" width="14" height="14" fill="none" stroke="#7d94b8" stroke-width="1.6"/>
      <text x="548" y="423" fill="#7d94b8" font-size="16">Consumo de contenido</text>

      <rect x="520" y="448" width="14" height="14" fill="none" stroke="#7d94b8" stroke-width="1.6"/>
      <text x="548" y="461" fill="#7d94b8" font-size="16">Publicación en tiendas</text>
    </g>

    <text x="520" y="530" fill="#7d94b8" font-size="14" opacity="0.85">// se actualiza cuando haya algo que enseñar</text>
  </g>

  <path d="M18 74 L18 18 L74 18" fill="none" stroke="#00f0ff" stroke-opacity="0.75" stroke-width="3.5"/>
  <path d="M${W - 18} ${H - 74} L${W - 18} ${H - 18} L${W - 74} ${H - 18}" fill="none" stroke="#ff2fd6" stroke-opacity="0.75" stroke-width="3.5"/>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile('src/assets/projects/app.png');
console.log('✔ src/assets/projects/app.png generado (1400x788)');
