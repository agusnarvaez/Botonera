import {useEffect, useMemo, useState} from 'react'
import {AudioButton} from '../AudioButton/AudioButton'
import {SearchBar} from '../SearchBar'
import {RandomButton} from '../RandomButton'
import {useAudioContext} from '../../contexts/AudioContext'
import {useSanityButtons, useSanityCategories} from '../../hooks/useSanityButtons'
import type {AudioButton as AudioButtonType} from '../../types'
import styles from './Soundboard.module.css'

// Keyboard shortcut: teclas 1-9 reproducen los primeros 9 botones
function useKeyboardShortcuts(
  buttons: AudioButtonType[],
  play: (url: string, slug: string) => void,
) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9) {
        const btn = buttons[num - 1]
        if (btn?.audioFile?.asset?.url) {
          play(btn.audioFile.asset.url, btn.slug.current)
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [buttons, play])
}

// Share link: ?s=slug auto-play al cargar
function useShareAutoPlay(
  buttons: AudioButtonType[],
  play: (url: string, slug: string) => void,
) {
  const [handled, setHandled] = useState(false)
  useEffect(() => {
    if (handled || buttons.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('s')
    if (slug) {
      const btn = buttons.find((b) => b.slug.current === slug)
      if (btn?.audioFile?.asset?.url) {
        play(btn.audioFile.asset.url, btn.slug.current)
      }
    }
    setHandled(true)
  }, [buttons, play, handled])
}

const FAVORITES_VALUE = '__favoritos__'

function ButtonSkeleton() {
  return <div className={styles.skeleton} aria-hidden="true" />
}

interface SoundboardContentProps {
  buttons: AudioButtonType[]
}

function SoundboardContent({buttons}: SoundboardContentProps) {
  const {play, currentSlug, audioState, error} = useAudioContext()
  const {data: sanityCategories} = useSanityCategories()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')

  useKeyboardShortcuts(buttons, play)
  useShareAutoPlay(buttons, play)

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('botonera-favorites')
      return new Set(stored ? (JSON.parse(stored) as string[]) : [])
    } catch {
      return new Set()
    }
  })

  function toggleFavorite(slug: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      localStorage.setItem('botonera-favorites', JSON.stringify([...next]))
      return next
    })
  }

  // Tabs: Todos + categorías de Sanity + Favoritos
  const categoryTabs = useMemo(() => {
    const dynamic = (sanityCategories ?? []).map((c) => ({
      value: c.slug.current,
      label: c.label,
    }))
    return [
      {value: '', label: 'Todos'},
      ...dynamic,
      {value: FAVORITES_VALUE, label: `Favoritos (${favorites.size})`},
    ]
  }, [sanityCategories, favorites.size])

  const filteredButtons = useMemo(() => {
    return buttons.filter((btn) => {
      const matchesSearch = search
        ? btn.title.toLowerCase().includes(search.toLowerCase())
        : true
      const matchesCategory =
        activeCategory === FAVORITES_VALUE
          ? favorites.has(btn.slug.current)
          : activeCategory
            ? btn.category === activeCategory
            : true
      return matchesSearch && matchesCategory
    })
  }, [buttons, search, activeCategory, favorites])

  function handleRandom() {
    const eligible = filteredButtons.filter((b) => b.audioFile?.asset?.url)
    if (eligible.length === 0) return
    const pick = eligible[Math.floor(Math.random() * eligible.length)]!
    play(pick.audioFile.asset.url, pick.slug.current)
  }

  function handleShare(slug: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('s', slug)
    navigator.clipboard.writeText(url.toString()).catch(() => {/* ignore */})
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <SearchBar
          value={search}
          onChange={setSearch}
          total={buttons.length}
          filtered={filteredButtons.length}
        />
        <RandomButton onClick={handleRandom} disabled={filteredButtons.length === 0} />
      </div>

      {/* Category tabs */}
      <div className={styles.categories} role="tablist" aria-label="Filtrar por categoría">
        {categoryTabs.map(({value, label}) => (
          <button
            key={value}
            role="tab"
            aria-selected={activeCategory === value}
            className={`${styles.catTab} ${activeCategory === value ? styles.catTabActive : ''} ${value === FAVORITES_VALUE ? styles.catTabFav : ''}`}
            onClick={() => setActiveCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredButtons.length === 0 ? (
        <p className={styles.empty}>
          {activeCategory === FAVORITES_VALUE
            ? 'No hay favoritos todavía. Clickeá el corazón en cualquier frase.'
            : search
              ? `No encontré nada para "${search}"`
              : 'No hay frases disponibles'}
        </p>
      ) : (
        <div
          id="soundboard-grid"
          className={styles.grid}
          role="list"
          aria-label="Botonera de audios"
        >
          {filteredButtons.map((btn, idx) => (
            <div
              key={btn._id}
              role="listitem"
              className={styles.cell}
              data-keyboard-hint={idx < 9 ? String(idx + 1) : undefined}
            >
              <AudioButton
                button={btn}
                isPlaying={currentSlug === btn.slug.current && audioState === 'playing'}
                hasError={currentSlug === btn.slug.current && audioState === 'error'}
                onPlay={play}
              />
              <div className={styles.cellActions}>
                <button
                  className={`${styles.favBtn} ${favorites.has(btn.slug.current) ? styles.favActive : ''}`}
                  onClick={() => toggleFavorite(btn.slug.current)}
                  aria-label={favorites.has(btn.slug.current) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  title={favorites.has(btn.slug.current) ? 'Quitar favorito' : 'Favorito'}
                >
                  ♥
                </button>
                <button
                  className={styles.shareBtn}
                  onClick={() => handleShare(btn.slug.current)}
                  aria-label={`Copiar link de: ${btn.title}`}
                  title="Copiar link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && currentSlug && (
        <p className={styles.globalError} role="alert">
          {error}
        </p>
      )}

      <p className={styles.keyHint} aria-hidden="true">
        Atajos: teclas 1–9 para las primeras frases
      </p>
    </div>
  )
}

export function Soundboard() {
  const {data: buttons, isLoading, error} = useSanityButtons()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.controls}>
          <div className={styles.skeletonInput} aria-hidden="true" />
          <div className={styles.skeletonBtn} aria-hidden="true" />
        </div>
        <div className={styles.grid} aria-label="Cargando frases..." aria-busy="true">
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} className={styles.cell}>
              <ButtonSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.fetchError} role="alert">
        <p>No se pudieron cargar las frases.</p>
        <p className={styles.fetchErrorDetail}>{error.message}</p>
        <p>Chequeá que el dataset de Sanity esté público y tenga contenido.</p>
      </div>
    )
  }

  return <SoundboardContent buttons={buttons ?? []} />
}
