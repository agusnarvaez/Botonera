import {StatusBar} from 'expo-status-bar'
import {SafeAreaView, View, Text, StyleSheet} from 'react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {AudioProvider, useAudioContext} from './src/contexts/AudioContext'
import {Soundboard} from './src/components/Soundboard'
import {NowPlaying} from './src/components/NowPlaying'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
    },
  },
})

function NowPlayingBar() {
  const {play, stop, pause, setPlaybackRate, playbackRate, currentSlug, currentUrl, currentTitle, audioState} =
    useAudioContext()

  if ((audioState !== 'playing' && audioState !== 'ended') || !currentSlug || !currentUrl || !currentTitle) {
    return null
  }

  return (
    <NowPlaying
      title={currentTitle}
      audioState={audioState}
      playbackRate={playbackRate}
      onPause={pause}
      onStop={stop}
      onReplay={() => play(currentUrl, currentSlug, currentTitle)}
      onSetPlaybackRate={setPlaybackRate}
    />
  )
}

function AppContent() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <View style={styles.header}>
        <Text style={styles.title}>LA BOTONERA{'\n'}DE NAZARIO</Text>
        <Text style={styles.subtitle}>LOS BERRETINES DEL TITÁN</Text>
      </View>
      <View style={styles.main}>
        <Soundboard />
      </View>
      <NowPlayingBar />
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 32,
  },
  subtitle: {
    color: '#555',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: 4,
  },
  main: {
    flex: 1,
  },
})
