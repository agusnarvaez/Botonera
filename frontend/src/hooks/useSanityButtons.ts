import {useQuery} from '@tanstack/react-query'
import {fetchAudioButtons, fetchCategories, fetchSiteSettings} from '../lib/sanity'
import type {AudioButton, Category, SiteSettings} from '../types'

export function useSanityButtons() {
  return useQuery<AudioButton[], Error>({
    queryKey: ['audioButtons'],
    queryFn: fetchAudioButtons,
  })
}

export function useSanityCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}

export function useSiteSettings() {
  return useQuery<SiteSettings | null, Error>({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings,
  })
}
