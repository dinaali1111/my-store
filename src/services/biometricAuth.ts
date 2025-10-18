import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  fallback?: boolean; // If user chose password fallback
}

export const biometricAuth = {
  // Check if biometric authentication is available
  isAvailable: async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  // Get available biometric types
  getSupportedTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  // Authenticate with biometrics
  authenticate: async (reason: string = 'Please authenticate to unlock the app'): Promise<BiometricAuthResult> => {
    try {
      const isAvailable = await biometricAuth.isAvailable();
      
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
          fallback: true,
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
          fallback: !result.success,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Biometric authentication failed',
        fallback: true,
      };
    }
  },

  // Show password fallback alert
  showPasswordFallback: (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Authentication Required',
        'Biometric authentication failed. Please enter your password.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enter Password',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  },
};