/**
 * Capa de movimiento del sitio.
 *
 * Dos reglas gobiernan este archivo:
 *   1. Nada de lo que hay aquí es necesario para leer la página. Si este
 *      bundle no carga, el contenido sigue completo y navegable.
 *   2. `prefers-reduced-motion: reduce` no es un modo degradado — es una
 *      instrucción. Con esa preferencia no se arranca Lenis, ni el 3D, ni
 *      una sola animación de scroll.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

/* ══════════════════════════════════════════════════════════
   SCROLL SUAVE
   ══════════════════════════════════════════════════════════ */
async function initSmoothScroll() {
  if (reduceMotion) return;

  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Los enlaces del menú tienen que ir a través de Lenis o el salto es seco.
  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    'a[href^="#"]',
  )) {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    });
  }
}

/* ══════════════════════════════════════════════════════════
   REVEALS AL ENTRAR EN PANTALLA
   ══════════════════════════════════════════════════════════ */
function initReveals() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (reduceMotion) {
    for (const el of items) el.classList.add('is-revealed');
    return;
  }

  for (const el of items) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
        onComplete: () => el.classList.add('is-revealed'),
      },
    );
  }

  // Las listas de chips y las tarjetas entran escalonadas: leen como un
  // grupo, no como piezas sueltas.
  for (const list of document.querySelectorAll<HTMLElement>(
    '#proj-grid, .sec-head + p + div[role="group"]',
  )) {
    const children = list.children;
    if (!children.length) return;
    gsap.from(children, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    });
  }
}

/* ══════════════════════════════════════════════════════════
   CONTADORES Y BARRAS
   ══════════════════════════════════════════════════════════ */
function initCounters() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const target = Number(el.dataset.count ?? 0);
    const suffix = el.dataset.suffix ?? '';

    if (reduceMotion) {
      el.textContent = `${target}${suffix}`;
      continue;
    }

    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => {
        el.textContent = `${Math.round(state.value)}${suffix}`;
      },
    });
  }
}

function initBars() {
  for (const bar of document.querySelectorAll<HTMLElement>('[data-bar]')) {
    const value = `${bar.dataset.bar}%`;

    if (reduceMotion) {
      bar.style.width = value;
      continue;
    }

    ScrollTrigger.create({
      trigger: bar,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        bar.style.width = value;
      },
    });
  }
}

/* ══════════════════════════════════════════════════════════
   BARRA DE PROGRESO
   ══════════════════════════════════════════════════════════ */
function initProgress() {
  const bar = document.getElementById('progress');
  if (!bar) return;

  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
  });
}

/* ══════════════════════════════════════════════════════════
   ATENUACIÓN DEL FONDO 3D
   El fondo es protagonista en el hero y estorbo en cuanto hay
   que leer un párrafo. Al salir del hero baja a un cuarto de
   opacidad: sigue habiendo profundidad, pero el texto gana.
   ══════════════════════════════════════════════════════════ */
function initSceneFade() {
  const canvas = document.getElementById('scene');
  const hero = document.getElementById('inicio');
  if (!canvas || !hero || reduceMotion) return;

  gsap.to(canvas, {
    opacity: 0.24,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'bottom 90%',
      end: 'bottom 25%',
      scrub: 0.4,
    },
  });
}

/* ══════════════════════════════════════════════════════════
   NAVEGACIÓN: ENLACE ACTIVO + MENÚ MÓVIL
   ══════════════════════════════════════════════════════════ */
function initNav() {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'),
  );

  const setActive = (id: string) => {
    for (const link of links) {
      link.classList.toggle(
        'is-active',
        link.getAttribute('href') === `#${id}`,
      );
    }
  };

  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  for (const section of sections) observer.observe(section);

  // Menú móvil
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');

  if (burger && menu) {
    const close = () => {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
    };

    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    for (const link of menu.querySelectorAll('[data-mobile-link]')) {
      link.addEventListener('click', close);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════
   PUNTERO: RESPLANDOR, BOTONES MAGNÉTICOS, INCLINACIÓN DE TARJETAS
   Todo esto se salta en pantallas táctiles: no hay puntero que seguir.
   ══════════════════════════════════════════════════════════ */
function initPointerEffects() {
  if (reduceMotion || isCoarsePointer) return;

  // Resplandor que sigue al cursor
  const glow = document.getElementById('cursor-glow');
  if (glow) {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const target = { ...pos };

    addEventListener(
      'pointermove',
      (e) => {
        target.x = e.clientX;
        target.y = e.clientY;
      },
      { passive: true },
    );

    gsap.ticker.add(() => {
      pos.x += (target.x - pos.x) * 0.11;
      pos.y += (target.y - pos.y) * 0.11;
      glow.style.transform = `translate3d(${pos.x - 260}px,${pos.y - 260}px,0)`;
    });
  }

  // Botones magnéticos
  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * 0.28,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.45,
        ease: 'power3.out',
      });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
    });
  }

  // Inclinación 3D de las tarjetas de proyecto
  for (const card of document.querySelectorAll<HTMLElement>('.pcard')) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      gsap.to(card, {
        rotateX: (0.5 - py) * 9,
        rotateY: (px - 0.5) * 11,
        y: -6,
        transformPerspective: 900,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  }
}

