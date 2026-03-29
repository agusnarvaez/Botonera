import {useCallback, useState} from 'react'

const STORAGE_KEY = 'botonera-play-counts'

function loadCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

export function usePlayCounts() {
  const [counts, setCounts] = useState<Record<string, number>>(loadCounts)

  const increment = useCallback((slug: string) => {
    setCounts((prev) => {
      const next = {...prev, [slug]: (prev[slug] ?? 0) + 1}
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* storage full — silently ignore */
      }
      return next
    })
  }, [])

  return {counts, increment}
}
