import {Pressable, Text, StyleSheet, View} from 'react-native'
import type {AudioButton as AudioButtonType} from '../types'

const FALLBACK_COLORS = ['#FF3B3B', '#FFDE00', '#00B4D8', '#FF6B35', '#7B2FBE', '#06D6A0']

function getColor(button: AudioButtonType): string {
  if (button.color) return button.color
  const hash = [...button._id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]!
}

interface Props {
  button: AudioButtonType
  isPlaying: boolean
  hasError: boolean
  playCount?: number
  onPlay: (url: string, slug: string, title: string) => void
}

export function AudioButton({button, isPlaying, hasError, playCount, onPlay}: Props) {
  const color = getColor(button)
  const audioUrl = button.audioFile?.asset?.url

  return (
    <Pressable
      style={({pressed}) => [
        styles.button,
        {borderColor: color},
        isPlaying && {backgroundColor: `${color}22`},
        hasError && styles.errorState,
        pressed && styles.pressed,
        !audioUrl && styles.disabled,
      ]}
      onPress={() => {
        if (audioUrl) onPlay(audioUrl, button.slug.current, button.title)
      }}
      disabled={!audioUrl}
      accessibilityLabel={`Reproducir: ${button.title}`}
      accessibilityRole="button"
      accessibilityState={{selected: isPlaying}}
    >
      {button.emoji && !isPlaying && !hasError && (
        <Text style={styles.emoji}>{button.emoji}</Text>
      )}
      {isPlaying && <Text style={[styles.waveform, {color}]}>▶</Text>}
      {hasError && <Text style={styles.errorIcon}>!</Text>}
      <Text style={[styles.title, isPlaying && {color}]} numberOfLines={2}>
        {button.title}
      </Text>
      {playCount !== undefined && playCount > 0 && (
        <Text style={styles.playCount}>
          {playCount >= 1000 ? `${Math.floor(playCount / 1000)}k` : playCount}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 90,
    backgroundColor: '#0D0D0D',
    borderWidth: 2,
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.75,
    transform: [{scale: 0.97}],
  },
  disabled: {
    opacity: 0.3,
  },
  errorState: {
    borderColor: '#ff0040',
  },
  emoji: {
    fontSize: 22,
  },
  waveform: {
    fontSize: 18,
  },
  errorIcon: {
    color: '#ff0040',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playCount: {
    position: 'absolute',
    bottom: 5,
    right: 7,
    color: '#333',
    fontSize: 9,
  },
})
