import {createContext, useContext, type ReactNode} from 'react'
import {useAudio} from '../hooks/useAudio'

type AudioContextValue = ReturnType<typeof useAudio>

const AudioContext = createContext<AudioContextValue | null>(null)

export function AudioProvider({children}: {children: ReactNode}) {
  const audio = useAudio()
  return <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudioContext must be used inside AudioProvider')
  return ctx
}
