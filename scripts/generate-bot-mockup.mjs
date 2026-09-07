/**
 * Genera src/assets/projects/bots.png — la portada del proyecto de bots.
 *
 * Es una REPRESENTACIÓN ILUSTRATIVA, no una captura de una conversación real:
 * no se puede publicar el chat de un cliente, y una captura inventada que
 * imite la interfaz de WhatsApp o Telegram pixel a pixel se leería como
 * evidencia falsa. Por eso los paneles usan la paleta del propio portafolio
 * y llevan la etiqueta "representación" impresa en la esquina.
 *
 * Uso: node scripts/generate-bot-mockup.mjs
 */
import sharp from 'sharp';

const W = 1400,
  H = 788;
const esc = (s) =>
  s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);

/** Una burbuja de chat con su cola, alineada a un lado. */
function bubble({ x, y, w, lines, side, fill, stroke, textFill, meta }) {
  const lh = 25;
  const padY = 17;
  const h = lines.length * lh + padY * 2;
  const r = 14;
  const tail =
    side === 'left'
      ? `M${x + 3},${y + h - 16} q-11,4 -13,14 q13,-2 17,-9 z`
      : `M${x + w - 3},${y + h - 16} q11,4 13,14 q-13,-2 -17,-9 z`;

  const text = lines
    .map(
      (l, i) =>
        `<text x="${x + 20}" y="${y + padY + 18 + i * lh}" fill="${textFill}" font-size="17.5" font-family="Segoe UI, Arial, sans-serif">${esc(l)}</text>`,
    )
    .join('');

  const metaEl = meta
    ? `<text x="${x + w - 16}" y="${y + h - 12}" fill="${textFill}" opacity="0.55" font-size="12.5" text-anchor="end" font-family="Segoe UI, Arial, sans-serif">${esc(meta)}</text>`
    : '';

  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
    <path d="${tail}" fill="${fill}"/>
    ${text}${metaEl}
  </g>`;
}

/** Un panel de conversación completo. */
function alturaPanel(mensajes, typing) {
  const cuerpo = mensajes.reduce((a, m) => a + m.lines.length * 25 + 48, 0);
  return 92 + cuerpo + (typing ? 52 : 0) + 22;
}

function panel({
  x,
  y,
  w,
  tilt,
  accent,
  título,
  subtítulo,
  glyph,
  mensajes,
  typing,
}) {
  const h = alturaPanel(mensajes, typing);
  let cy = y + 92;
  const burbujas = mensajes
    .map((m) => {
      const bw = m.w ?? (m.side === 'left' ? w - 130 : w - 110);
      const bx = m.side === 'left' ? x + 22 : x + w - 22 - bw;
      const el = bubble({
        x: bx,
        y: cy,
        w: bw,
        lines: m.lines,
        side: m.side,
        fill: m.side === 'left' ? '#141033' : accent.bubble,
        stroke: m.side === 'left' ? 'rgba(0,240,255,.16)' : accent.stroke,
        textFill: m.side === 'left' ? '#dce9ff' : accent.text,
        meta: m.meta,
      });
      cy += m.lines.length * 25 + 34 + 14;
      return el;
    })
    .join('');

  const puntos = typing
    ? `<g>
        <rect x="${x + 22}" y="${cy}" width="86" height="38" rx="14" fill="#141033" stroke="rgba(0,240,255,.16)"/>
        ${[0, 1, 2].map((i) => `<circle cx="${x + 44 + i * 20}" cy="${cy + 19}" r="4.4" fill="#7d94b8" opacity="${0.4 + i * 0.25}"/>`).join('')}
      </g>`
    : '';

  return `<g transform="translate(${x + w / 2} ${y + h / 2}) rotate(${tilt}) translate(${-(x + w / 2)} ${-(y + h / 2)})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#0a0524" stroke="${accent.stroke}" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="${w}" height="66" rx="22" fill="${accent.header}"/>
    <rect x="${x}" y="${y + 44}" width="${w}" height="22" fill="${accent.header}"/>
    <circle cx="${x + 40}" cy="${y + 33}" r="19" fill="${accent.avatar}"/>
    <text x="${x + 40}" y="${y + 40}" font-size="19" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" fill="#04010f" font-weight="700">${glyph}</text>
    <text x="${x + 70}" y="${y + 29}" fill="#ffffff" font-size="17" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${esc(título)}</text>
    <text x="${x + 70}" y="${y + 49}" fill="${accent.dim}" font-size="13.5" font-family="Segoe UI, Arial, sans-serif">${esc(subtítulo)}</text>
    ${burbujas}${puntos}
  </g>`;
}

const whatsapp = panel({
  x: 62,
  y: 108,
  w: 600,
  tilt: -2.2,
  typing: false,
  accent: {
    header: '#0f3f33',
    bubble: '#134d3d',
    stroke: 'rgba(37,211,102,.4)',
    text: '#eafff5',
    dim: '#7fd8b4',
    avatar: '#25d366',
  },
  título: 'Reservas · Bot',
  subtítulo: 'en línea',
  glyph: 'W',
  mensajes: [
    {
      side: 'left',
      lines: ['Hola, ¿tenéis hueco el jueves', 'por la tarde?'],
      meta: '18:42',
    },
    {
      side: 'right',
      lines: [
        'El jueves 11 queda libre a las',
        '16:30 y a las 18:00.',
        '¿Cuál te viene mejor?',
      ],
      meta: '18:42',
    },
    { side: 'left', lines: ['La de 18:00'], w: 180, meta: '18:43' },
    {
      side: 'right',
      lines: ['Reservado ✓  Jueves 11, 18:00.', 'Te aviso 2 h antes.'],
      meta: '18:43 ✓✓',
    },
  ],
});

const telegram = panel({
  x: 738,
  y: 132,
  w: 600,
  tilt: 2.4,
  typing: true,
  accent: {
    header: '#123a55',
    bubble: '#16496b',
    stroke: 'rgba(56,163,224,.42)',
    text: '#eaf6ff',
    dim: '#8fc7ea',
    avatar: '#38a3e0',
  },
  título: 'Monitor · Bot',
  subtítulo: 'bot',
  glyph: 'T',
  mensajes: [
    { side: 'right', lines: ['/estado'], w: 150, meta: '09:00' },
    {
      side: 'left',
      lines: [
        'Todo operativo.',
        'Último backup: hoy 04:15',
        'Cola de envíos: 0',
      ],
      meta: '09:00',
    },
    {
      side: 'left',
      lines: [
        '⚠ Formulario de contacto sin',
        'respuesta desde hace 15 min.',
        'Reintentando…',
      ],
      meta: '11:27',
    },
    {
      side: 'left',
      lines: ['Resuelto. 3 mensajes entregados.'],
      meta: '11:29',
    },
  ],
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0630"/><stop offset="100%" stop-color="#22064a"/>
    </linearGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="#00f0ff" stroke-opacity="0.10" stroke-width="0.9"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="46%" r="62%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <path d="M18 74 L18 18 L74 18" fill="none" stroke="#00f0ff" stroke-opacity="0.75" stroke-width="3.5"/>
  <path d="M${W - 18} ${H - 74} L${W - 18} ${H - 18} L${W - 74} ${H - 18}" fill="none" stroke="#ff2fd6" stroke-opacity="0.75" stroke-width="3.5"/>

  ${whatsapp}
  ${telegram}

  <text x="${W / 2}" y="${H - 26}" text-anchor="middle" fill="#7d94b8" font-size="14.5"
        letter-spacing="4.5" font-family="Segoe UI, Arial, sans-serif">REPRESENTACIÓN · NO ES UNA CONVERSACIÓN REAL</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile('src/assets/projects/bots.png');
console.log('✔ src/assets/projects/bots.png generado (1400x788)');
