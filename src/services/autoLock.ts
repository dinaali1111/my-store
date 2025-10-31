import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLocked } from '../store/authSlice';

const INACTIVITY_TIMEOUT = 10000; // 10 seconds

// Singleton manager so all callers share the same timer
const AutoLockManager = (() => {
  let timer: number | null = null;
  let startAt: number | null = null;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer as unknown as number);
      console.log('⏱ AutoLockManager.clear called (clearing id)', timer);
      timer = null;
    }
  };

  const start = (onLock: () => void) => {
    clear();
    startAt = Date.now();
    console.log('⏰ AutoLockManager.start - scheduling lock in', INACTIVITY_TIMEOUT);
    const id = setTimeout(() => {
      console.log('🔒 AutoLockManager.timeout fired');
      timer = null;
      startAt = null;
      onLock();
    }, INACTIVITY_TIMEOUT) as unknown as number;
    timer = id;
    console.log('⏱ AutoLockManager.timer set to', id, 'startAt', startAt);
  };

  const reset = (onLock: () => void) => {
    // just start (clears previous)
    start(onLock);
  };

  const getRemaining = () => {
    if (startAt === null) return null;
    const elapsed = Date.now() - startAt;
    const rem = INACTIVITY_TIMEOUT - elapsed;
    return rem > 0 ? rem : 0;
  };

  return { start, reset, clear, getRemaining };
})();

export const useAutoLock = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLocked } = useAppSelector(state => state.auth);

  const handleLock = useCallback(() => {
    console.log('🔐 useAutoLock.handleLock -> dispatching setLocked(true)');
    dispatch(setLocked(true));
  }, [dispatch]);

  const resetTimer = useCallback(() => {
    console.log('👆 useAutoLock.resetTimer called - isAuthenticated:', isAuthenticated, 'isLocked:', isLocked);
    if (!isAuthenticated || isLocked) {
      console.log('⛔ useAutoLock.resetTimer ignored - not authenticated or already locked');
      return;
    }
    AutoLockManager.reset(handleLock);
  }, [isAuthenticated, isLocked, handleLock]);

  const clearTimer = useCallback(() => {
    AutoLockManager.clear();
  }, []);

  useEffect(() => {
    console.log('� useAutoLock effect - authenticated:', isAuthenticated, 'locked:', isLocked);
    if (isAuthenticated && !isLocked) {
      AutoLockManager.start(handleLock);
    } else {
      AutoLockManager.clear();
    }
    return () => {
      AutoLockManager.clear();
    };
  }, [isAuthenticated, isLocked, handleLock]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('� useAutoLock AppState change:', nextAppState);
      if (nextAppState.match(/inactive|background/)) {
        if (isAuthenticated) {
          console.log('� App going to background - locking via AppState handler');
          dispatch(setLocked(true));
        }
        AutoLockManager.clear();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [dispatch, isAuthenticated]);

  const getRemaining = useCallback(() => {
    // expose manager remaining ms
    try {
      // @ts-ignore access internal function
      return (AutoLockManager as any).getRemaining();
    } catch (e) {
      return null;
    }
  }, []);

  return { resetTimer, clearTimer, getRemaining };
};