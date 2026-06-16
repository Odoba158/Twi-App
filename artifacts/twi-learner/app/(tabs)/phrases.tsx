import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TWI_PHRASES } from '@/constants/twi-data';
import { useColors } from '@/hooks/useColors';
import { playAudioForId } from '@/utils/speech';

export default function PhrasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activePhrase, setActivePhrase] = useState<string | null>(null);
  
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const categories = useMemo(() => {
    const cats = new Set(TWI_PHRASES.map(p => p.category));
    return Array.from(cats);
  }, []);

  const handleSpeak = (twiText: string, id: string) => {
    setActivePhrase(id);
    Haptics.selectionAsync();
    
    playAudioForId(id, () => {
      setActivePhrase(null);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Everyday Phrases</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Learn common greetings and sentences
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(cat => (
          <View key={cat} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: colors.primary }]}>{cat}</Text>
            
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {TWI_PHRASES.filter(p => p.category === cat).map((phrase, i, arr) => {
                const isActive = activePhrase === phrase.id;
                const isLast = i === arr.length - 1;
                return (
                  <Pressable
                    key={phrase.id}
                    onPress={() => handleSpeak(phrase.twi, phrase.id)}
                    style={({ pressed }) => [
                      styles.phraseRow,
                      { borderBottomColor: colors.border },
                      isActive && { backgroundColor: colors.muted },
                      !isLast && { borderBottomWidth: 1 },
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    <View style={styles.phraseTextCol}>
                      <Text style={[styles.twiText, { color: colors.text }]}>{phrase.twi}</Text>
                      <Text style={[styles.englishText, { color: colors.mutedForeground }]}>{phrase.english}</Text>
                    </View>
                    <View style={[styles.iconBox, isActive ? { backgroundColor: colors.primary } : { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                      <Feather 
                        name={isActive ? "volume-2" : "play"} 
                        size={18} 
                        color={isActive ? '#fff' : colors.primary} 
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 24 },
  categorySection: { gap: 12 },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  phraseTextCol: {
    flex: 1,
    gap: 4,
  },
  twiText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  englishText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  }
});
