import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TWI_ALPHABET, TWI_NUMBERS, TWI_WORDS } from "@/constants/twi-data";
import { useProgress } from "@/context/ProgressContext";
import { useColors } from "@/hooks/useColors";

const MODULES = [
  {
    id: "alphabet",
    title: "Alphabet",
    subtitle: "Learn all 22 Twi letters",
    icon: "book-open" as const,
    colors: ["#7B5EA7", "#9B7DC8"] as [string, string],
    route: "/(tabs)/alphabet" as const,
    total: TWI_ALPHABET.length,
    progressKey: "alphabetProgress" as const,
  },
  {
    id: "numbers",
    title: "Numbers",
    subtitle: "Count from 1 to 100 in Twi",
    icon: "hash" as const,
    colors: ["#2980B9", "#5DADE2"] as [string, string],
    route: "/(tabs)/numbers" as const,
    total: TWI_NUMBERS.length,
    progressKey: "numbersProgress" as const,
  },
  {
    id: "words",
    title: "Words",
    subtitle: "Spell 15 common Twi words",
    icon: "type" as const,
    colors: ["#1B7A4B", "#27AE60"] as [string, string],
    route: "/(tabs)/words" as const,
    total: TWI_WORDS.length,
    progressKey: "wordsProgress" as const,
  },
  {
    id: "progress",
    title: "Quiz & Progress",
    subtitle: "Test your knowledge",
    icon: "bar-chart-2" as const,
    colors: ["#E8961E", "#F5B942"] as [string, string],
    route: "/(tabs)/progress" as const,
    total: 0,
    progressKey: null,
  },
];

import { ThemeSelector } from "@/components/ThemeSelector";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const progress = useProgress();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const overallPct =
    progress.totalAttempted > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
      : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#E8961E", "#CE1126"]}
        style={[styles.heroGradient, { paddingTop: topPad + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ position: 'absolute', top: topPad + 2, right: 76, zIndex: 999 }}>
          <ThemeSelector />
        </View>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.appIcon}
        />
        <Text style={styles.heroTitle}>Twi Alphabet{"\n"}& Numeral Reciter</Text>
        <Text style={styles.heroSub}>
          Learn the Akan (Twi) language — letters, numbers & words
        </Text>
        {progress.totalAttempted > 0 && (
          <View style={styles.heroBadge}>
            <Feather name="star" size={14} color="#fff" />
            <Text style={styles.heroBadgeText}>Overall score: {overallPct}%</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Modules</Text>

        {MODULES.map((mod) => {
          const prog = mod.progressKey ? progress[mod.progressKey] : null;
          const pct =
            prog !== null && mod.total > 0
              ? Math.round(((prog + 1) / mod.total) * 100)
              : null;

          return (
            <Pressable
              key={mod.id}
              onPress={() => router.push(mod.route)}
              style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={mod.colors}
                style={styles.moduleCardInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.moduleIconWrapper}>
                  <Feather name={mod.icon} size={28} color="#fff" />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                  <Text style={styles.moduleSub}>{mod.subtitle}</Text>
                </View>
                {pct !== null && (
                  <View style={styles.pctBadge}>
                    <Text style={styles.pctText}>{pct}%</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </Pressable>
          );
        })}

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Tap any module to start learning. Use the{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.text }}>
              Hear Pronunciation
            </Text>{" "}
            button to listen to the correct Twi sounds. Try auto-recite to hear the full sequence.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroGradient: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 10,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 36,
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  heroBadgeText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  content: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  moduleCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  moduleCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 16,
  },
  moduleIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  moduleSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", marginTop: 2 },
  pctBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pctText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginTop: 4,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
