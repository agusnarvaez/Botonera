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

const IDLE_STATE: AudioPlayerState = {
  currentSlug: null,
  currentUrl: null,
  currentTitle: null,
  state: 'idle',
  error: null,
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackRateRef = useRef(1)
  const [playerState, setPlayerState] = useState<AudioPlayerState>(IDLE_STATE)
  const [playbackRate, setPlaybackRateState] = useState(1)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayerState(IDLE_STATE)
  }, [])

  // Pausa el audio pero mantiene la barra visible (estado 'ended')
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setPlayerState((prev) => ({...prev, state: 'ended'}))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate
    setPlaybackRateState(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [])

  const play = useCallback(
    async (url: string, slug: string, title: string) => {
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
      audio.playbackRate = playbackRateRef.current
      audioRef.current = audio

      setPlayerState({currentSlug: slug, currentUrl: url, currentTitle: title, state: 'playing', error: null})

      audio.onended = () => {
        setPlayerState((prev) => ({...prev, state: 'ended'}))
      }

      audio.onerror = () => {
        const msg = 'No se pudo reproducir el audio. ¿Probaste con otro navegador?'
        setPlayerState((prev) => ({...prev, state: 'error', error: msg}))
      }

      try {
        await audio.play()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setPlayerState((prev) => ({
          ...prev,
          state: 'error',
          error: `Error al reproducir: ${message}`,
        }))
      }
    },
    [playerState.currentSlug, playerState.state, stop],
  )

  return {
    play,
    stop,
    pause,
    setPlaybackRate,
    playbackRate,
    currentSlug: playerState.currentSlug,
    currentUrl: playerState.currentUrl,
    currentTitle: playerState.currentTitle,
    audioState: playerState.state,
    error: playerState.error,
    isPlaying: playerState.state === 'playing',
  }
}
