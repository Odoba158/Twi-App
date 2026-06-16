import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeType, useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';

const THEMES: { id: ThemeType; label: string; icon: any; color: string }[] = [
  { id: 'system', label: 'System Default', icon: 'smartphone', color: '#6B7280' },
  { id: 'light', label: 'Light Mode', icon: 'sun', color: '#E8961E' },
  { id: 'dark', label: 'Dark Mode', icon: 'moon', color: '#3B82F6' },
  { id: 'jungle', label: 'Jungle Theme', icon: 'target', color: '#27AE60' },
  { id: 'sunset', label: 'Sunset Theme', icon: 'sunset', color: '#E74C3C' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
      >
        <Feather name="palette" size={20} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Theme
            </Text>
            
            {THEMES.map((t) => (
              <Pressable
                key={t.id}
                style={[
                  styles.themeRow,
                  { borderBottomColor: colors.border },
                  theme === t.id && { backgroundColor: colors.muted }
                ]}
                onPress={() => {
                  setTheme(t.id);
                  setModalVisible(false);
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: t.color }]}>
                  <Feather name={t.icon} size={16} color="#fff" />
                </View>
                <Text style={[styles.themeLabel, { color: colors.text }]}>
                  {t.label}
                </Text>
                {theme === t.id && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});
