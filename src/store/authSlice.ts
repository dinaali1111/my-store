import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../types';
import { storageUtils, StorageKeys } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isSuperadmin: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLocked: false,
  isSuperadmin: false,
};

// Async thunk for setting auth
export const setAuthAsync = createAsyncThunk(
  'auth/setAuthAsync',
  async ({ user, token }: { user: User; token: string }) => {
    console.log('Setting auth for user:', user.username);
    await storageUtils.setItem(StorageKeys.AUTH_TOKEN, token);
    await storageUtils.setObject(StorageKeys.USER_DATA, user);
    
    // Check if user is superadmin
    const isSuperadmin = user.username === 'emilys' || 
                        user.username === 'michaelw' ||
                        user.username === 'sophia_brown' ||
                        user.username === 'dina';
    await storageUtils.setObject(StorageKeys.IS_SUPERADMIN, isSuperadmin);
    
    console.log('Auth data saved successfully');
    return { user, token, isSuperadmin };
  }
);

// Async thunk for restoring auth
export const restoreAuthAsync = createAsyncThunk(
  'auth/restoreAuthAsync',
  async () => {
    const token = await storageUtils.getItem(StorageKeys.AUTH_TOKEN);
    const user = await storageUtils.getObject<User>(StorageKeys.USER_DATA);
    const isSuperadmin = await storageUtils.getObject<boolean>(StorageKeys.IS_SUPERADMIN);
    
    if (token && user) {
      return { token, user, isSuperadmin: isSuperadmin || false };
    }
    return null;
  }
);

// Async thunk for clearing auth
export const clearAuthAsync = createAsyncThunk(
  'auth/clearAuthAsync',
  async () => {
    console.log('🧹 Clearing auth data...');
    await storageUtils.removeItem(StorageKeys.AUTH_TOKEN);
    await storageUtils.removeItem(StorageKeys.USER_DATA);
    await storageUtils.removeItem(StorageKeys.IS_SUPERADMIN);
    console.log('✅ Auth data cleared successfully');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLocked: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAuthAsync.fulfilled, (state, action) => {
        console.log('setAuthAsync fulfilled:', action.payload);
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLocked = false;
        state.isSuperadmin = action.payload.isSuperadmin;
      })
      .addCase(setAuthAsync.rejected, (state, action) => {
        console.error('setAuthAsync rejected:', action.error);
      })
      .addCase(restoreAuthAsync.fulfilled, (state, action) => {
        if (action.payload) {
          console.log('Auth restored:', action.payload.user.username);
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isLocked = true; // Show biometric unlock
          state.isSuperadmin = action.payload.isSuperadmin;
        }
      })
      .addCase(clearAuthAsync.fulfilled, (state) => {
        console.log('🔓 Auth cleared from state');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLocked = false;
        state.isSuperadmin = false;
      });
  },
});

export const { setLocked } = authSlice.actions;
export default authSlice.reducer;