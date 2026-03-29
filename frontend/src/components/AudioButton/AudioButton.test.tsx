import {describe, it, expect, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AudioButton} from './AudioButton'
import type {AudioButton as AudioButtonType} from '../../types'

const mockButton: AudioButtonType = {
  _id: 'btn-1',
  title: 'Nazario del barrio',
  slug: {current: 'nazario-del-barrio'},
  audioFile: {
    asset: {_ref: 'ref1', url: 'https://cdn.sanity.io/nazario.mp3'},
  },
  emoji: '🎤',
  color: '#FF3B3B',
  category: 'clasicos',
  order: 1,
}

describe('AudioButton', () => {
  it('renderiza con título y emoji', () => {
    render(
      <AudioButton
        button={mockButton}
        isPlaying={false}
        hasError={false}
        onPlay={vi.fn()}
      />,
    )
    expect(screen.getByText('Nazario del barrio')).toBeInTheDocument()
    expect(screen.getByText('🎤')).toBeInTheDocument()
  })

  it('click llama a onPlay con url y slug correctos', async () => {
    const onPlay = vi.fn()
    const user = userEvent.setup()

    render(
      <AudioButton
        button={mockButton}
        isPlaying={false}
        hasError={false}
        onPlay={onPlay}
      />,
    )

    await user.click(screen.getByRole('button'))

    expect(onPlay).toHaveBeenCalledOnce()
    expect(onPlay).toHaveBeenCalledWith(
      'https://cdn.sanity.io/nazario.mp3',
      'nazario-del-barrio',
    )
  })

  it('estado playing aplica aria-pressed=true', () => {
    render(
      <AudioButton
        button={mockButton}
        isPlaying={true}
        hasError={false}
        onPlay={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('muestra waveform cuando está playing', () => {
    const {container} = render(
      <AudioButton
        button={mockButton}
        isPlaying={true}
        hasError={false}
        onPlay={vi.fn()}
      />,
    )
    // El waveform solo aparece en estado playing
    expect(container.querySelector('[aria-hidden="true"]:not(.errorIcon)')).toBeTruthy()
  })

  it('botón deshabilitado sin audioFile', () => {
    const noAudioButton: AudioButtonType = {
      ...mockButton,
      audioFile: {asset: {_ref: '', url: ''}},
    }
    render(
      <AudioButton
        button={{...noAudioButton, audioFile: undefined as unknown as AudioButtonType['audioFile']}}
        isPlaying={false}
        hasError={false}
        onPlay={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('keyboard Enter llama a onPlay', async () => {
    const onPlay = vi.fn()
    const user = userEvent.setup()

    render(
      <AudioButton
        button={mockButton}
        isPlaying={false}
        hasError={false}
        onPlay={onPlay}
      />,
    )

    const btn = screen.getByRole('button')
    btn.focus()
    await user.keyboard('{Enter}')

    expect(onPlay).toHaveBeenCalledOnce()
  })
})
