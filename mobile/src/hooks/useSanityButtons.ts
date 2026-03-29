import {useQuery} from '@tanstack/react-query'
import {fetchAudioButtons, fetchCategories} from '../lib/sanity'

export function useSanityButtons() {
  return useQuery({
    queryKey: ['audioButtons'],
    queryFn: fetchAudioButtons,
  })
}

export function useSanityCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}
