/**
 * FUENTE ÚNICA DE VERDAD del portafolio.
 *
 * Regla que gobierna este archivo (heredada de perfil-profesional-gabriel-garcia.md):
 * no se inventan empresas, clientes, estudios, certificaciones, fechas, tecnologías,
 * métricas ni permisos laborales. Si un dato no está confirmado, no entra aquí.
 *
 * Todo lo visible en la web sale de este archivo o de src/content/projects/.
 */

export type Social = {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'mail' | 'phone';
  /** Texto que se copia al portapapeles, cuando aplica. */
  copyValue?: string;
};

export const identity = {
  fullName: 'Gabriel José García Alcedo',
  shortName: 'Gabriel García',
  /** Marca del sitio: iniciales + sufijo, en la línea del diseño de referencia. */
  brand: { prefix: 'GABRIEL', suffix: '.DEV' },
  role: 'Desarrollador Web Full-Stack',
  headline: 'Web Developer',
  positioning: 'WordPress · JavaScript · PHP · React · SEO',
  location: 'Getafe / Madrid, España',
  email: 'gargabriel1412@gmail.com',
  phone: '+34 614 947 192',
  phoneHref: '+34614947192',
} as const;

export const intro = {
  /** Párrafo de apertura. Citable, directo, sin adjetivos que no pueda sostener. */
  lead: 'Desarrollador web freelance con experiencia práctica desde 2020 creando, manteniendo y optimizando sitios web y productos digitales.',
  detail:
    'Trabajo el frontend y el full-stack: WordPress, JavaScript, TypeScript, PHP, React y Node.js, con SEO técnico y analítica encima. Me incorporo a proyectos y código que ya existen, investigo la solución y la dejo operativa.',
} as const;

export const availability = {
  status: 'Disponible',
  detail: 'Disponibilidad inmediata · Jornada completa · Modalidad remota',
  seeking: 'Freelance · Contratos por proyecto · Contractor · Full-time remoto',
} as const;

export const socials: Social[] = [
  {
    // OJO: perfil-profesional-gabriel-garcia.md apunta a /gargabriel1, que
    // devuelve 404. La cuenta real es gargabriel14 (verificado contra la
    // API de GitHub el 2026-08-15). Corregir también en el CV y LinkedIn.
    label: 'GitHub',
    href: 'https://github.com/gargabriel14',
    icon: 'github',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/gabriel-jose-garcia-alcedo-7a8837335',
    icon: 'linkedin',
  },
  {
    label: 'Email',
    href: `mailto:${identity.email}`,
    icon: 'mail',
    copyValue: identity.email,
  },
  {
    label: 'Teléfono',
    href: `tel:${identity.phoneHref}`,
    icon: 'phone',
    copyValue: identity.phone,
  },
];

/**
 * Contadores del hero. Cada uno es verificable contra el perfil.
 * Deliberadamente NO hay "clientes", "premios" ni "proyectos entregados":
 * no hay cifras confirmadas para eso.
 */
export const stats = [
  { value: 2020, suffix: '', label: 'Desde', hint: 'Primer trabajo web' },
  { value: 5, suffix: '+', label: 'Años', hint: 'De experiencia práctica' },
  { value: 4, suffix: '', label: 'Proyectos', hint: 'En portafolio' },
  { value: 2, suffix: '', label: 'Idiomas', hint: 'Español e inglés' },
] as const;

export type SkillGroup = {
  title: string;
  accent: 'cyan' | 'magenta' | 'violet';
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    accent: 'cyan',
    items: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Angular',
      'Astro',
      'Responsive Design',
    ],
  },
  {
    title: 'Backend y full-stack',
    accent: 'magenta',
    items: ['Node.js', 'MERN Stack', 'PHP', 'MySQL', 'SQL', 'REST APIs'],
  },
  {
    title: 'WordPress y CMS',
    accent: 'violet',
    items: [
      'WordPress',
      'Elementor',
      'Themes y child themes',
      'Plugins',
      'ACF',
      'WooCommerce',
      'Shopify',
    ],
  },
  {
    title: 'SEO y analítica',
    accent: 'cyan',
    items: [
      'SEO técnico',
      'SEO On-Page',
      'Core Web Vitals',
      'Google Search Console',
      'Google Analytics 4',
    ],
  },
  {
    title: 'Hosting y despliegue',
    accent: 'magenta',
    items: ['Hosting', 'Dominios', 'DNS', 'Vercel', 'Git', 'GitHub'],
  },
  {
    title: 'Mobile y datos',
    accent: 'violet',
    items: [
      'React Native',
      'Excel avanzado',
      'Macros y VBA',
      'Automatizaciones y bots',
    ],
  },
  {
    title: 'Diseño y herramientas',
    accent: 'magenta',
    items: [
      'Figma',
      'Photoshop',
      'Illustrator',
    ],
  },
];

