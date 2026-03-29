import {useState, useCallback, useEffect, useRef} from 'react'
import styles from './ShareSheet.module.css'

interface Props {
  slug: string
  title: string
  audioUrl: string
  onClose: () => void
}

export function ShareSheet({slug, title, audioUrl, onClose}: Props) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleCopy = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('s', slug)
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {/* ignore */})
  }, [slug])

  const handleDownload = useCallback(async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `${slug}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch {
      /* ignore fetch/download errors */
    } finally {
      setDownloading(false)
    }
  }, [audioUrl, slug, downloading])

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={`Compartir: ${title}`}
      >
        <div className={styles.handle} aria-hidden="true" />

        <p className={styles.sheetTitle}>{title}</p>

        <div className={styles.actions}>
          {/* Copy link */}
          <button
            className={`${styles.actionBtn} ${copied ? styles.actionBtnSuccess : ''}`}
            onClick={handleCopy}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {copied ? '¡Copiado!' : 'Copiar link'}
          </button>

          {/* Download */}
          <button
            className={styles.actionBtn}
            onClick={handleDownload}
            disabled={downloading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Descargando...' : 'Descargar MP3'}
          </button>
        </div>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </>
  )
}
