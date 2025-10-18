import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAuthAsync } from '../store/authSlice';
import { authAPI } from '../services/api';
import { useAutoLock } from '../services/autoLock';
import type { LoginRequest } from '../types';

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { resetTimer } = useAutoLock();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authAPI.login(credentials),
    onSuccess: (data) => {
      console.log('✅ Login successful:', data);
      // Check for both token and accessToken (DummyJSON uses accessToken)
      const token = data.token || data.accessToken;
      if (data && token) {
        dispatch(setAuthAsync({ user: data, token: token }));
      } else {
        console.error('❌ Invalid response data:', data);
        Alert.alert('Login Failed', 'Invalid response from server');
      }
    },
    onError: (error: any) => {
      console.error('❌ Login failed:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Network error. Please check your internet connection.';
      Alert.alert('Login Failed', errorMessage);
    },
  });

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    // Special case for demo user "dina"
    if (username.trim() === 'dina' && password === 'dinaali') {
      console.log('🎯 Demo login for dina');
      const demoUser = {
        id: 999,
        username: 'dina',
        email: 'dina@demo.com',
        firstName: 'Dina',
        lastName: 'Ali',
        gender: 'female',
        image: 'https://dummyjson.com/icon/dina/128'
      };
      
      const demoToken = 'demo_token_for_dina_user_' + Date.now();
      dispatch(setAuthAsync({ user: demoUser, token: demoToken }));
      return;
    }

    console.log('🚀 Attempting login...');
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>My Store</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (isAuthenticated) resetTimer(); // Reset timer if already authenticated
                }}
                onFocus={() => isAuthenticated && resetTimer()} // Reset timer on focus
                placeholder="Enter username"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loginMutation.isPending}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (isAuthenticated) resetTimer(); // Reset timer if already authenticated
                }}
                onFocus={() => isAuthenticated && resetTimer()} // Reset timer on focus
                placeholder="Enter password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loginMutation.isPending}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loginMutation.isPending && styles.disabledButton]}
              onPress={() => {
                if (isAuthenticated) resetTimer(); // Reset timer on button press
                handleLogin();
              }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.demoText}>Demo Credentials:</Text>
            <Text style={styles.demoCredentials}>Username: dina</Text>
            <Text style={styles.demoCredentials}>Password: dinaali</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  demoCredentials: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default LoginScreen;