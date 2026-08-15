import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Portada', () => {
  test('carga, tiene un solo h1 y el nombre en el título', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Gabriel José García Alcedo/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('GABRIEL GARCÍA');
  });

  test('el contenido está en el HTML servido, no inyectado por JS', async ({
    request,
  }) => {
    // Un rastreador que no ejecuta JavaScript tiene que ver todo esto.
    const html = await (await request.get('/')).text();

    for (const needle of [
      'El Adoquín Times',
      'Desarrollador Web Full-Stack',
      'gargabriel1412@gmail.com',
      'Getafe / Madrid',
    ]) {
      expect(html, `"${needle}" debe estar en el HTML inicial`).toContain(
        needle,
      );
    }
  });

  test('las cinco secciones existen y el menú apunta a todas', async ({
    page,
  }) => {
    await page.goto('/');

    for (const id of [
      'inicio',
      'sobre-mi',
      'skills',
      'proyectos',
      'trayectoria',
      'contacto',
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    // Ningún enlace del menú puede apuntar a un ancla inexistente.
    const hrefs = await page
      .locator('#nav a[href^="#"]')
      .evaluateAll((links) =>
        links.map((l) => (l as HTMLAnchorElement).getAttribute('href')),
      );

    for (const href of hrefs) {
      if (!href || href === '#') continue;
      await expect(page.locator(href)).toHaveCount(1);
    }
  });

  test('los metadatos sociales y el canonical están completos', async ({
    page,
  }) => {
    await page.goto('/');

    const meta = (selector: string) =>
      page.locator(selector).first().getAttribute('content');

    expect(await meta('meta[name="description"]')).toBeTruthy();
    expect(await meta('meta[property="og:image"]')).toContain('/og.png');
    expect(await meta('meta[property="og:title"]')).toBeTruthy();
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

    // JSON-LD válido y del tipo correcto.
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(() => JSON.parse(ld ?? '')).not.toThrow();
    expect(JSON.parse(ld ?? '{}')['@type']).toBe('Person');
  });
});

test.describe('Proyectos', () => {
  test('el filtro reduce la parrilla y el contador la sigue', async ({
    page,
  }) => {
    await page.goto('/');

    const cards = page.locator('#proj-grid > li');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);

    await page.locator('.filter-chip[data-filter="App"]').click();

    const visible = page.locator('#proj-grid > li:not([hidden])');
    await expect(visible).toHaveCount(1);
    await expect(page.locator('#proj-count')).toHaveText('01');

    // Volver a TODO restaura la parrilla completa.
    await page.locator('.filter-chip[data-filter="TODO"]').click();
    await expect(page.locator('#proj-grid > li:not([hidden])')).toHaveCount(
      total,
    );
  });

  test('los enlaces externos llevan rel de seguridad', async ({ page }) => {
    await page.goto('/');

    const externals = page.locator('a[target="_blank"]');
    const count = await externals.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const rel = await externals.nth(i).getAttribute('rel');
      expect(rel, 'todo target=_blank necesita noopener').toContain('noopener');
    }
  });
});

test.describe('Responsive', () => {
  test('no hay scroll horizontal a 360px, en ningún momento', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Muestreamos durante un par de segundos en vez de medir una sola vez.
    // Los elementos decorativos que rotan tienen una caja cuadrada cuyo
    // bounding box crece y encoge con el ángulo, así que una medición
    // única puede caer justo en el instante en que todo cabe.
    let worst = 0;
    for (let i = 0; i < 10; i++) {
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      worst = Math.max(worst, overflow);
      await page.waitForTimeout(220);
    }

    expect(
      worst,
      `la página desborda ${worst}px a lo ancho en móvil`,
    ).toBeLessThanOrEqual(1);
  });
});

test.describe('Accesibilidad', () => {
  test('axe no reporta incidencias críticas ni serias', async ({ page }) => {
    // Auditamos con movimiento reducido a propósito. Por defecto los
    // bloques [data-reveal] arrancan en opacity:0 y axe se salta lo
    // invisible, así que sin esto el 80% de la página quedaba sin
    // revisar. Además Lenis secuestra el scroll, de modo que recorrer la
    // página con scrollTo tampoco dispara los reveals de forma fiable.
    // Con reduced-motion main.ts los revela todos de golpe: mismo DOM,
    // mismos colores, resultado determinista.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pending = await page.evaluate(
      () => document.querySelectorAll('[data-reveal]:not(.is-revealed)').length,
    );
    expect(
      pending,
      'con reduced-motion todo debe estar revelado; si no, axe audita a ciegas',
    ).toBe(0);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(
      blocking,
      `Incidencias:\n${blocking.map((v) => `· ${v.id}: ${v.help}`).join('\n')}`,
    ).toEqual([]);
  });

  test('se puede navegar con teclado hasta el contenido', async ({ page }) => {
    await page.goto('/');

    // El primer tab tiene que dar con el enlace de salto.
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(
      () => document.activeElement?.textContent,
    );
    expect(focused).toContain('SALTAR AL CONTENIDO');
  });
});

test.describe('404', () => {
  test('la página de error existe y no se indexa', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });
});
