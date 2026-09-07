import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Los proyectos son contenido tipado, no datos que un formulario mete en el
 * navegador. Añadir uno = crear un .md aquí y hacer commit. Si el frontmatter
 * no cumple el esquema, el build falla con el nombre del campo — que es
 * exactamente lo que queremos que pase antes de desplegar.
 */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Filtro de la parrilla. */
    category: z.enum(['Web', 'App', 'Automatización', 'SEO']),
    /** Frase de una línea que se lee en la tarjeta. */
    summary: z.string(),
    /** Estado real del proyecto. Nada se presenta como terminado si no lo está. */
    status: z.enum(['live', 'development', 'pre-launch']),
    tags: z.array(z.string()).min(1),
    /** Enlace público. Se omite cuando no hay uno que se pueda publicar. */
    link: z.string().url().optional(),
    /** Texto del botón, para no decir "Ver sitio" sobre algo sin publicar. */
    linkLabel: z.string().optional(),
    /**
     * Nombre del archivo dentro de src/assets/projects/. Se resuelve en
     * Projects.astro contra un import.meta.glob, así que Astro lo optimiza
     * y le pone hash. Sin portada se dibuja una generativa a partir del
     * título, que es el respaldo para un proyecto que aún no tiene qué
     * enseñar.
     */
    cover: z.string().optional(),
    /** Texto alternativo de la portada. Obligatorio si hay portada. */
    coverAlt: z.string().optional(),
    /** El destacado ocupa el doble de ancho y abre la parrilla. Solo uno. */
    featured: z.boolean().default(false),
    /** Orden de aparición, menor primero. */
    order: z.number(),
    /** Se marca cuando el trabajo es continuado y sigue vivo. */
    ongoing: z.boolean().default(false),
  }),
});

export const collections = { projects };
