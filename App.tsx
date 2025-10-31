import React from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
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

  return (
    <SafeAreaView
      style={styles.container}
      // Capture phase handlers: observe touches before children, do not claim responder
      onStartShouldSetResponderCapture={() => {
        console.log('📱 capture: start touch detected - resetting timer');
        resetTimer();
        return false; // do not become responder, let children handle the event
      }}
      onMoveShouldSetResponderCapture={() => {
        console.log('📱 capture: move detected - resetting timer');
        resetTimer();
        return false;
      }}
      // Fallback non-capture handlers (some platforms might call these)
      onTouchStart={() => {
        console.log('📱 Touch detected (onTouchStart) - resetting timer');
        resetTimer();
      }}
      onTouchMove={() => {
        // movement also counts as activity
        console.log('📱 Touch move detected - resetting timer');
        resetTimer();
      }}
    >
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
