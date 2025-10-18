import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OfflineBanner: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Simple network check - in a real app you'd use NetInfo
    const checkConnection = async () => {
      try {
        const response = await fetch('https://www.google.com', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📡 You're offline - Showing cached data</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OfflineBanner;