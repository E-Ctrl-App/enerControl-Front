import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import TeacherHome from './src/screens/TeacherHome';
import {clearSession, getStoredSession, saveSession} from './src/api/storage';
import {setAccessToken} from './src/api/client';
import {connectSocket, disconnectSocket} from './src/api/socket';

export default function App() {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let mounted = true;

    getStoredSession()
      .then(storedSession => {
        if (!mounted) {
          return;
        }

        if (storedSession) {
          setAccessToken(storedSession.accessToken);
          connectSocket();
          setSession(storedSession);
        }
      })
      .finally(() => {
        if (mounted) {
          setRestoring(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleAuthenticated(nextSession) {
    setAccessToken(nextSession.accessToken);
    await saveSession(nextSession);
    connectSocket();
    setSession(nextSession);
  }

  async function handleLogout() {
    disconnectSocket();
    setAccessToken(null);
    await clearSession();
    setSession(null);
  }

  if (restoring) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#34d399" size="large" />
        <Text style={styles.loadingText}>Restaurando sesión</Text>
      </SafeAreaView>
    );
  }

  return session ? (
    <TeacherHome session={session} onLogout={handleLogout} />
  ) : (
    <LoginScreen onAuthenticated={handleAuthenticated} />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#07111f',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontWeight: '800',
    marginTop: 14,
  },
});
