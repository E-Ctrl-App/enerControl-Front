import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

export default function LoginScreen({onLogin}) {
  const [role, setRole] = useState('maestro');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>EC</Text>
        </View>
        <Text style={styles.brandTitle}>
          Ener<Text style={styles.greenText}>Control</Text>
        </Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.tag}>Sistema activo · Campus Norte</Text>
        <Text style={styles.heroTitle}>Gestión energética inteligente</Text>
        <Text style={styles.heroSub}>
          Controla la iluminación de cada aula, registra el acceso de maestros y reduce el consumo eléctrico.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Bienvenido de vuelta</Text>
        <Text style={styles.formSub}>Inicia sesión en tu cuenta</Text>

        <View style={styles.roleTabs}>
          <Pressable
            style={[styles.roleTab, role === 'maestro' && styles.roleTabActive]}
            onPress={() => setRole('maestro')}>
            <Text style={[styles.roleText, role === 'maestro' && styles.roleTextActive]}>
              Maestro
            </Text>
          </Pressable>

          <Pressable
            style={[styles.roleTab, role === 'admin' && styles.roleTabActive]}
            onPress={() => setRole('admin')}>
            <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>
              Admin
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Correo institucional</Text>
        <TextInput
          style={styles.input}
          placeholder="maestro@universidad.edu"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#64748b"
          secureTextEntry
        />

        <Pressable style={styles.primaryButton} onPress={onLogin}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            Cuenta Microsoft institucional
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#07111f', padding: 22},
  brandBox: {flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 24},
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {color: '#052e16', fontWeight: '900'},
  brandTitle: {color: '#ffffff', fontSize: 26, fontWeight: '800'},
  greenText: {color: '#34d399'},
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tag: {color: '#86efac', fontSize: 13, marginBottom: 12},
  heroTitle: {color: '#ffffff', fontSize: 30, fontWeight: '900', marginBottom: 10},
  heroSub: {color: '#94a3b8', fontSize: 15, lineHeight: 22},
  formCard: {backgroundColor: '#ffffff', borderRadius: 28, padding: 22},
  formTitle: {fontSize: 25, fontWeight: '900', color: '#0f172a'},
  formSub: {color: '#64748b', marginTop: 6, marginBottom: 18},
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  roleTab: {flex: 1, padding: 12, borderRadius: 12, alignItems: 'center'},
  roleTabActive: {backgroundColor: '#0f172a'},
  roleText: {color: '#334155', fontWeight: '700'},
  roleTextActive: {color: '#ffffff'},
  label: {color: '#334155', fontWeight: '700', marginBottom: 7},
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    color: '#0f172a',
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {color: '#ffffff', fontWeight: '900', fontSize: 16},
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {color: '#334155', fontWeight: '700'},
});