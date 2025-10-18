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

const { width } = Dimensions.get('window');

const LockOverlay: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLocked, user } = useAppSelector(state => state.auth);
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
    <>
      {/* Main Lock Screen */}
      <Modal
        visible={isLocked && !showPasswordModal}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <View style={styles.container}>
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

            {/* Lock Icon */}
            <View style={styles.lockIconContainer}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>

            <Text style={styles.title}>App Locked</Text>
            <Text style={styles.subtitle}>
              {hasBiometrics 
                ? 'Use biometric authentication to unlock' 
                : 'App is locked for security'}
            </Text>

            {/* Biometric Button */}
            {hasBiometrics && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricUnlock}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="#007AFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.biometricIcon}>👆</Text>
                    <Text style={styles.biometricText}>Use Biometric</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Password Button */}
            <TouchableOpacity
              style={styles.passwordButton}
              onPress={() => setShowPasswordModal(true)}
              disabled={isAuthenticating}
            >
              <Text style={styles.passwordButtonText}>Use Password</Text>
            </TouchableOpacity>

            <Text style={styles.appName}>My Store</Text>
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <Text style={styles.modalTitle}>Enter Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your password to unlock the app
            </Text>

            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
              editable={!isAuthenticating}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePasswordModal}
                disabled={isAuthenticating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.unlockButton]}
                onPress={handlePasswordUnlock}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.unlockButtonText}>Unlock</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.85,
    maxWidth: 400,
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
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
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  biometricButton: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  biometricIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  biometricText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  passwordButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appName: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModal: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  unlockButton: {
    backgroundColor: '#007AFF',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LockOverlay;