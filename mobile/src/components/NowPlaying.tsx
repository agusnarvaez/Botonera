import {View, Text, Pressable, StyleSheet} from 'react-native'
import type {AudioState} from '../types'

const SPEEDS = [0.75, 1, 1.5, 2] as const

interface Props {
  title: string
  audioState: AudioState
  playbackRate: number
  onPause: () => void
  onStop: () => void
  onReplay: () => void
  onSetPlaybackRate: (rate: number) => void
}

export function NowPlaying({title, audioState, playbackRate, onPause, onStop, onReplay, onSetPlaybackRate}: Props) {
  const isEnded = audioState === 'ended'

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {/* Label + title */}
        <View style={styles.info}>
          <Text style={[styles.label, isEnded && styles.labelEnded]}>
            {isEnded ? 'TERMINÓ' : 'REPRODUCIENDO'}
          </Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>

        {/* Action + close */}
        <View style={styles.actions}>
          {isEnded ? (
            <Pressable style={styles.replayBtn} onPress={onReplay} accessibilityLabel="Reproducir de nuevo">
              <Text style={styles.replayBtnText}>▶</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.stopBtn} onPress={onPause} accessibilityLabel="Detener">
              <Text style={styles.stopBtnText}>■</Text>
            </Pressable>
          )}
          <Pressable style={styles.closeBtn} onPress={onStop} accessibilityLabel="Cerrar">
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Speed controls */}
      <View style={styles.speedRow}>
        {SPEEDS.map((s) => (
          <Pressable
            key={s}
            style={[styles.speedBtn, playbackRate === s && styles.speedBtnActive]}
            onPress={() => onSetPlaybackRate(s)}
            accessibilityLabel={`Velocidad ${s}x`}
          >
            <Text style={[styles.speedBtnText, playbackRate === s && styles.speedBtnTextActive]}>
              {s}x
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(10,10,10,0.97)',
    borderTopWidth: 2,
    borderTopColor: '#FF3B3B',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: '#FF3B3B',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  labelEnded: {
    color: '#555',
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  stopBtn: {
    borderWidth: 1,
    borderColor: '#FF3B3B',
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  stopBtnText: {
    color: '#FF3B3B',
    fontSize: 12,
  },
  replayBtn: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  replayBtnText: {
    color: '#aaa',
    fontSize: 12,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#444',
    fontSize: 13,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    paddingTop: 8,
  },
  speedBtn: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  speedBtnActive: {
    borderColor: '#FF3B3B',
  },
  speedBtnText: {
    color: '#555',
    fontSize: 11,
  },
  speedBtnTextActive: {
    color: '#FF3B3B',
  },
})
