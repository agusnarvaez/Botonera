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
  category?: string
  order?: number
}

export interface Category {
  _id: string
  label: string
  slug: {current: string}
  order?: number
}

export type AudioState = 'idle' | 'playing' | 'ended' | 'error'