/**
 * Barras de nivel. Son autoevaluación declarada, no una métrica medida —
 * el copy de la sección lo dice explícitamente para no vender precisión falsa.
 */
export const proficiency = [
  { label: 'HTML · CSS · Responsive', value: 95 },
  { label: 'JavaScript · TypeScript', value: 88 },
  { label: 'WordPress · PHP', value: 90 },
  { label: 'React · Next.js', value: 82 },
  { label: 'SEO técnico y rendimiento', value: 85 },
] as const;

export type TimelineEntry = {
  period: string;
  title: string;
  org: string;
  place: string;
  accent: 'cyan' | 'magenta' | 'violet' | 'white';
  bullets: string[];
  current?: boolean;
};

export const timeline: TimelineEntry[] = [
  {
    period: 'Jun 2020 — Sep 2024',
    title: 'Web Developer & Community Manager',
    org: 'GS Creaciones Digitales',
    place: 'Maracay, Venezuela',
    accent: 'violet',
    bullets: [
      'Desarrollo y mantenimiento de soluciones web para la agencia.',
      'Gestión de redes sociales y comunidades digitales.',
      'Creación, organización y publicación de contenido para medios sociales.',
      'Funciones técnicas, comunicación digital y soporte operativo combinados.',
    ],
  },
  {
    period: 'Nov 2020 — Actualidad',
    title: 'Freelance Web Developer',
    org: 'El Adoquín Times',
    place: 'Remoto',
    accent: 'cyan',
    current: true,
    bullets: [
      'Desarrollo, mantenimiento y evolución continua de la plataforma digital.',
      'WordPress, PHP, JavaScript, HTML5 y CSS3; Elementor y desarrollo manual.',
      'Themes, plugins y ACF configurados y personalizados.',
      'SEO técnico y On-Page, con Google Search Console y GA4.',
      'Administración de hosting, dominios, DNS y despliegues.',
      'Participación en un rebranding y una optimización general reciente.',
    ],
  },
  {
    period: 'Proyectos freelance',
    title: 'Excel Optimization Assistant',
    org: 'Clientes independientes',
    place: 'Remoto',
    accent: 'magenta',
    bullets: [
      'Optimización y organización de hojas de cálculo.',
      'Procesamiento, limpieza y estructuración de información.',
      'Automatización con macros y VBA según el proyecto.',
    ],
  },
];

export const education = {
  items: [
    { title: 'Bachiller', detail: 'Completado', status: 'done' as const },
    {
      title: 'FP en Administración de Sistemas Informáticos en Red (ASIR)',
      detail: 'Previsto',
      status: 'planned' as const,
    },
  ],
  languages: [
    { name: 'Español', level: 'Nativo' },
    {
      name: 'Inglés',
      level: 'Intermedio · comunicación escrita más sólida que la hablada',
    },
  ],
} as const;

export const seo = {
  title: `${identity.fullName} — ${identity.headline}`,
  shortTitle: `${identity.shortName} — Desarrollador Web`,
  description:
    'Gabriel García, desarrollador web full-stack en Madrid. WordPress, JavaScript, TypeScript, PHP, React y SEO técnico. Disponible para proyectos freelance y remotos.',
  keywords: [
    'desarrollador web',
    'WordPress',
    'JavaScript',
    'TypeScript',
    'PHP',
    'React',
    'SEO técnico',
    'freelance',
    'Madrid',
    'remoto',
  ],
} as const;
