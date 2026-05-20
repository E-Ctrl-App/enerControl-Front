import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {login, register} from '../api/auth';
import {API_BASE_URL} from '../api/config';

export default function LoginScreen({onAuthenticated}) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('TEACHER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('ana@ecocampus.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isRegister = mode === 'register';

  async function handleSubmit() {
    setLoading(true);
    setMessage('');

    try {
      if (isRegister) {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });
        setMode('login');
        setMessage('Cuenta creada. Ya puedes iniciar sesión.');
        return;
      }

      const nextSession = await login({
        email: email.trim(),
        password,
      });
      await onAuthenticated(nextSession);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brandBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>EC</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>
                Eco<Text style={styles.greenText}>Campus</Text>
              </Text>
              <Text style={styles.brandSub}>Backend: {API_BASE_URL}</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.tag}>Control inteligente de aulas</Text>
            <Text style={styles.heroTitle}>Energía bajo permiso</Text>
            <Text style={styles.heroSub}>
              Inicia sesión, escanea el código del salón y controla solo los
              dispositivos habilitados para tu rol.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.modeTabs}>
              <Pressable
                style={[styles.modeTab, !isRegister && styles.modeTabActive]}
                onPress={() => {
                  setMode('login');
                  setMessage('');
                }}>
                <Text
                  style={[
                    styles.modeText,
                    !isRegister && styles.modeTextActive,
                  ]}>
                  Login
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeTab, isRegister && styles.modeTabActive]}
                onPress={() => {
                  setMode('register');
                  setMessage('');
                }}>
                <Text
                  style={[
                    styles.modeText,
                    isRegister && styles.modeTextActive,
                  ]}>
                  Registro
                </Text>
              </Pressable>
            </View>

            <Text style={styles.formTitle}>
              {isRegister ? 'Crear cuenta' : 'Bienvenido'}
            </Text>
            <Text style={styles.formSub}>
              {isRegister
                ? 'Registra un docente o alumno para EcoCampus.'
                : 'Accede con tus credenciales del backend.'}
            </Text>

            {isRegister && (
              <>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setName}
                  placeholder="Luis Alumno"
                  placeholderTextColor="#64748b"
                  style={styles.input}
                  value={name}
                />

                <Text style={styles.label}>Rol</Text>
                <View style={styles.roleTabs}>
                  {['TEACHER', 'STUDENT'].map(item => (
                    <Pressable
                      key={item}
                      style={[
                        styles.roleTab,
                        role === item && styles.roleTabActive,
                      ]}
                      onPress={() => setRole(item)}>
                      <Text
                        style={[
                          styles.roleText,
                          role === item && styles.roleTextActive,
                        ]}>
                        {item === 'TEACHER' ? 'Docente' : 'Alumno'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>Correo</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="ana@ecocampus.com"
              placeholderTextColor="#64748b"
              style={styles.input}
              value={email}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              onChangeText={setPassword}
              placeholder="123456"
              placeholderTextColor="#64748b"
              secureTextEntry
              style={styles.input}
              value={password}
            />

            {!!message && (
              <Text
                style={[
                  styles.message,
                  message.includes('creada') && styles.successMessage,
                ]}>
                {message}
              </Text>
            )}

            <Pressable
              disabled={loading}
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#07111f'},
  keyboard: {flex: 1},
  content: {padding: 22, paddingBottom: 34},
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 18,
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  logoText: {color: '#052e16', fontWeight: '900'},
  brandTitle: {color: '#ffffff', fontSize: 26, fontWeight: '800'},
  brandSub: {color: '#94a3b8', fontSize: 12, marginTop: 3},
  greenText: {color: '#34d399'},
  heroCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 18,
    padding: 22,
  },
  tag: {color: '#86efac', fontSize: 13, marginBottom: 12},
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroSub: {color: '#94a3b8', fontSize: 15, lineHeight: 22},
  formCard: {backgroundColor: '#ffffff', borderRadius: 8, padding: 22},
  formTitle: {color: '#0f172a', fontSize: 25, fontWeight: '900'},
  formSub: {color: '#64748b', marginBottom: 18, marginTop: 6},
  modeTabs: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 18,
    padding: 4,
  },
  modeTab: {alignItems: 'center', borderRadius: 6, flex: 1, padding: 12},
  modeTabActive: {backgroundColor: '#0f172a'},
  modeText: {color: '#334155', fontWeight: '800'},
  modeTextActive: {color: '#ffffff'},
  roleTabs: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 4,
  },
  roleTab: {alignItems: 'center', borderRadius: 6, flex: 1, padding: 12},
  roleTabActive: {backgroundColor: '#14532d'},
  roleText: {color: '#334155', fontWeight: '700'},
  roleTextActive: {color: '#ffffff'},
  label: {color: '#334155', fontWeight: '700', marginBottom: 7},
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    color: '#0f172a',
    marginBottom: 14,
    padding: 14,
  },
  message: {
    color: '#b91c1c',
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 12,
  },
  successMessage: {color: '#15803d'},
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    marginTop: 6,
    minHeight: 50,
    justifyContent: 'center',
    padding: 15,
  },
  buttonDisabled: {opacity: 0.72},
  primaryButtonText: {color: '#ffffff', fontSize: 16, fontWeight: '900'},
});
