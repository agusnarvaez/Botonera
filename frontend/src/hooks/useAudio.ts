import {useCallback, useRef, useState} from 'react'
import type {AudioPlayerState} from '../types'

// Unlock AudioContext en iOS/Safari — debe llamarse en el primer gesto del usuario
function unlockAudioContext(): void {
  const AudioCtx =
    window.AudioContext ?? (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext
  if (!AudioCtx) return
  const ctx = new AudioCtx()
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {/* silently ignore */})
  }
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    currentSlug: null,
    state: 'idle',
    error: null,
  })

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayerState({currentSlug: null, state: 'idle', error: null})
  }, [])

  const play = useCallback(
    async (url: string, slug: string) => {
      // iOS AudioContext unlock en el primer gesto
      unlockAudioContext()

      // Si ya está reproduciendo el mismo audio, lo para (toggle)
      if (playerState.currentSlug === slug && playerState.state === 'playing') {
        stop()
        return
      }

      // Parar el audio anterior si hay uno
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.onended = null
        audioRef.current.onerror = null
      }

      const audio = new Audio(url)
      audio.volume = 0.85
      audioRef.current = audio

      setPlayerState({currentSlug: slug, state: 'playing', error: null})

      audio.onended = () => {
        setPlayerState({currentSlug: null, state: 'idle', error: null})
      }

      audio.onerror = () => {
        const msg = 'No se pudo reproducir el audio. ¿Probaste con otro navegador?'
        setPlayerState({currentSlug: slug, state: 'error', error: msg})
      }

      try {
        await audio.play()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setPlayerState({
          currentSlug: slug,
          state: 'error',
          error: `Error al reproducir: ${message}`,
        })
      }
    },
    [playerState.currentSlug, playerState.state, stop],
  )

  return {
    play,
    stop,
    currentSlug: playerState.currentSlug,
    audioState: playerState.state,
    error: playerState.error,
    isPlaying: playerState.state === 'playing',
  }
}
