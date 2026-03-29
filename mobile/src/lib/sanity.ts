import {createClient} from '@sanity/client'
import type {AudioButton, Category} from '../types'

export const sanityClient = createClient({
  projectId: '04fqowcd',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const AUDIO_BUTTONS_QUERY = `
  *[_type == "audioButton"] | order(order asc) {
    _id,
    title,
    slug,
    "audioFile": {
      "asset": {
        "_ref": audioFile.asset._ref,
        "url": audioFile.asset->url
      }
    },
    emoji,
    color,
    "category": category->slug.current,
    order
  }
`

const CATEGORIES_QUERY = `
  *[_type == "category"] | order(order asc) {
    _id,
    label,
    slug,
    order
  }
`

export async function fetchAudioButtons(): Promise<AudioButton[]> {
  return sanityClient.fetch(AUDIO_BUTTONS_QUERY)
}

export async function fetchCategories(): Promise<Category[]> {
  return sanityClient.fetch(CATEGORIES_QUERY)
}
