// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * El dominio canónico, del que salen el sitemap, los <link rel="canonical">
 * y las URLs absolutas de Open Graph.
 *
 * Está fijado a mano y NO se lee de VERCEL_PROJECT_PRODUCTION_URL a
 * propósito: esa variable devuelve el dominio autogenerado con sufijo
 * (portafolio-gabriel-garcia-gabriel-garcia.vercel.app), no el alias
 * corto que realmente publicamos. Un canonical apuntando al dominio
 * equivocado divide el posicionamiento entre dos URLs.
 *
 * SITE_URL lo sobrescribe cuando se conecte un dominio propio.
 */
const site = process.env.SITE_URL ?? 'https://gargabriel.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // three.js es el bulto pesado del sitio, pero no hace falta configurar
    // el troceado a mano: scene.ts entra por import() dinámico, así que
    // Rolldown ya lo emite como chunk aparte que solo se descarga cuando
    // main.ts decide que este equipo lo merece.
  },
});
