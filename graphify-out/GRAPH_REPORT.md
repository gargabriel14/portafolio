# Graph Report - Portafolio  (2026-08-15)

## Corpus Check
- 43 files · ~87,704 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 164 nodes · 174 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Componentes de sección
- Dependencias de desarrollo
- Capa de movimiento
- Dependencias de producción
- Manifiesto del paquete
- Scripts de npm
- Parrilla de proyectos
- Configuración de TypeScript
- Despliegue y cabeceras
- Formato de código
- Verificador de CSP
- Generador de imagen OG
- Servidor estático de tests
- Esquema de contenido

## God Nodes (most connected - your core abstractions)
1. `scripts` - 12 edges
2. `allowScripts` - 3 edges
3. `identity` - 3 edges
4. `seo` - 3 edges
5. `mountScene()` - 3 edges
6. `include` - 3 edges
7. `plugins` - 2 edges
8. `engines` - 2 edges
9. `@astrojs/sitemap` - 2 edges
10. `@fontsource/orbitron` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (18 total, 1 thin omitted)

### Community 0 - "Componentes de sección"
Cohesion: 0.11
Nodes (17): year, links, availability, education, identity, intro, proficiency, seo (+9 more)

### Community 1 - "Dependencias de desarrollo"
Cohesion: 0.10
Nodes (21): @astrojs/check, @axe-core/playwright, devDependencies, @astrojs/check, @axe-core/playwright, @playwright/test, prettier, prettier-plugin-astro (+13 more)

### Community 2 - "Capa de movimiento"
Cohesion: 0.14
Nodes (3): initScene(), createGlowTexture(), mountScene()

### Community 3 - "Dependencias de producción"
Cohesion: 0.13
Nodes (15): astro, @astrojs/sitemap, @fontsource/orbitron, @fontsource/rajdhani, gsap, dependencies, astro, @astrojs/sitemap (+7 more)

### Community 4 - "Manifiesto del paquete"
Cohesion: 0.15
Nodes (12): allowScripts, esbuild, sharp, author, description, engines, node, license (+4 more)

### Community 5 - "Scripts de npm"
Cohesion: 0.17
Nodes (12): scripts, astro, build, check, check:csp, dev, format, format:check (+4 more)

### Community 6 - "Parrilla de proyectos"
Cohesion: 0.25
Nodes (4): initial, categories, entries, statusMeta

### Community 7 - "Configuración de TypeScript"
Cohesion: 0.25
Nodes (7): **/*, astro/tsconfigs/strict, .astro/types.d.ts, dist, exclude, extends, include

### Community 8 - "Despliegue y cabeceras"
Cohesion: 0.25
Nodes (7): buildCommand, cleanUrls, framework, headers, outputDirectory, $schema, trailingSlash

### Community 9 - "Formato de código"
Cohesion: 0.29
Nodes (6): overrides, plugins, printWidth, semi, singleQuote, prettier-plugin-astro

### Community 10 - "Verificador de CSP"
Cohesion: 0.29
Nodes (4): allowsInlineScript, DIST, problems, ROOT

### Community 11 - "Generador de imagen OG"
Cohesion: 0.33
Nodes (4): location, name, role, stack

### Community 12 - "Servidor estático de tests"
Cohesion: 0.40
Nodes (5): PORT, resolveFile(), ROOT, server, TYPES

## Knowledge Gaps
- **82 isolated node(s):** `singleQuote`, `semi`, `printWidth`, `prettier-plugin-astro`, `overrides` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dependencias de desarrollo` to `Manifiesto del paquete`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependencias de producción` to `Manifiesto del paquete`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `scripts` connect `Scripts de npm` to `Manifiesto del paquete`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `singleQuote`, `semi`, `printWidth` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Componentes de sección` be split into smaller, more focused modules?**
  _Cohesion score 0.1103448275862069 - nodes in this community are weakly interconnected._
- **Should `Dependencias de desarrollo` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Capa de movimiento` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._