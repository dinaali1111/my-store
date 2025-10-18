import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { clearAuthAsync } from '../store/authSlice';
import ProductsScreen from '../screens/ProductsScreen';
import AutoLockTestScreen from '../screens/AutoLockTestScreen';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const LogoutButton: React.FC = () => {
  return (
    <TouchableOpacity style={styles.logoutButton}>
      <Text style={styles.logoutText}>Tap "Sign Out" tab to logout</Text>
    </TouchableOpacity>
  );
};

const MainTabNavigator: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogoutPress = () => {
    console.log('🚪 Logout button pressed');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            console.log('🔓 Signing out...');
            dispatch(clearAuthAsync());
          },
        },
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: '#1f2937',
      }}
    >
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'All Products',
          tabBarIcon: () => <Text style={styles.tabIcon}>🛍️</Text>,
        }}
      />
      <Tab.Screen
        name="AutoLockTest"
        component={AutoLockTestScreen}
        options={{
          title: 'Auto-lock Test',
          tabBarIcon: () => <Text style={styles.tabIcon}>🔒</Text>,
        }}
      />
      <Tab.Screen
        name="Logout"
        component={LogoutButton}
        options={{
          title: 'Sign Out',
          tabBarIcon: () => <Text style={styles.tabIcon}>🚪</Text>,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            handleLogoutPress();
          },
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 20,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MainTabNavigator;