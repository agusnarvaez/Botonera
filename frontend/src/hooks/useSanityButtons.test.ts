import {describe, it, expect, vi, beforeEach} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement, type ReactNode} from 'react'
import {useSanityButtons} from './useSanityButtons'
import * as sanityLib from '../lib/sanity'
import type {AudioButton} from '../types'

const mockButtons: AudioButton[] = [
  {
    _id: '1',
    title: 'Nazario del barrio',
    slug: {current: 'nazario-del-barrio'},
    audioFile: {asset: {_ref: 'ref1', url: 'https://cdn.sanity.io/a.mp3'}},
    emoji: '🎤',
    color: '#FF3B3B',
    category: 'clasicos',
    order: 1,
  },
  {
    _id: '2',
    title: 'Ay Gino',
    slug: {current: 'ay-gino'},
    audioFile: {asset: {_ref: 'ref2', url: 'https://cdn.sanity.io/b.mp3'}},
    order: 2,
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  })
  return ({children}: {children: ReactNode}) =>
    createElement(QueryClientProvider, {client: queryClient}, children)
}

describe('useSanityButtons', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna datos de Sanity correctamente', async () => {
    vi.spyOn(sanityLib, 'fetchAudioButtons').mockResolvedValue(mockButtons)

    const {result} = renderHook(() => useSanityButtons(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0]!.title).toBe('Nazario del barrio')
    expect(result.current.data![1]!.slug.current).toBe('ay-gino')
  })

  it('estado loading al inicio', () => {
    vi.spyOn(sanityLib, 'fetchAudioButtons').mockResolvedValue(mockButtons)

    const {result} = renderHook(() => useSanityButtons(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('maneja error de red', async () => {
    vi.spyOn(sanityLib, 'fetchAudioButtons').mockRejectedValue(
      new Error('Network error'),
    )

    const {result} = renderHook(() => useSanityButtons(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network error')
  })
})
