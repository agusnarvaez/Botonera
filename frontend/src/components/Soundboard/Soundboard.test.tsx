import {describe, it, expect, vi, beforeEach} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement, type ReactNode} from 'react'
import {Soundboard} from './Soundboard'
import {AudioProvider} from '../../contexts/AudioContext'
import * as hooks from '../../hooks/useSanityButtons'
import type {AudioButton, Category} from '../../types'

const mockButtons: AudioButton[] = [
  {
    _id: '1',
    title: 'Nazario del barrio',
    slug: {current: 'nazario-del-barrio'},
    audioFile: {asset: {_ref: 'r1', url: 'https://cdn.sanity.io/a.mp3'}},
    emoji: '🎤',
    category: 'clasicos',
    order: 1,
  },
  {
    _id: '2',
    title: 'Ay Gino',
    slug: {current: 'ay-gino'},
    audioFile: {asset: {_ref: 'r2', url: 'https://cdn.sanity.io/b.mp3'}},
    category: 'varios',
    order: 2,
  },
  {
    _id: '3',
    title: 'Vamo Che Vamo',
    slug: {current: 'vamo-che-vamo'},
    audioFile: {asset: {_ref: 'r3', url: 'https://cdn.sanity.io/c.mp3'}},
    category: 'futbol',
    order: 3,
  },
]

const mockCategories: Category[] = [
  {_id: 'cat1', label: 'Clásicos', slug: {current: 'clasicos'}, order: 1},
  {_id: 'cat2', label: 'Fútbol', slug: {current: 'futbol'}, order: 2},
  {_id: 'cat3', label: 'Varios', slug: {current: 'varios'}, order: 3},
]

function mockCategoriesReturn() {
  vi.spyOn(hooks, 'useSanityCategories').mockReturnValue({
    data: mockCategories,
    isLoading: false,
    error: null,
    isSuccess: true,
    isError: false,
  } as ReturnType<typeof hooks.useSanityCategories>)
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  })
  return ({children}: {children: ReactNode}) =>
    createElement(
      QueryClientProvider,
      {client: queryClient},
      createElement(AudioProvider, null, children),
    )
}

describe('Soundboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra skeleton durante loading', () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    const {container} = render(<Soundboard />, {wrapper: createWrapper()})
    const grid = container.querySelector('[aria-busy="true"]')
    expect(grid).toBeInTheDocument()
  })

  it('renderiza todos los botones cuando hay datos', () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: mockButtons,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    render(<Soundboard />, {wrapper: createWrapper()})

    expect(screen.getByText('Nazario del barrio')).toBeInTheDocument()
    expect(screen.getByText('Ay Gino')).toBeInTheDocument()
    expect(screen.getByText('Vamo Che Vamo')).toBeInTheDocument()
  })

  it('muestra error cuando falla Sanity', () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      isSuccess: false,
      isError: true,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    render(<Soundboard />, {wrapper: createWrapper()})
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument()
  })

  it('filtro de búsqueda oculta botones no coincidentes', async () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: mockButtons,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    const user = userEvent.setup()
    render(<Soundboard />, {wrapper: createWrapper()})

    const searchInput = screen.getByRole('searchbox', {name: /buscar/i})
    await user.type(searchInput, 'gino')

    expect(screen.queryByText('Nazario del barrio')).not.toBeInTheDocument()
    expect(screen.getByText('Ay Gino')).toBeInTheDocument()
    expect(screen.queryByText('Vamo Che Vamo')).not.toBeInTheDocument()
  })

  it('mensaje "no encontré nada" cuando búsqueda no coincide', async () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: mockButtons,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    const user = userEvent.setup()
    render(<Soundboard />, {wrapper: createWrapper()})

    await user.type(screen.getByRole('searchbox', {name: /buscar/i}), 'xyznotfound')

    expect(screen.getByText(/no encontré nada/i)).toBeInTheDocument()
  })

  it('filtro por categoría muestra solo los botones de esa categoría', async () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: mockButtons,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    const user = userEvent.setup()
    render(<Soundboard />, {wrapper: createWrapper()})

    const futbolTab = screen.getByRole('tab', {name: /fútbol/i})
    await user.click(futbolTab)

    expect(screen.queryByText('Nazario del barrio')).not.toBeInTheDocument()
    expect(screen.queryByText('Ay Gino')).not.toBeInTheDocument()
    expect(screen.getByText('Vamo Che Vamo')).toBeInTheDocument()
  })

  it('tab de favoritos muestra mensaje cuando no hay favoritos', async () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: mockButtons,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    const user = userEvent.setup()
    render(<Soundboard />, {wrapper: createWrapper()})

    const favTab = screen.getByRole('tab', {name: /favoritos/i})
    await user.click(favTab)

    expect(screen.getByText(/no hay favoritos todavía/i)).toBeInTheDocument()
  })

  it('botón "Sorprendeme" está disponible con datos', () => {
    vi.spyOn(hooks, 'useSanityButtons').mockReturnValue({
      data: mockButtons,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof hooks.useSanityButtons>)
    mockCategoriesReturn()

    render(<Soundboard />, {wrapper: createWrapper()})
    expect(screen.getByRole('button', {name: /sorprendeme/i})).not.toBeDisabled()
  })
})
