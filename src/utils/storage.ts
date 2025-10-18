import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

let storage: MMKV;
let useAsyncStorage = false;

try {
  storage = new MMKV();
} catch (error) {
  console.warn('MMKV failed to initialize, falling back to AsyncStorage:', error);
  useAsyncStorage = true;
}

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REACT_QUERY_CACHE: 'react_query_cache',
  IS_SUPERADMIN: 'is_superadmin',
} as const;

export const storageUtils = {
  setItem: async (key: string, value: string) => {
    if (useAsyncStorage) {
      await AsyncStorage.setItem(key, value);
    } else {
      storage.set(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | undefined> => {
    if (useAsyncStorage) {
      const value = await AsyncStorage.getItem(key);
      return value || undefined;
    } else {
      return storage.getString(key);
    }
  },
  
  removeItem: async (key: string) => {
    if (useAsyncStorage) {
      await AsyncStorage.removeItem(key);
    } else {
      storage.delete(key);
    }
  },
  
  clear: async () => {
    if (useAsyncStorage) {
      await AsyncStorage.clear();
    } else {
      storage.clearAll();
    }
  },
  
  setObject: async <T>(key: string, value: T) => {
    const jsonValue = JSON.stringify(value);
    await storageUtils.setItem(key, jsonValue);
  },
  
  getObject: async <T>(key: string): Promise<T | null> => {
    const item = await storageUtils.getItem(key);
    return item ? JSON.parse(item) : null;
  },
};