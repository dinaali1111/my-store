import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLocked } from '../store/authSlice';
import { biometricAuth } from '../services/biometricAuth';
import { authAPI } from '../services/api';
import { useAutoLock } from '../services/autoLock';

const { width } = Dimensions.get('window');

const LockOverlay: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLocked, user } = useAppSelector(state => state.auth);
  const { resetTimer } = useAutoLock();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    checkBiometricCapability();
  }, []);

  useEffect(() => {
    if (isLocked && hasBiometrics) {
      // Auto-trigger biometric authentication when locked
      setTimeout(() => {
        handleBiometricUnlock();
      }, 500);
    }
  }, [isLocked, hasBiometrics]);

  const checkBiometricCapability = async () => {
    const isAvailable = await biometricAuth.isAvailable();
    setHasBiometrics(isAvailable);
  };

  const handleBiometricUnlock = async () => {
    setIsAuthenticating(true);
    
    try {
      const result = await biometricAuth.authenticate('Please authenticate to unlock the app');
      
      if (result.success) {
        dispatch(setLocked(false));
      } else if (result.fallback) {
        setShowPasswordModal(true);
      } else {
        Alert.alert('Authentication Failed', result.error || 'Unable to authenticate');
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordUnlock = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User data not found');
      return;
    }

    setIsAuthenticating(true);
    try {
      // Verify password with the API
      const response = await authAPI.login({
        username: user.username,
        password: password,
      });

      if (response.token) {
        dispatch(setLocked(false));
        setShowPasswordModal(false);
        setPassword('');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid password');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
  };

  if (!isLocked) {
    return null;
  }

  return (
    <Modal
      visible={isLocked}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* User Info */}
          {user && (
            <View style={styles.userInfo}>
              {user.image && (
                <Image source={{ uri: user.image }} style={styles.userImage} />
              )}
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          )}

          <View style={styles.lockIcon}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
          
          <Text style={styles.title}>App Locked</Text>
          <Text style={styles.subtitle}>
            Welcome back, {user?.firstName || 'User'}
          </Text>
          <Text style={styles.description}>
            Please authenticate to unlock the app
          </Text>

          {/* Biometric Button */}
          {hasBiometrics && (
            <TouchableOpacity
              style={[styles.unlockButton, isAuthenticating && styles.disabledButton]}
              onPress={() => {
                resetTimer(); // Reset timer on button press
                handleBiometricUnlock();
              }}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.unlockButtonText}>Unlock with Biometrics</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => {
              resetTimer(); // Reset timer on button press
              setShowPasswordModal(true);
            }}
          >
            <Text style={styles.passwordButtonText}>Use Password</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Password</Text>
            
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                resetTimer(); // Reset timer on password input
              }}
              onFocus={() => resetTimer()} // Reset timer on focus
              placeholder="Enter your password"
              secureTextEntry
              autoFocus
              editable={!isAuthenticating}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  resetTimer(); // Reset timer on button press
                  closePasswordModal();
                }}
                disabled={isAuthenticating}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalUnlockButton}
                onPress={() => {
                  resetTimer(); // Reset timer on button press
                  handlePasswordUnlock();
                }}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalUnlockText}>Unlock</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.demoPasswordText}>
              Demo password: "dinaali"
            </Text>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#d1d5db',
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  unlockButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#6b7280',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  passwordButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalUnlockButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalUnlockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoPasswordText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default LockOverlay;