import styles from './NowPlaying.module.css'
import type {AudioState} from '../types'

const SPEEDS = [0.75, 1, 1.5, 2] as const

interface Props {
  title: string
  audioUrl: string
  slug: string
  audioState: AudioState
  playbackRate: number
  onPause: () => void   // ■ pausa pero mantiene la barra
  onStop: () => void    // ✕ cierra la barra
  onReplay: () => void
  onSetPlaybackRate: (rate: number) => void
}

export function NowPlaying({title, audioState, playbackRate, onPause, onStop, onReplay, onSetPlaybackRate}: Props) {
  const isEnded = audioState === 'ended'

  return (
    <div
      className={`${styles.bar} ${isEnded ? styles.barEnded : ''}`}
      role="status"
      aria-live="polite"
      aria-label={isEnded ? `Terminó: ${title}` : `Reproduciendo: ${title}`}
    >
      {/* Waveform */}
      <div className={`${styles.waveform} ${isEnded ? styles.waveformIdle : ''}`} aria-hidden="true">
        <span /><span /><span /><span /><span />
        <span /><span /><span />
      </div>

      {/* Label + Title */}
      <div className={styles.info}>
        <span className={`${styles.label} ${isEnded ? styles.labelEnded : ''}`}>
          {isEnded ? 'TERMINÓ' : 'REPRODUCIENDO'}
        </span>
        <span className={styles.title}>{title}</span>
      </div>

      {/* Speed controls */}
      <div className={styles.speedControls} aria-label="Velocidad de reproducción">
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={`${styles.speedBtn} ${playbackRate === s ? styles.speedBtnActive : ''}`}
            onClick={() => onSetPlaybackRate(s)}
            aria-pressed={playbackRate === s}
            title={`${s}x`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Action buttons — layout fijo para evitar saltos */}
      {isEnded ? (
        <button
          className={styles.replayBtn}
          onClick={onReplay}
          aria-label="Reproducir de nuevo"
          title="Reproducir de nuevo"
        >
          ▶
        </button>
      ) : (
        <button
          className={styles.stopBtn}
          onClick={onPause}
          aria-label="Detener reproducción"
          title="Detener"
        >
          ■
        </button>
      )}

      {/* Close — siempre visible */}
      <button
        className={styles.closeBtn}
        onClick={onStop}
        aria-label="Cerrar"
        title="Cerrar"
      >
        ✕
      </button>
    </div>
  )
}
