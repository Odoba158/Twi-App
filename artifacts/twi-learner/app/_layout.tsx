import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoginScreen } from "@/components/LoginScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProgressProvider } from "@/context/ProgressContext";
import { MusicProvider } from "@/context/MusicContext";
import { UserProvider, useUser } from "@/context/UserContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

/** Wraps the main app and resets a 90-second logout timer on every touch */
function InactivityWrapper({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onLogout();
    }, 90000); // 1.5 minutes
  }, [onLogout]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        resetTimer();
        return false; // let the touch pass through to children
      }}
    >
      {children}
    </View>
  );
}

/** Gates the app behind login → loading → main content */
function AppGate() {
  const { user, isLoaded, login, logout } = useUser();
  const [showLoading, setShowLoading] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // If user was already logged in from a previous session, show loading bar then enter
  useEffect(() => {
    if (isLoaded && user && !appReady) {
      setShowLoading(true);
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;

  // Not logged in yet — show login screen
  if (!user) {
    return (
      <LoginScreen
        onLogin={async (name, school) => {
          await login({ name, school: school || undefined });
          setShowLoading(true);
        }}
      />
    );
  }

  // Just logged in or returning user — show loading bar
  if (showLoading && !appReady) {
    return <LoadingScreen onFinish={() => setAppReady(true)} />;
  }

  // App is ready — render the main content
  return (
    <ProgressProvider>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <InactivityWrapper onLogout={() => {
            setAppReady(false);
            setShowLoading(false);
            logout();
          }}>
            <RootLayoutNav />
          </InactivityWrapper>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ProgressProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <MusicProvider>
            <UserProvider>
              <AppGate />
            </UserProvider>
          </MusicProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
