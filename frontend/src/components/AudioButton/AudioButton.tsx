import type {AudioButton as AudioButtonType} from '../../types'
import styles from './AudioButton.module.css'

interface Props {
  button: AudioButtonType
  isPlaying: boolean
  hasError: boolean
  onPlay: (url: string, slug: string) => void
}

// Colores de fallback para botones sin color asignado
const FALLBACK_COLORS = [
  '#FF3B3B',
  '#FFDE00',
  '#00B4D8',
  '#FF6B35',
  '#7B2FBE',
  '#06D6A0',
  '#F72585',
  '#4CC9F0',
]

function getButtonColor(button: AudioButtonType): string {
  if (button.color) return button.color
  // Deriva color consistente desde el ID
  const hash = [...button._id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]!
}

export function AudioButton({button, isPlaying, hasError, onPlay}: Props) {
  const color = getButtonColor(button)
  const slug = button.slug.current
  const audioUrl = button.audioFile?.asset?.url

  function handleClick() {
    if (!audioUrl) return
    onPlay(audioUrl, slug)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const stateClass = hasError
    ? styles.error
    : isPlaying
      ? styles.playing
      : styles.idle

  return (
    <button
      className={`${styles.button} ${stateClass}`}
      style={
        {
          '--btn-color': color,
          '--btn-color-dim': `${color}33`,
        } as React.CSSProperties
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Reproducir: ${button.title}`}
      aria-pressed={isPlaying}
      disabled={!audioUrl}
      title={button.title}
      data-testid={`audio-button-${slug}`}
    >
      {isPlaying && (
        <span className={styles.waveform} aria-hidden="true">
          <span /><span /><span /><span /><span />
        </span>
      )}
      {hasError && <span className={styles.errorIcon} aria-hidden="true">!</span>}
      {button.emoji && !isPlaying && !hasError && (
        <span className={styles.emoji} aria-hidden="true">{button.emoji}</span>
      )}
      <span className={styles.title}>{button.title}</span>
    </button>
  )
}
