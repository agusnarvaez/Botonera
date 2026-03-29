import {createClient} from '@sanity/client'
import type {AudioButton, Category, SiteSettings} from '../types'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID ?? '04fqowcd',
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION ?? '2024-01-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_TOKEN,
})

export const AUDIO_BUTTONS_QUERY = `
  *[_type == "audioButton"] | order(order asc, title asc) {
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

export const CATEGORIES_QUERY = `
  *[_type == "category"] | order(order asc, label asc) {
    _id,
    label,
    slug,
    order
  }
`

export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    title,
    description,
    "characterImage": {
      "asset": { "url": characterImage.asset->url },
      "hotspot": characterImage.hotspot
    }
  }
`

export async function fetchAudioButtons(): Promise<AudioButton[]> {
  return sanityClient.fetch<AudioButton[]>(AUDIO_BUTTONS_QUERY)
}

export async function fetchCategories(): Promise<Category[]> {
  return sanityClient.fetch<Category[]>(CATEGORIES_QUERY)
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY)
}
