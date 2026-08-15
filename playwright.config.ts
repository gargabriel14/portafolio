import { defineConfig, devices } from '@playwright/test';

/**
 * Los tests corren contra el build de producción servido por `astro preview`,
 * no contra el dev server. Es la única forma de que lo que se prueba sea lo
 * que se despliega: minificado, con los chunks reales y las imágenes ya
 * optimizadas.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'escritorio',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'movil',
      use: { ...devices['Pixel 7'] },
    },
  ],

  // `astro preview` se pasa a segundo plano sin TTY y Playwright cree que
  // el proceso murió, así que servimos dist/ con scripts/serve.mjs, que se
  // queda en primer plano y replica el cleanUrls y el 404 de Vercel.
  // El build va aparte, en el script `test:e2e`.
  webServer: {
    command: 'node scripts/serve.mjs 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
