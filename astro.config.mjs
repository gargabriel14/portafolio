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
    build: {
      /**
       * Las fuentes NUNCA se inlinan como data: URI.
       *
       * Vite inlina por defecto todo asset por debajo de 4 KB, y varios
       * subconjuntos de JetBrains Mono caen ahí. Un `data:font/woff2` viola
       * `font-src 'self'` de la CSP, así que el navegador los bloquea y esos
       * subconjuntos no llegan a cargar — silenciosamente, salvo por un
       * error en consola. La alternativa era abrir la CSP con `data:`;
       * prefiero servirlas como archivos y dejar la política cerrada.
       */
      assetsInlineLimit: (filePath) =>
        /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined,
    },
    // three.js es el bulto pesado del sitio, pero no hace falta configurar
    // el troceado a mano: scene.ts entra por import() dinámico, así que
    // Rolldown ya lo emite como chunk aparte que solo se descarga cuando
    // main.ts decide que este equipo lo merece.
  },
});
