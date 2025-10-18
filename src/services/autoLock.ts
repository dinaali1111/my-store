import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLocked } from '../store/authSlice';

const INACTIVITY_TIMEOUT = 10000; // 10 seconds

export const useAutoLock = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLocked } = useAppSelector(state => state.auth);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Clear existing timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start auto-lock timer
  const startTimer = () => {
    // Only start if authenticated and not locked
    if (!isAuthenticated || isLocked) {
      console.log('❌ Cannot start timer - authenticated:', isAuthenticated, 'locked:', isLocked);
      return;
    }

    // Clear any existing timer
    clearTimer();

    console.log('⏰ Starting 10-second auto-lock timer');
    
    timerRef.current = setTimeout(() => {
      console.log('🔒 Auto-locking after 10 seconds of inactivity');
      dispatch(setLocked(true));
    }, INACTIVITY_TIMEOUT);
  };

  // Reset timer (called on user activity)
  const resetTimer = () => {
    if (!isAuthenticated || isLocked) {
      return;
    }
    
    console.log('👆 User activity detected - restarting timer');
    startTimer(); // This will clear old timer and start new one
  };

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('📱 App state changed:', appStateRef.current, '→', nextAppState);
    
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App coming to foreground - lock it
      if (isAuthenticated) {
        console.log('🔒 App came to foreground - locking for security');
        dispatch(setLocked(true));
      }
    } else if (nextAppState.match(/inactive|background/)) {
      // App going to background - clear timer
      console.log('📱 App going to background - clearing timer');
      clearTimer();
    }
    
    appStateRef.current = nextAppState;
  };

  // Start timer when authenticated and unlocked
  useEffect(() => {
    console.log('🔄 Auth state changed - authenticated:', isAuthenticated, 'locked:', isLocked);
    
    if (isAuthenticated && !isLocked) {
      console.log('🚀 Starting auto-lock system');
      startTimer();
    } else {
      console.log('🛑 Stopping auto-lock system');
      clearTimer();
    }

    return () => {
      clearTimer();
    };
  }, [isAuthenticated, isLocked]);

  // Listen to app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      clearTimer();
    };
  }, [isAuthenticated]);

  return {
    resetTimer,
  };
};