/* ══════════════════════════════════════════════════════════
   FILTRO DE PROYECTOS
   Vive aquí y no en Projects.astro porque Astro inlina los <script>
   pequeños de componente, y un script inline obliga a abrir la CSP.
   Funciona sobre nodos ya presentes en el HTML servido: sin JS la
   parrilla se ve entera.
   ══════════════════════════════════════════════════════════ */
function initProjectFilter() {
  const grid = document.getElementById('proj-grid');
  const counter = document.getElementById('proj-count');
  const empty = document.getElementById('proj-empty');
  if (!grid || !counter || !empty) return;

  const chips = document.querySelectorAll<HTMLButtonElement>('.filter-chip');
  const cards = Array.from(grid.querySelectorAll<HTMLLIElement>('li'));

  const apply = (filter: string) => {
    let visible = 0;
    for (const card of cards) {
      const show = filter === 'TODO' || card.dataset.category === filter;
      card.hidden = !show;
      if (show) visible++;
    }
    counter.textContent = String(visible).padStart(2, '0');
    empty.hidden = visible !== 0;
    ScrollTrigger.refresh();
  };

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      for (const c of chips) c.setAttribute('aria-pressed', 'false');
      chip.setAttribute('aria-pressed', 'true');
      apply(chip.dataset.filter ?? 'TODO');
    });
  }
}

/* ══════════════════════════════════════════════════════════
   COPIAR AL PORTAPAPELES
   ══════════════════════════════════════════════════════════ */
function initCopyButtons() {
  const status = document.getElementById('copy-status');
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-copy]');

  for (const btn of buttons) {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);

        const original = btn.innerHTML;
        btn.classList.add('bg-cyan', 'text-ink');
        // Construimos el icono con el DOM en vez de innerHTML: no hay
        // ninguna cadena de marcado cruzando una asignación de HTML.
        const svg = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg',
        );
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2.5');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        );
        path.setAttribute('d', 'm20 6-11 11-5-5');
        svg.appendChild(path);
        btn.replaceChildren(svg);

        if (status) status.textContent = `${value} copiado al portapapeles`;

        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove('bg-cyan', 'text-ink');
        }, 1800);
      } catch {
        // Portapapeles denegado (contexto inseguro o permiso rechazado):
        // el enlace mailto de al lado sigue funcionando.
        if (status) {
          status.textContent = 'No se pudo copiar. Usa el enlace de correo.';
        }
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════
   FONDO 3D — se carga aparte y tarde, a propósito
   ══════════════════════════════════════════════════════════ */
function initScene() {
  // three.js es el paquete más pesado del sitio. No entra si el usuario
  // pidió menos movimiento, ni en pantallas pequeñas donde el coste de
  // batería no compensa, ni antes de que la página esté utilizable.
  if (reduceMotion) return;
  if (window.innerWidth < 768) return;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
    return;

  const start = () => {
    import('./scene')
      .then((m) => m.mountScene('#scene'))
      .catch(() => {
        /* El fondo es decorativo: si falla, la página no se entera. */
      });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 2600 });
  } else {
    setTimeout(start, 1200);
  }
}

/* ══════════════════════════════════════════════════════════
   ARRANQUE
   ══════════════════════════════════════════════════════════ */
initReveals();
initCounters();
initBars();
initProgress();
initSceneFade();
initNav();
initProjectFilter();
initCopyButtons();
initPointerEffects();
initScene();
void initSmoothScroll();

// El contenido cambia de altura al cargar fuentes e imágenes; sin esto
// los triggers quedan calculados sobre la maquetación equivocada.
addEventListener('load', () => ScrollTrigger.refresh());
