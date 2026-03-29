import styles from './NowPlaying.module.css'

interface Props {
  title: string
  onStop: () => void
}

export function NowPlaying({title, onStop}: Props) {
  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.waveform} aria-hidden="true">
        <span /><span /><span /><span /><span />
        <span /><span /><span />
      </div>
      <span className={styles.label}>REPRODUCIENDO</span>
      <span className={styles.title}>{title}</span>
      <button
        className={styles.stopBtn}
        onClick={onStop}
        aria-label="Detener reproducción"
        title="Detener"
      >
        ■
      </button>
    </div>
  )
}
