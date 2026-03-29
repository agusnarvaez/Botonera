/**
 * convert-to-mp3.ts
 *
 * Convierte todos los .ogg de frontend/public/audios a .mp3
 * usando ffmpeg-static (no necesita ffmpeg instalado en el sistema).
 *
 * Uso:
 *   cd scripts
 *   npm run convert
 */

import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import {readdirSync, existsSync} from 'fs'
import {join, extname, basename, dirname} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUDIOS_DIR = join(__dirname, '..', 'frontend', 'public', 'audios')

if (!ffmpegPath) {
  console.error('❌ No se encontró ffmpeg-static. Corré npm install primero.')
  process.exit(1)
}

ffmpeg.setFfmpegPath(ffmpegPath)

const oggFiles = readdirSync(AUDIOS_DIR).filter((f) => extname(f) === '.ogg')

if (oggFiles.length === 0) {
  console.log('No hay archivos .ogg en', AUDIOS_DIR)
  process.exit(0)
}

console.log(`🎵 Convirtiendo ${oggFiles.length} archivos .ogg → .mp3...\n`)

let done = 0
let skipped = 0
let failed = 0

function convertFile(filename: string): Promise<void> {
  const input = join(AUDIOS_DIR, filename)
  const output = join(AUDIOS_DIR, basename(filename, '.ogg') + '.mp3')

  if (existsSync(output)) {
    console.log(`  ⏭  Ya existe: ${basename(output)}`)
    skipped++
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    ffmpeg(input)
      .audioCodec('libmp3lame')
      .audioQuality(2)
      .on('end', () => {
        console.log(`  ✅ ${filename} → ${basename(output)}`)
        done++
        resolve()
      })
      .on('error', (err: Error) => {
        console.error(`  ❌ Error en ${filename}:`, err.message)
        failed++
        resolve()
      })
      .save(output)
  })
}

// Convertir uno por uno para no saturar memoria
for (const file of oggFiles) {
  await convertFile(file)
}

console.log('\n────────────────────────────────')
console.log(`✅ Convertidos: ${done}`)
console.log(`⏭  Ya existían: ${skipped}`)
console.log(`❌ Errores:     ${failed}`)
console.log('────────────────────────────────')

if (done > 0) {
  console.log('\n🎉 Listo! Ahora podés correr el seed:')
  console.log('   SANITY_WRITE_TOKEN=tu_token npm run seed')
}
