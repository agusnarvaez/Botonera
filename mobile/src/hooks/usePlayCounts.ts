import {useCallback, useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'botonera-play-counts'

export function usePlayCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Carga inicial desde AsyncStorage
  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) setCounts(JSON.parse(raw) as Record<string, number>)
    } catch {/* ignore */}
  }, [])

  const increment = useCallback(async (slug: string) => {
    setCounts((prev) => {
      const next = {...prev, [slug]: (prev[slug] ?? 0) + 1}
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {/* ignore */})
      return next
    })
  }, [])

  return {counts, increment, load}
}
