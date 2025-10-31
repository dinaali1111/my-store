import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setLocked } from '../store/authSlice';
import { useAutoLock } from '../services/autoLock';

const AutoLockTestScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLocked } = useAppSelector(state => state.auth);
  const { resetTimer, getRemaining } = useAutoLock();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`🧪 TEST: ${message}`);
  };

  const testAutoLock = () => {
    addLog('🧪 Starting Auto-lock test');
    addLog('⏰ Wait 10 seconds without touching screen...');
    Alert.alert(
      'Auto-lock Test', 
      'The app should automatically lock after 10 seconds of inactivity. Watch for the lock screen!\n\nCheck console logs for timer status.',
      [{ text: 'OK', onPress: () => addLog('📱 Test started - timer should be running') }]
    );
  };

  const testManualLock = () => {
    addLog('🔒 Manually locking app');
    dispatch(setLocked(true));
  };

  const testResetTimer = () => {
    addLog('👆 Resetting inactivity timer');
    resetTimer();
  };

  useEffect(() => {
    const t = setInterval(() => {
      try {
        const r = getRemaining ? getRemaining() : null;
        setRemainingMs(r);
      } catch (e) {
        setRemainingMs(null);
      }
    }, 200);
    return () => clearInterval(t);
  }, [getRemaining]);

  const clearLog = () => {
    setTestLog([]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Auto-lock Test</Text>
        <Text style={styles.message}>Please login first to test auto-lock</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Auto-lock Test Panel</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.status, isLocked ? styles.locked : styles.unlocked]}>
          {isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
        </Text>
        {!isLocked && remainingMs !== null && (
          <Text style={styles.countdown}>⏳ {Math.ceil(remainingMs / 1000)}s</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.testButton} onPress={testAutoLock}>
          <Text style={styles.buttonText}>🧪 Test Auto-lock (10s)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testManualLock}>
          <Text style={styles.buttonText}>🔒 Manual Lock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testResetTimer}>
          <Text style={styles.buttonText}>👆 Reset Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearLog}>
          <Text style={styles.clearButtonText}>🗑️ Clear Log</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>📋 Test Log:</Text>
        {testLog.length === 0 ? (
          <Text style={styles.noLog}>No logs yet</Text>
        ) : (
          testLog.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>📝 Test Instructions:</Text>
        <Text style={styles.instruction}>1. Click "Test Auto-lock (10s)"</Text>
        <Text style={styles.instruction}>2. Don't touch the screen for 10 seconds</Text>
        <Text style={styles.instruction}>3. App should lock automatically</Text>
        <Text style={styles.instruction}>4. Try biometric unlock or password</Text>
        <Text style={styles.instruction}>5. Test background lock by minimizing app</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
    color: '#333',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  countdown: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  locked: {
    color: '#dc2626',
  },
  unlocked: {
    color: '#16a34a',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noLog: {
    fontStyle: 'italic',
    color: '#666',
  },
  logEntry: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default AutoLockTestScreen;