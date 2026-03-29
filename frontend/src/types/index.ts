export interface AudioButton {
  _id: string
  title: string
  slug: {current: string}
  audioFile: {
    asset: {
      _ref: string
      url: string
    }
  }
  emoji?: string
  color?: string
  category?: string  // slug.current de la categoría referenciada
  order?: number
}

export interface Category {
  _id: string
  label: string
  slug: {current: string}
  order?: number
}

export interface SiteSettings {
  title: string
  description?: string
  characterImage?: {
    asset: {url: string}
    hotspot?: {x: number; y: number}
  }
}

export type AudioState = 'idle' | 'playing' | 'error'

export interface AudioPlayerState {
  currentSlug: string | null
  state: AudioState
  error: string | null
}
