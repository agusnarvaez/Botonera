import '@testing-library/jest-dom'

// Mock HTMLMediaElement — jsdom no soporta reproducción de audio real
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  writable: true,
  value: vi.fn(),
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  writable: true,
  value: vi.fn(),
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  configurable: true,
  get: () => 0,
})

// Mock AudioContext para el iOS unlock
const AudioContextMock = vi.fn().mockImplementation(() => ({
  resume: vi.fn().mockResolvedValue(undefined),
  state: 'running',
}))
Object.defineProperty(window, 'AudioContext', {
  configurable: true,
  writable: true,
  value: AudioContextMock,
})
Object.defineProperty(window, 'webkitAudioContext', {
  configurable: true,
  writable: true,
  value: AudioContextMock,
})
