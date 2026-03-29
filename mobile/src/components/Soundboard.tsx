import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import Fontisto from '@expo/vector-icons/Fontisto'
import {AudioButton} from './AudioButton'
import {ShareSheet} from './ShareSheet'
import {useAudioContext} from '../contexts/AudioContext'
import {useSanityButtons, useSanityCategories} from '../hooks/useSanityButtons'
import {usePlayCounts} from '../hooks/usePlayCounts'

const FAVORITES_VALUE = '__favoritos__'

function loadFavorites(): Set<string> {
  return new Set()
}

interface ShareTarget {
  slug: string
  title: string
  audioUrl: string
}

function buildShareMessage({title, audioUrl}: ShareTarget): string {
  return `Escucha "${title}" en La Botonera de Nazario.\n${audioUrl}`
}

export function Soundboard() {
  const {play: rawPlay, currentSlug, audioState, error} = useAudioContext()
  const {data: buttons, isLoading, error: fetchError} = useSanityButtons()
  const {data: sanityCategories} = useSanityCategories()
  const {counts: playCounts, increment: incrementCount, load: loadCounts} = usePlayCounts()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  const play = useCallback(
    (url: string, slug: string, title: string) => {
      incrementCount(slug)
      return rawPlay(url, slug, title)
    },
    [rawPlay, incrementCount],
  )

  const handleSystemShare = useCallback(async () => {
    if (!shareTarget) return

    try {
      await Share.share(
        {
          title: shareTarget.title,
          message: buildShareMessage(shareTarget),
          url: shareTarget.audioUrl,
        },
        {
          dialogTitle: `Compartir "${shareTarget.title}"`,
        },
      )
      setShareTarget(null)
    } catch {
      Alert.alert('No se pudo compartir', 'Proba de nuevo en unos segundos.')
    }
  }, [shareTarget])

  const handleWhatsAppShare = useCallback(async () => {
    if (!shareTarget) return

    try {
      const message = buildShareMessage(shareTarget)
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`)
      setShareTarget(null)
    } catch {
      Alert.alert('WhatsApp no esta disponible', 'No pude abrir WhatsApp en este dispositivo.')
    }
  }, [shareTarget])

  function toggleFavorite(slug: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const categoryTabs = useMemo(() => {
    const dynamic = (sanityCategories ?? []).map((category) => ({
      value: category.slug.current,
      label: category.label,
    }))

    return [
      {value: '', label: 'Todos'},
      ...dynamic,
      {value: FAVORITES_VALUE, label: `Favoritos (${favorites.size})`},
    ]
  }, [favorites.size, sanityCategories])

  const filteredButtons = useMemo(() => {
    if (!buttons) return []

    return buttons.filter((button) => {
      const matchesSearch = search
        ? button.title.toLowerCase().includes(search.toLowerCase())
        : true
      const matchesCategory =
        activeCategory === FAVORITES_VALUE
          ? favorites.has(button.slug.current)
          : activeCategory
            ? button.category === activeCategory
            : true

      return matchesSearch && matchesCategory
    })
  }, [activeCategory, buttons, favorites, search])

  function handleRandom() {
    const eligible = filteredButtons.filter((button) => button.audioFile?.asset?.url)
    if (eligible.length === 0) return

    const pick = eligible[Math.floor(Math.random() * eligible.length)]!
    play(pick.audioFile.asset.url, pick.slug.current, pick.title)
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF3B3B" size="large" />
        <Text style={styles.loadingText}>Cargando frases...</Text>
      </View>
    )
  }

  if (fetchError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudieron cargar las frases.</Text>
        <Text style={styles.errorDetail}>{fetchError.message}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar frase..."
          placeholderTextColor="#333"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar frase"
          returnKeyType="search"
        />
        <Pressable style={styles.randomBtn} onPress={handleRandom} disabled={filteredButtons.length === 0}>
          <Fontisto name="random" size={16} color="#FFDE00" />
          <Text style={styles.randomBtnText}>SORPRENDEME</Text>
        </Pressable>
      </View>

      <View style={styles.tabList}>
        {categoryTabs.map((item) => (
          <Pressable
            key={item.value}
            style={[
              styles.tab,
              item.value === FAVORITES_VALUE && styles.tabFavorite,
              activeCategory === item.value && styles.tabActive,
            ]}
            onPress={() => setActiveCategory(item.value)}
          >
            <Text style={[styles.tabText, activeCategory === item.value && styles.tabTextActive]}>
              {item.label.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredButtons.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {activeCategory === FAVORITES_VALUE
              ? 'No hay favoritos todavia.'
              : search
                ? `No encontre nada para "${search}"`
                : 'No hay frases disponibles'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredButtons}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({item}) => (
            <View style={styles.cell}>
              <AudioButton
                button={item}
                isPlaying={currentSlug === item.slug.current && audioState === 'playing'}
                hasError={currentSlug === item.slug.current && audioState === 'error'}
                playCount={playCounts[item.slug.current]}
                onPlay={play}
              />
              <View style={styles.cellActions}>
                <Pressable
                  style={styles.iconAction}
                  onPress={() => toggleFavorite(item.slug.current)}
                  accessibilityLabel={favorites.has(item.slug.current) ? 'Quitar favorito' : 'Agregar favorito'}
                >
                  <Text style={[styles.actionIcon, favorites.has(item.slug.current) && styles.favoriteIconActive]}>
                    {'♥'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.iconAction, !item.audioFile?.asset?.url && styles.iconActionDisabled]}
                  onPress={() =>
                    setShareTarget({
                      slug: item.slug.current,
                      title: item.title,
                      audioUrl: item.audioFile?.asset?.url ?? '',
                    })
                  }
                  disabled={!item.audioFile?.asset?.url}
                  accessibilityLabel={`Compartir ${item.title}`}
                >
                  <Entypo name="share" size={18} color="#333" />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {error && currentSlug && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <ShareSheet
        visible={shareTarget !== null}
        title={shareTarget?.title ?? ''}
        onClose={() => setShareTarget(null)}
        onShare={handleSystemShare}
        onShareWhatsApp={handleWhatsAppShare}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    color: '#555',
    fontSize: 13,
    marginTop: 12,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  errorDetail: {
    color: '#553333',
    fontSize: 11,
    textAlign: 'center',
  },
  emptyText: {
    color: '#444',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 3,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  randomBtn: {
    height: 42,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFDE00',
    borderRadius: 3,
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomBtnText: {
    color: '#FFDE00',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    marginBottom: 10,
  },
  tab: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17,17,17,0.88)',
  },
  tabFavorite: {
    borderColor: '#4a1b1b',
  },
  tabActive: {
    borderColor: '#FF3B3B',
    backgroundColor: 'rgba(255,59,59,0.08)',
  },
  tabText: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'monospace',
    includeFontPadding: false,
  },
  tabTextActive: {
    color: '#FF3B3B',
  },
  grid: {
    paddingHorizontal: 14,
    paddingBottom: 120,
    gap: 8,
  },
  row: {
    gap: 8,
  },
  cell: {
    flex: 1,
    gap: 8,
  },
  cellActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconAction: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionDisabled: {
    opacity: 0.3,
  },
  actionIcon: {
    color: '#333',
    fontSize: 18,
    lineHeight: 18,
  },
  favoriteIconActive: {
    color: '#FF5B4D',
  },
})
