/**
 * seed-sanity.ts
 *
 * Migra los botones de audio del frontend Express a Sanity CMS.
 *
 * Pre-requisitos:
 *   1. Crear un token de escritura en sanity.io/manage (Tokens → Add API Token → Editor)
 *   2. Crear .env en la raíz del proyecto con:
 *      SANITY_PROJECT_ID=04fqowcd
 *      SANITY_DATASET=production
 *      SANITY_WRITE_TOKEN=tu_token_aqui
 *
 * Uso:
 *   cd scripts
 *   npx tsx seed-sanity.ts
 *
 * NOTA: Los archivos .ogg NO funcionan en iOS/Safari.
 * Para compatibilidad total, convierte los audios a .mp3 antes de hacer seed.
 * Herramienta recomendada: ffmpeg
 *   ffmpeg -i input.ogg -codec:a libmp3lame -q:a 2 output.mp3
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {join, basename, extname, dirname} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ──────────────────────────────────────────────────────────────────
const PROJECT_ID = process.env.SANITY_PROJECT_ID ?? '04fqowcd'
const DATASET = process.env.SANITY_DATASET ?? 'production'
const WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN

if (!WRITE_TOKEN) {
  console.error(
    '❌ SANITY_WRITE_TOKEN no definido.\n' +
      '   Creá un token en https://www.sanity.io/manage\n' +
      '   y ponelo en .env o como variable de entorno.',
  )
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: WRITE_TOKEN,
  useCdn: false,
})

// ── Paths ────────────────────────────────────────────────────────────────────
const FRONTEND_DIR = join(__dirname, '..', 'frontend')
const AUDIOS_DIR = join(FRONTEND_DIR, 'public', 'audios')
const BOTONES_JSON = join(FRONTEND_DIR, 'src', 'data', 'botones.json')

// ── Types ────────────────────────────────────────────────────────────────────
interface OldButton {
  id: number
  titulo: string
  audio: string // ej: "/audios/nazario-del-barrio.ogg"
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mimes: Record<string, string> = {
    '.ogg': 'audio/ogg',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
  }
  return mimes[ext] ?? 'audio/octet-stream'
}

async function uploadAudio(filePath: string): Promise<{_ref: string; url: string} | null> {
  if (!existsSync(filePath)) {
    console.warn(`  ⚠️  No existe: ${filePath}`)
    return null
  }

  const fileBuffer = readFileSync(filePath)
  const filename = basename(filePath)
  const mimeType = getMimeType(filePath)

  console.log(`  ⬆️  Subiendo: ${filename} (${(fileBuffer.length / 1024).toFixed(1)} KB)`)

  const asset = await client.assets.upload('file', fileBuffer, {
    filename,
    contentType: mimeType,
  })

  return {_ref: asset._id, url: asset.url}
}

async function createAudioButton(
  button: OldButton,
  assetRef: string,
): Promise<void> {
  const slug = slugify(button.titulo)
  const doc = {
    _type: 'audioButton',
    _id: `audioButton-${slug}`,
    title: button.titulo,
    slug: {_type: 'slug', current: slug},
    audioFile: {
      _type: 'file',
      asset: {_type: 'reference', _ref: assetRef},
    },
    order: button.id,
    // category: asignar manualmente desde Sanity Studio (es una referencia)
  }

  await client.createOrReplace(doc)
  console.log(`  ✅ Creado: "${button.titulo}" (slug: ${slug})`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Iniciando seed de Sanity...\n')
  console.log(`   Project: ${PROJECT_ID}`)
  console.log(`   Dataset: ${DATASET}\n`)

  // Leer botones.json
  if (!existsSync(BOTONES_JSON)) {
    console.error(`❌ No encontré botones.json en: ${BOTONES_JSON}`)
    process.exit(1)
  }

  const botones: OldButton[] = JSON.parse(readFileSync(BOTONES_JSON, 'utf-8'))
  console.log(`📋 ${botones.length} botones encontrados.\n`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const btn of botones) {
    console.log(`→ [${btn.id + 1}/${botones.length}] "${btn.titulo}"`)

    // Extraer nombre del archivo del path: "/audios/nazario.ogg" → "nazario.ogg"
    const originalFilename = basename(btn.audio)
    const baseNameNoExt = originalFilename.replace(extname(originalFilename), '')

    // Buscar versión .mp3 primero, luego .ogg
    const mp3Path = join(AUDIOS_DIR, `${baseNameNoExt}.mp3`)
    const oggPath = join(AUDIOS_DIR, originalFilename)

    const filePath = existsSync(mp3Path) ? mp3Path : oggPath

    if (!existsSync(filePath)) {
      console.warn(`  ⚠️  Sin archivo de audio. Saltando.`)
      skipped++
      continue
    }

    if (extname(filePath) === '.ogg') {
      console.warn(
        '  ⚠️  AVISO: Subiendo .ogg. iOS/Safari no lo soporta.\n' +
          `     Convierte a .mp3 con: ffmpeg -i ${originalFilename} -codec:a libmp3lame ${baseNameNoExt}.mp3`,
      )
    }

    try {
      const asset = await uploadAudio(filePath)
      if (!asset) {
        failed++
        continue
      }
      await createAudioButton(btn, asset._ref)
      success++
    } catch (err) {
      console.error(`  ❌ Error procesando "${btn.titulo}":`, err)
      failed++
    }
  }

  console.log('\n────────────────────────────────')
  console.log(`✅ Éxitos:   ${success}`)
  console.log(`⚠️  Saltados: ${skipped}`)
  console.log(`❌ Errores:  ${failed}`)
  console.log('────────────────────────────────')

  if (success > 0) {
    console.log('\n🎉 ¡Seed completado!')
    console.log('   Abrí el Sanity Studio para editar categorías, colores y emojis.')
    console.log('   cd botonera && npm run dev')
  }
}

seed().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
