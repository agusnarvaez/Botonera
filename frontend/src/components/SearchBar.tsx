import {useTransition} from 'react'
import styles from './SearchBar.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
  total: number
  filtered: number
}

export function SearchBar({value, onChange, total, filtered}: Props) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    startTransition(() => {
      onChange(v)
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <svg
          className={styles.icon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={`${styles.input} ${isPending ? styles.pending : ''}`}
          type="search"
          placeholder="Buscar frase..."
          value={value}
          onChange={handleChange}
          aria-label="Buscar frases"
          aria-controls="soundboard-grid"
        />
        {value && (
          <button
            className={styles.clearBtn}
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
            tabIndex={0}
          >
            ✕
          </button>
        )}
      </div>
      {value && (
        <p className={styles.count} aria-live="polite" aria-atomic="true">
          {filtered} de {total} frase{total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
