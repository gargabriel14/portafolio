// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * El dominio canónico. Vercel expone VERCEL_PROJECT_PRODUCTION_URL en build,
 * así que el sitemap y las URLs canónicas salen correctas sin tocar código
 * cuando cambie el dominio. SITE_URL permite forzarlo a mano.
 */
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://gabrielgarcia.vercel.app');

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
