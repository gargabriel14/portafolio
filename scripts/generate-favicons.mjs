/**
 * Genera los PNG del favicon a partir de public/favicon.svg.
 *
 * El SVG cubre a los navegadores modernos, pero no a todos: iOS pide un
 * apple-touch-icon PNG y algunos clientes antiguos ignoran el SVG. Se ejecuta
 * a mano (`npm run icons`) y los PNG se commitean, igual que la imagen OG.
 *
 * Uso: node scripts/generate-favicons.mjs
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');

const tamanos = [
  ['public/favicon-32.png', 32],
  ['public/favicon-192.png', 192],
  ['public/apple-touch-icon.png', 180],
];

for (const [destino, px] of tamanos) {
  await sharp(svg, { density: 384 })
    .resize(px, px, {
      fit: 'contain',
      background: { r: 4, g: 1, b: 15, alpha: 1 },
    })
    .png({ compressionLevel: 9 })
    .toFile(destino);
  console.log(`✔ ${destino} (${px}×${px})`);
}

/*
 * favicon.ico.
 *
 * Hace falta aunque no se declare en el <head>: los navegadores piden
 * /favicon.ico por su cuenta, y si no está el nuestro sale el que dejó el
 * scaffold de Astro. sharp no escribe .ico, pero el formato admite un PNG
 * embebido tal cual (Vista en adelante), así que basta con anteponer la
 * cabecera de 22 bytes.
 */
const png32 = await sharp(svg, { density: 384 })
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 4, g: 1, b: 15, alpha: 1 },
  })
  .png({ compressionLevel: 9 })
  .toBuffer();

const cabecera = Buffer.alloc(22);
cabecera.writeUInt16LE(0, 0); // reservado
cabecera.writeUInt16LE(1, 2); // tipo 1 = icono
cabecera.writeUInt16LE(1, 4); // una sola imagen
cabecera.writeUInt8(32, 6); // ancho
cabecera.writeUInt8(32, 7); // alto
cabecera.writeUInt8(0, 8); // paleta: ninguna
cabecera.writeUInt8(0, 9); // reservado
cabecera.writeUInt16LE(1, 10); // planos
cabecera.writeUInt16LE(32, 12); // bits por píxel
cabecera.writeUInt32LE(png32.length, 14); // tamaño de la imagen
cabecera.writeUInt32LE(22, 18); // desplazamiento hasta los datos

await writeFile('public/favicon.ico', Buffer.concat([cabecera, png32]));
console.log(`✔ public/favicon.ico (32×32, PNG embebido)`);
