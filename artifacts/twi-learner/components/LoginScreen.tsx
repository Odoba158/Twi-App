import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LoginScreenProps {
  onLogin: (name: string, school: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 40 : insets.top || 40;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom || 40;

  const canSubmit = name.trim().length >= 2;

  return (
    <LinearGradient
      colors={['#E8961E', '#CE1126']}
      style={[styles.container, { paddingTop: topPad }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.topSection}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.appIcon}
          />
          <Text style={styles.title}>Twi Alphabet{'\n'}& Numeral Reciter</Text>
          <Text style={styles.subtitle}>Learn the Akan (Twi) language</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome! 👋</Text>
          <Text style={styles.formSubtitle}>Enter your details to get started</Text>

          <View style={styles.inputWrapper}>
            <Feather name="user" size={18} color="#E8961E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="book" size={18} color="#E8961E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="School name (optional)"
              placeholderTextColor="#999"
              value={school}
              onChangeText={setSchool}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => canSubmit && onLogin(name.trim(), school.trim())}
            />
          </View>

          <Pressable
            onPress={() => canSubmit && onLogin(name.trim(), school.trim())}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.loginButton,
              !canSubmit && styles.loginButtonDisabled,
              pressed && canSubmit && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={canSubmit ? ['#E8961E', '#CE1126'] : ['#ccc', '#bbb']}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>Get Started</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <Text style={styles.footerText}>
            Designed by: Odoba and Joshua Adu{'\n'}supervised by POCO
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 6,
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#777',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#333',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});
