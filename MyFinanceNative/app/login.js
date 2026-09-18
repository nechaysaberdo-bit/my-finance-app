import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { supabase } from '../lib/supabase';

const colors = {
  bg: '#FFF9FA',
  card: '#FFFFFF',
  pink: '#E76E93',
  pinkSoft: '#FCE8EE',
  text: '#51474B',
  muted: '#9A8C91',
  border: '#F0E1E5',
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');

  function showMessage(title, message) {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function handleSubmit() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showMessage(
        'Missing information',
        'Please enter your email and password.'
      );

      return;
    }

    if (password.length < 6) {
      showMessage(
        'Password too short',
        'Please use a password with at least 6 characters.'
      );

      return;
    }

    try {
      setLoading(true);

      if (mode === 'signup') {
        const { data, error } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
          });

        if (error) {
          throw error;
        }

        if (!data.session) {
          showMessage(
            'Check your email 💌',
            'Your MyFinance account was created. Supabase may require you to confirm your email before signing in.'
          );

          setMode('login');
          return;
        }

        router.replace('/');
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (error) {
          throw error;
        }

        router.replace('/');
      }
    } catch (error) {
      console.error(error);

      showMessage(
        mode === 'signup'
          ? 'Unable to create account'
          : 'Unable to sign in',
        error?.message || 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>
            ₱
          </Text>
        </View>

        <Text style={styles.title}>
          MyFinance
        </Text>

        <Text style={styles.subtitle}>
          Your money, organized beautifully.
        </Text>

        <View style={styles.card}>
          <Text style={styles.heading}>
            {mode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </Text>

          <Text style={styles.description}>
            {mode === 'login'
              ? 'Sign in to access your personal finances.'
              : 'Create a private account for your MyFinance data.'}
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && {
                opacity: 0.85,
              },
              loading && {
                opacity: 0.65,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={loading}
            onPress={() =>
              setMode(
                mode === 'login'
                  ? 'signup'
                  : 'login'
              )
            }
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}

              <Text style={styles.switchStrong}>
                {mode === 'login'
                  ? 'Create one'
                  : 'Sign in'}
              </Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.security}>
          🔒 Your financial data will be stored privately in your MyFinance database.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignSelf: 'center',
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  logoText: {
    color: colors.pink,
    fontSize: 32,
    fontWeight: '800',
  },

  title: {
    textAlign: 'center',
    color: colors.text,
    fontFamily: 'Georgia',
    fontSize: 31,
    fontStyle: 'italic',
    fontWeight: '700',
  },

  subtitle: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 26,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },

  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },

  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 20,
  },

  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFCFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
    marginBottom: 16,
    outlineStyle: 'none',
  },

  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  switchButton: {
    paddingVertical: 17,
    alignItems: 'center',
  },

  switchText: {
    color: colors.muted,
    fontSize: 13,
  },

  switchStrong: {
    color: colors.pink,
    fontWeight: '800',
  },

  security: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
  },
});