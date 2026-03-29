import {useCallback, useEffect, useRef, useState} from 'react'
import {createAudioPlayer, setAudioModeAsync} from 'expo-audio'
import type {AudioPlayer, AudioStatus} from 'expo-audio'
import type {AudioState} from '../types'

interface PlayerState {
  currentSlug: string | null
  currentUrl: string | null
  currentTitle: string | null
  state: AudioState
  error: string | null
}

const IDLE: PlayerState = {
  currentSlug: null,
  currentUrl: null,
  currentTitle: null,
  state: 'idle',
  error: null,
}

type PlayerSubscription = {
  remove: () => void
}

export function useAudio() {
  const playerRef = useRef<AudioPlayer | null>(null)
  const subscriptionRef = useRef<PlayerSubscription | null>(null)
  const [playerState, setPlayerState] = useState<PlayerState>(IDLE)
  const [playbackRate, setPlaybackRateState] = useState(1)

  const disposePlayer = useCallback(() => {
    subscriptionRef.current?.remove()
    subscriptionRef.current = null

    if (playerRef.current) {
      playerRef.current.remove()
      playerRef.current = null
    }
  }, [])

  const attachStatusListener = useCallback((player: AudioPlayer) => {
    subscriptionRef.current?.remove()
    subscriptionRef.current = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (!status.isLoaded) return

      if (status.playing) {
        setPlayerState((prev) => ({...prev, state: 'playing', error: null}))
        return
      }

      if (status.didJustFinish) {
        setPlayerState((prev) => ({...prev, state: 'ended'}))
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      disposePlayer()
    }
  }, [disposePlayer])

  const stop = useCallback(async () => {
    disposePlayer()
    setPlayerState(IDLE)
  }, [disposePlayer])

  const pause = useCallback(async () => {
    if (playerRef.current) {
      playerRef.current.pause()
    }
    setPlayerState((prev) => ({...prev, state: 'ended'}))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate)

    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate, 'high')
    }
  }, [])

  const play = useCallback(
    async (url: string, slug: string, title: string) => {
      if (playerState.currentSlug === slug && playerState.state === 'playing') {
        await pause()
        return
      }

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        })

        if (playerRef.current && playerState.currentUrl === url) {
          await playerRef.current.seekTo(0)
          playerRef.current.setPlaybackRate(playbackRate, 'high')
          playerRef.current.play()
          setPlayerState({currentSlug: slug, currentUrl: url, currentTitle: title, state: 'playing', error: null})
          return
        }

        disposePlayer()

        const player = createAudioPlayer({uri: url}, {updateInterval: 250})
        player.volume = 0.85
        player.setPlaybackRate(playbackRate, 'high')
        attachStatusListener(player)
        playerRef.current = player

        setPlayerState({currentSlug: slug, currentUrl: url, currentTitle: title, state: 'playing', error: null})
        player.play()
      } catch {
        disposePlayer()
        setPlayerState((prev) => ({
          ...prev,
          currentSlug: slug,
          currentUrl: url,
          currentTitle: title,
          state: 'error',
          error: 'Error al cargar el audio.',
        }))
      }
    },
    [attachStatusListener, disposePlayer, pause, playbackRate, playerState.currentSlug, playerState.currentUrl, playerState.state],
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
