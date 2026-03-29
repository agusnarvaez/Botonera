# Botonera de Nazario — CLAUDE.md

Guía para Claude Code en este proyecto.

## Estructura del proyecto

```
/Botonera
├── botonera/       # Sanity Studio (CMS)
├── frontend/       # React SPA (Vite + TypeScript)
├── scripts/        # Script de seed para migrar datos
├── CLAUDE.md       # Este archivo
└── README.md
```

## Comandos

### Sanity Studio
```bash
cd botonera
npm install
npm run dev       # http://localhost:3333
npm run build     # Build del studio
npm run deploy    # Deploy del studio a Sanity
```

### Frontend React
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # Build de producción
npm run preview   # Preview del build
npm test          # Tests en modo watch
npm run test:run  # Tests una vez (CI)
npm run coverage  # Reporte de cobertura
```

### Script de seed
```bash
cd scripts
npm install
# Primero crear .env en /Botonera con:
#   SANITY_PROJECT_ID=04fqowcd
#   SANITY_DATASET=production
#   SANITY_WRITE_TOKEN=<tu_token_editor>
npm run seed
```

## Variables de entorno

### Frontend (`frontend/.env.local`)
```
VITE_SANITY_PROJECT_ID=04fqowcd
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```
Token solo necesario si el dataset es privado.

### Scripts (`scripts/.env` o variable de entorno)
```
SANITY_WRITE_TOKEN=<token_editor_de_sanity>
```

## Sanity

- **Project ID**: `04fqowcd`
- **Dataset**: `production`
- **Schemas**: `audioButton`, `siteSettings`

### Agregar un nuevo audio
1. Abrir Sanity Studio: `cd botonera && npm run dev`
2. Crear nuevo documento `Botón de Audio`
3. Subir archivo `.mp3` (preferido para iOS) o `.ogg`
4. Completar título, emoji, color y categoría
5. Publicar el documento

## Arquitectura del frontend

### Stack
- Vite + React 19 + TypeScript
- @tanstack/react-query — caching de datos de Sanity
- CSS Modules — estilos encapsulados
- Vitest + React Testing Library — tests

### Estado global
El audio usa un `AudioContext` (React Context) para compartir el estado entre `Soundboard` y `NowPlaying`. Un solo audio reproduce a la vez.

### Flujo de datos
```
Sanity API → useSanityButtons (react-query) → Soundboard → AudioButton
                                                          ↕ AudioContext
                                             App → NowPlaying
```

### Estructura de src/
```
src/
├── components/
│   ├── AudioButton/    # Botón individual de audio
│   ├── Soundboard/     # Grid principal de botones
│   ├── NowPlaying.tsx  # Barra inferior mientras reproduce
│   ├── SearchBar.tsx   # Búsqueda de frases
│   ├── RandomButton.tsx# Botón "Sorprendeme"
│   └── ErrorBoundary.tsx
├── contexts/
│   └── AudioContext.tsx # Estado global de audio
├── hooks/
│   ├── useAudio.ts     # Lógica de HTMLAudioElement
│   └── useSanityButtons.ts # Fetch de Sanity via react-query
├── lib/
│   └── sanity.ts       # Cliente Sanity + queries GROQ
└── types/
    └── index.ts        # Tipos TypeScript compartidos
```

## Tests

Los tests están co-localizados con sus componentes (`*.test.tsx` / `*.test.ts`).

```bash
# Correr todos los tests
cd frontend && npm run test:run

# Con cobertura
cd frontend && npm run coverage
```

Patrones de mock:
- `HTMLAudioElement`: mockeado en `src/test-setup.ts`
- `@sanity/client`: mockeado via `vi.spyOn(sanityLib, 'fetchAudioButtons')`
- `useSanityButtons`: mockeado via `vi.spyOn(hooks, 'useSanityButtons')`

## Convenciones de código

- TypeScript estricto (`strict: true`)
- Componentes: PascalCase, exports nombrados
- Hooks: camelCase con prefijo `use`
- CSS Modules: clases en camelCase
- Tests: `describe > it` con nombres descriptivos en español
- Sin `console.log` en código de producción

## Compatibilidad de audio

- `.mp3` — compatible con todos los navegadores incluyendo iOS Safari
- `.ogg` — **NO compatible con iOS/Safari** (ni iPhone ni Mac Safari)
- Siempre subir `.mp3` para garantizar reproducción en todos los dispositivos

## Notas de desarrollo

- El `useAudio` hook maneja el unlock de `AudioContext` para iOS
  (los navegadores móviles requieren un gesto del usuario para iniciar audio)
- La URL `?s=<slug>` auto-reproduce el audio al cargar la página (para compartir)
- Los favoritos se guardan en `localStorage` como array de slugs
- Los atajos de teclado 1-9 reproducen los primeros 9 botones de la grilla

## No hacer

- No hacer commit de `.env.local` ni tokens de Sanity
- No usar `any` en TypeScript sin comentario justificando por qué
- No crear backend (la app es una SPA estática)
- No agregar autenticación (acceso público por diseño)
