import React from 'react';
import { StyleSheet, View, StatusBar, Platform, TouchableWithoutFeedback, PanResponder } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { QueryProvider } from './src/services/queryClient';
import AppNavigator from './src/navigation/AppNavigator';
import LockOverlay from './src/components/LockOverlay';
import OfflineBanner from './src/components/OfflineBanner';
import { useAutoLock } from './src/services/autoLock';

const AppContent: React.FC = () => {
  const { resetTimer } = useAutoLock();

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log('📱 Touch detected - resetting timer');
        resetTimer();
        return false; // Don't capture the gesture, let it pass through
      },
      onMoveShouldSetPanResponder: () => {
        console.log('📱 Movement detected - resetting timer');
        resetTimer();
        return false; // Don't capture the gesture, let it pass through
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <OfflineBanner />
      <AppNavigator />
      <LockOverlay />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <QueryProvider>
            <AppContent />
          </QueryProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
