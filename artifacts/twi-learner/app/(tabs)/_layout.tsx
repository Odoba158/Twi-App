import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { MusicToggle } from "@/components/MusicToggle";
import { useUser } from "@/context/UserContext";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="alphabet">
        <Icon sf={{ default: "textformat", selected: "textformat" }} />
        <Label>Alphabet</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="numbers">
        <Icon sf={{ default: "number", selected: "number" }} />
        <Label>Numbers</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="words">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Words</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Progress</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="alphabet"
        options={{
          title: "Alphabet",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="textformat" tintColor={color} size={24} />
            ) : (
              <Feather name="book-open" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="numbers"
        options={{
          title: "Numbers",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="number" tintColor={color} size={24} />
            ) : (
              <Feather name="hash" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: "Words",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book" tintColor={color} size={24} />
            ) : (
              <Feather name="type" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={24} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

function UserBadge() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === 'web' ? 20 : insets.top || 20;

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[userStyles.container, { top: topPad }]} pointerEvents="none">
      <View style={[userStyles.badge, { backgroundColor: colors.card }]}>
        <View style={userStyles.avatar}>
          <Text style={userStyles.avatarText}>{initials}</Text>
        </View>
        <Text style={[userStyles.nameText, { color: colors.text }]} numberOfLines={1}>
          {user.name}
        </Text>
      </View>
    </View>
  );
}

const userStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    zIndex: 999,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingRight: 14,
    paddingLeft: 4,
    paddingVertical: 4,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8961E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  nameText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    maxWidth: 120,
  },
});

export default function TabLayout() {
  return (
    <>
      {isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />}
      <UserBadge />
      <MusicToggle />
    </>
  );
}
