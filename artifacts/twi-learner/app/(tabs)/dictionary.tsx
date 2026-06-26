import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TWI_PHRASES, TWI_WORDS } from '@/constants/twi-data';
import { useColors } from '@/hooks/useColors';
import { playAudioForId } from '@/utils/speech';
import { LinearGradient } from 'expo-linear-gradient';

// Combine Words and Phrases into a unified dictionary structure
const DICTIONARY_ITEMS = [
  ...TWI_WORDS.map((w) => ({
    id: w.id,
    twi: w.word,
    english: w.meaning,
    category: w.category,
    type: 'Word',
  })),
  ...TWI_PHRASES.map((p) => ({
    id: p.id,
    twi: p.twi,
    english: p.english,
    category: p.category,
    type: 'Phrase',
  })),
];

export default function DictionaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DICTIONARY_ITEMS;
    return DICTIONARY_ITEMS.filter(
      (item) =>
        item.twi.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSpeak = (id: string) => {
    playAudioForId(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderItem = (item: typeof DICTIONARY_ITEMS[0], index: number) => {
    return (
      <View
        key={`${item.id}-${index}`}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {item.type} • {item.category}
            </Text>
          </View>
          <Pressable
            onPress={() => handleSpeak(item.id)}
            style={({ pressed }) => [
              styles.speakBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="volume-2" size={18} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.twiText, { color: colors.text }]}>{item.twi}</Text>
          <Text style={[styles.englishText, { color: colors.mutedForeground }]}>{item.english}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Dictionary</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={20} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search in Twi or English..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <Feather name="x-circle" size={20} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={() => Keyboard.dismiss()}
        scrollEventThrottle={16}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No results found for "{query}"
            </Text>
          </View>
        ) : (
          filteredItems.map(renderItem)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  speakBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    gap: 4,
  },
  twiText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  englishText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});
