# La Botonera de Nazario del Barrio

Una botonera de audios del Titán. Frase a frase, pelotuda a pelotuda.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Estilos | CSS Modules |
| CMS | Sanity v5 |
| Testing | Vitest + React Testing Library |

## Setup rápido

### 1. Clonar y dependencias

```bash
git clone https://github.com/agusnarvaez/botonera.git
cd botonera

# Frontend
cd frontend && npm install

# Sanity Studio
cd ../botonera && npm install
```

### 2. Variables de entorno

```bash
cp frontend/.env.example frontend/.env.local
# Editar frontend/.env.local si querés cambiar el dataset
```

Por defecto apunta al project `04fqowcd` (producción). No hace falta token si el dataset es público.

### 3. Correr localmente

**Terminal 1 — Sanity Studio:**
```bash
cd botonera
npm run dev
# Abre en http://localhost:3333
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Abre en http://localhost:5173
```

### 4. Agregar audios por primera vez

#### Opción A: Seed automático (desde los archivos .ogg existentes)
```bash
cd scripts
npm install
# Crear token de escritura en https://www.sanity.io/manage
SANITY_WRITE_TOKEN=tu_token npm run seed
```

#### Opción B: Manual desde Sanity Studio
1. Abrir `http://localhost:3333`
2. Crear documentos `Botón de Audio`
3. Subir archivos `.mp3` (recomendado)

## Funcionalidades

- Botonera de audios con diseño retro-punk argentino
- Buscar frases por texto
- Filtrar por categoría (Clásicos, Fútbol, Saludos, Varios)
- Botón "Sorprendeme" — reproduce una frase al azar
- Favoritos guardados en el navegador
- Compartir un audio por link (`?s=nombre-de-la-frase`)
- Atajos de teclado 1-9 para las primeras 9 frases
- Barra "Reproduciendo ahora" mientras suena un audio

## Agregar nuevos audios

1. Abrir Sanity Studio
2. Nuevo documento → `Botón de Audio`
3. Completar:
   - **Título**: lo que aparece en el botón
   - **Archivo de Audio**: subir `.mp3` (ver nota iOS abajo)
   - **Emoji**: opcional, aparece en el botón
   - **Color**: hex opcional para el color del botón
   - **Categoría**: para el filtro
   - **Orden**: número para controlar la posición en la grilla
4. Publicar

## Nota importante: iOS y Safari

Los archivos `.ogg` **no funcionan en iPhone, iPad ni Safari en Mac**.

Convertir a `.mp3` antes de subir:
```bash
# Con ffmpeg (recomendado)
ffmpeg -i mi-audio.ogg -codec:a libmp3lame -q:a 2 mi-audio.mp3
```

## Tests

```bash
cd frontend
npm run test:run      # Una vez
npm test              # Watch mode
npm run coverage      # Con cobertura de código
```

## Deploy

### Frontend (Vercel recomendado)
```bash
cd frontend
npm run build
# Subir /frontend/dist a Vercel, Netlify o cualquier hosting estático
```

Variables de entorno a configurar en el hosting:
```
VITE_SANITY_PROJECT_ID=04fqowcd
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

### Sanity Studio
```bash
cd botonera
npm run deploy
```

## Estructura del proyecto

```
/Botonera
├── botonera/       # Sanity Studio (CMS de audios)
├── frontend/       # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── public/audios/  # Audios estáticos (legacy)
├── scripts/        # Seed de datos
├── CLAUDE.md       # Guía para Claude Code
└── README.md       # Este archivo
```
