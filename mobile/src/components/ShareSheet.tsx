import {Modal, Pressable, StyleSheet, Text, View} from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'

interface Props {
  visible: boolean
  title: string
  onClose: () => void
  onShare: () => void
  onShareWhatsApp: () => void
}

export function ShareSheet({visible, title, onClose, onShare, onShareWhatsApp}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <Pressable style={styles.actionBtn} onPress={onShare}>
            <View style={styles.actionHeader}>
              <Entypo name="share" size={18} color="#fff" />
              <Text style={styles.actionText}>Compartir</Text>
            </View>
            <Text style={styles.actionHint}>Abre el menu nativo de Android</Text>
          </Pressable>

          <Pressable style={[styles.actionBtn, styles.whatsAppBtn]} onPress={onShareWhatsApp}>
            <View style={styles.actionHeader}>
              <FontAwesome name="whatsapp" size={18} color="#25D366" />
              <Text style={[styles.actionText, styles.whatsAppText]}>WhatsApp</Text>
            </View>
            <Text style={styles.actionHint}>Envia la frase directo por WhatsApp</Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <View style={styles.closeContent}>
              <Entypo name="cross" size={18} color="#999" />
              <Text style={styles.closeText}>Cancelar</Text>
            </View>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#2a2a2a',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#2a2a2a',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  whatsAppBtn: {
    borderColor: '#25D366',
    backgroundColor: 'rgba(37,211,102,0.08)',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  whatsAppText: {
    color: '#25D366',
  },
  actionHint: {
    color: '#666',
    fontSize: 12,
  },
  closeBtn: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeText: {
    color: '#999',
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
})
