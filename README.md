# My Store - React Native App

A minimal React Native store app that implements authentication, auto-lock functionality, and product management with offline caching capabilities.

## Features

### Authentication
- Login via DummyJSON API
- Token storage with MMKV
- Session restoration with biometric unlock
- Superadmin designation for product management

### Auto-Lock & Security
- Auto-locks after 10 seconds of inactivity
- Locks when app goes to background
- Biometric authentication with password fallback
- Lock overlay that obscures content

### Product Management
- All Products screen with product listing
- Category-specific product filtering
- Delete functionality for superadmin users
- Pull-to-refresh on all product lists

### Offline Support
- React Query with MMKV persistence
- Cached data available offline
- Offline indicator banner
- Instant loading from cache

## Tech Stack

- **React Native** - Mobile framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation system
- **React Query** - Data fetching and caching
- **Redux Toolkit** - State management
- **MMKV** - Fast storage for persistence
- **Expo Local Authentication** - Biometric authentication

## Project Structure

```
src/
├── components/
│   ├── LockOverlay.tsx
│   └── OfflineBanner.tsx
├── navigation/
│   ├── AppNavigator.tsx
│   └── MainTabNavigator.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── ProductsScreen.tsx
│   └── CategoryScreen.tsx
├── services/
│   ├── api.ts
│   ├── autoLock.ts
│   ├── biometricAuth.ts
│   └── queryClient.ts
├── store/
│   ├── authSlice.ts
│   ├── hooks.ts
│   └── index.ts
├── types/
│   └── index.ts
└── utils/
    └── storage.ts
```

## API Integration

Using DummyJSON API endpoints:
- `POST /auth/login` - User authentication
- `GET /auth/me` - User profile validation
- `GET /products` - All products
- `GET /products/categories` - Product categories
- `GET /products/category/{category}` - Category products
- `DELETE /products/{id}` - Delete product (simulated)

## Demo Credentials

- **Username:** dina
- **Password:** dinaali

### Alternative Demo Accounts (DummyJSON API):
- **Username:** emilys, **Password:** emilyspass

## Superadmin Users

The following users have delete privileges:
- dina
- emilys
- michaelw
- sophia_brown

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Run on device/simulator:
   ```bash
   npm run ios    # iOS
   npm run android # Android
   ```

## Key Implementation Details

### Auto-Lock System
- Uses `useAutoLock` hook to monitor inactivity
- Implements React Native AppState for background detection
- 10-second timeout with automatic reset on user interaction

### Biometric Authentication
- Expo Local Authentication for biometric prompts
- Graceful fallback to password when biometrics unavailable
- Secure token validation on app unlock

### Offline Caching
- React Query persistence with MMKV storage
- Query cache survives app restarts
- Offline banner indicates network status

### State Management
- Redux Toolkit for authentication state
- MMKV for persistent storage
- React Query for server state management

## Architecture Highlights

- **Clean separation of concerns** with dedicated folders
- **TypeScript integration** for type safety
- **Modern React hooks** throughout the application
- **Responsive design** with proper styling
- **Error handling** with user-friendly messages
- **Performance optimization** with proper caching strategies