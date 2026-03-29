import {describe, it, expect, vi, beforeEach} from 'vitest'
import {renderHook, act} from '@testing-library/react'
import {useAudio} from './useAudio'

describe('useAudio', () => {
  let mockAudio: {
    play: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
    onended: (() => void) | null
    onerror: (() => void) | null
    currentTime: number
    volume: number
    playbackRate: number
  }

  beforeEach(() => {
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      onended: null,
      onerror: null,
      currentTime: 0,
      volume: 1,
      playbackRate: 1,
    }
    vi.spyOn(window, 'Audio').mockImplementation(() => mockAudio as unknown as HTMLAudioElement)
  })

  it('inicia en estado idle', () => {
    const {result} = renderHook(() => useAudio())
    expect(result.current.currentSlug).toBeNull()
    expect(result.current.audioState).toBe('idle')
    expect(result.current.isPlaying).toBe(false)
  })

  it('play() setea currentSlug, currentTitle y estado playing', async () => {
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/audio.mp3', 'test-slug', 'Test Title')
    })

    expect(result.current.currentSlug).toBe('test-slug')
    expect(result.current.currentTitle).toBe('Test Title')
    expect(result.current.currentUrl).toBe('http://example.com/audio.mp3')
    expect(result.current.audioState).toBe('playing')
    expect(result.current.isPlaying).toBe(true)
    expect(mockAudio.play).toHaveBeenCalledOnce()
  })

  it('stop() limpia el estado', async () => {
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/audio.mp3', 'test-slug', 'Test Title')
    })

    act(() => {
      result.current.stop()
    })

    expect(result.current.currentSlug).toBeNull()
    expect(result.current.currentTitle).toBeNull()
    expect(result.current.audioState).toBe('idle')
    expect(result.current.isPlaying).toBe(false)
    expect(mockAudio.pause).toHaveBeenCalledOnce()
  })

  it('play() del mismo slug mientras está playing → hace stop (toggle)', async () => {
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/audio.mp3', 'test-slug', 'Test Title')
    })

    expect(result.current.isPlaying).toBe(true)

    act(() => {
      void result.current.play('http://example.com/audio.mp3', 'test-slug', 'Test Title')
    })

    expect(result.current.currentSlug).toBeNull()
    expect(result.current.isPlaying).toBe(false)
  })

  it('onended callback setea estado ended (mantiene slug y title)', async () => {
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/audio.mp3', 'test-slug', 'Test Title')
    })

    act(() => {
      mockAudio.onended?.()
    })

    expect(result.current.currentSlug).toBe('test-slug')
    expect(result.current.currentTitle).toBe('Test Title')
    expect(result.current.audioState).toBe('ended')
    expect(result.current.isPlaying).toBe(false)
  })

  it('error en play() setea estado error', async () => {
    mockAudio.play.mockRejectedValue(new Error('NotAllowedError'))
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/audio.mp3', 'bad-slug', 'Bad Title')
    })

    expect(result.current.audioState).toBe('error')
    expect(result.current.error).toContain('NotAllowedError')
  })

  it('nuevo play() detiene el audio anterior', async () => {
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/a.mp3', 'slug-a', 'Title A')
    })

    await act(async () => {
      await result.current.play('http://example.com/b.mp3', 'slug-b', 'Title B')
    })

    expect(result.current.currentSlug).toBe('slug-b')
    expect(mockAudio.pause).toHaveBeenCalledOnce()
  })

  it('setPlaybackRate actualiza la velocidad', async () => {
    const {result} = renderHook(() => useAudio())

    await act(async () => {
      await result.current.play('http://example.com/audio.mp3', 'test-slug', 'Test Title')
    })

    act(() => {
      result.current.setPlaybackRate(1.5)
    })

    expect(result.current.playbackRate).toBe(1.5)
    expect(mockAudio.playbackRate).toBe(1.5)
  })
})
