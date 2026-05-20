import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import TabButton from '../components/TabButton';
import {getDashboard} from '../api/dashboard';
import {toggleDevice} from '../api/devices';
import {scanQr} from '../api/qr';
import {getSocket} from '../api/socket';

const deviceTypeLabels = {
  FAN: 'Ventilador',
  LIGHT: 'Luz',
  PROJECTOR: 'Proyector',
};

const statusLabels = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  OFF: 'Apagado',
  ON: 'Encendido',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function formatNumber(value, suffix = '') {
  if (value === undefined || value === null) {
    return `0${suffix}`;
  }

  return `${Number(value).toLocaleString('es-MX', {
    maximumFractionDigits: 2,
  })}${suffix}`;
}

export default function TeacherHome({session, onLogout}) {
  const {user} = session;
  const [tab, setTab] = useState('inicio');
  const [qrCode, setQrCode] = useState('ROOM_A201');
  const [classroom, setClassroom] = useState(null);
  const [devices, setDevices] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [socketEvents, setSocketEvents] = useState([]);

  const roleLabel = user.role === 'TEACHER' ? 'Docente' : 'Alumno';
  const allowedHint =
    user.role === 'TEACHER'
      ? 'Puedes controlar luces, proyectores y ventiladores habilitados.'
      : 'Tu rol puede controlar solo luces habilitadas.';

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    setError('');

    try {
      const nextDashboard = await getDashboard();
      setDashboard(nextDashboard);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const socket = getSocket();

    function handleDeviceUpdated(payload) {
      setSocketEvents(events => [
        `Dispositivo actualizado: ${payload.name || payload.deviceId}`,
        ...events,
      ].slice(0, 4));
      setDevices(currentDevices =>
        currentDevices.map(device =>
          device.id === payload.deviceId || device.id === payload.id
            ? {...device, ...payload, id: device.id, status: payload.status}
            : device,
        ),
      );
      loadDashboard();
    }

    function handleQrScanned(payload) {
      setSocketEvents(events => [
        `QR escaneado: ${payload.classroomName || payload.classroomId}`,
        ...events,
      ].slice(0, 4));
      loadDashboard();
    }

    socket.on('device.updated', handleDeviceUpdated);
    socket.on('qr.scanned', handleQrScanned);

    return () => {
      socket.off('device.updated', handleDeviceUpdated);
      socket.off('qr.scanned', handleQrScanned);
    };
  }, [loadDashboard]);

  const dashboardSummary = dashboard?.summary;
  const classrooms = dashboard?.classrooms || [];
  const dashboardDevices = dashboard?.devices || [];
  const activity = dashboard?.activity;

  const deviceCounts = useMemo(() => {
    const on = devices.filter(device => device.status === 'ON').length;
    return {on, total: devices.length};
  }, [devices]);

  async function handleScanQr() {
    if (!qrCode.trim()) {
      setError('Ingresa el texto del QR, por ejemplo ROOM_A201.');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const result = await scanQr(qrCode.trim());
      setClassroom(result.classroom);
      setDevices(result.devices || []);
      setTab('dispositivos');
      await loadDashboard();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleToggleDevice(device) {
    if (!device.allowed) {
      return;
    }

    setTogglingId(device.id);
    setError('');

    try {
      const updatedDevice = await toggleDevice(device.id);
      setDevices(currentDevices =>
        currentDevices.map(currentDevice =>
          currentDevice.id === device.id
            ? {...currentDevice, ...updatedDevice, allowed: currentDevice.allowed}
            : currentDevice,
        ),
      );
      await loadDashboard();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appbar}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>

        <View style={styles.appbarContent}>
          <Text style={styles.appbarName}>{user.name}</Text>
          <Text style={styles.appbarRole}>
            {roleLabel} · {user.email}
          </Text>
        </View>

        <Pressable onPress={onLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingDashboard} onRefresh={loadDashboard} />
        }
        style={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {tab === 'inicio' && (
          <>
            <Text style={styles.sectionLabel}>Sesión</Text>
            <View style={styles.heroPanel}>
              <Text style={styles.eyebrow}>EcoCampus</Text>
              <Text style={styles.heroTitle}>Hola, {user.name}</Text>
              <Text style={styles.heroSub}>{allowedHint}</Text>
            </View>

            <Text style={styles.sectionLabel}>Escanear QR</Text>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Código del salón</Text>
              <TextInput
                autoCapitalize="characters"
                onChangeText={setQrCode}
                placeholder="ROOM_A201"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={qrCode}
              />
              <Pressable
                disabled={scanning}
                style={[styles.primaryButton, scanning && styles.buttonDisabled]}
                onPress={handleScanQr}>
                {scanning ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Consultar salón</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Resumen</Text>
            <View style={styles.statsGrid}>
              <MetricCard
                label="Aulas activas"
                value={formatNumber(dashboardSummary?.activeClassrooms)}
              />
              <MetricCard
                label="Dispositivos ON"
                value={`${formatNumber(dashboardSummary?.devicesOn)} / ${formatNumber(
                  dashboardSummary?.totalDevices,
                )}`}
              />
              <MetricCard
                label="Sesiones"
                value={formatNumber(dashboardSummary?.activeSessions)}
              />
              <MetricCard
                label="Consumo"
                value={formatNumber(dashboardSummary?.estimatedConsumption, ' kWh')}
              />
            </View>

            {!!socketEvents.length && (
              <>
                <Text style={styles.sectionLabel}>Tiempo real</Text>
                {socketEvents.map((event, index) => (
                  <Text key={`${event}-${index}`} style={styles.eventLine}>
                    {event}
                  </Text>
                ))}
              </>
            )}
          </>
        )}

        {tab === 'dispositivos' && (
          <>
            <Text style={styles.pageTitle}>
              {classroom ? classroom.name : 'Sin salón escaneado'}
            </Text>
            <Text style={styles.pageSub}>
              {classroom
                ? `${deviceCounts.on} de ${deviceCounts.total} dispositivos encendidos`
                : 'Escanea un QR para cargar dispositivos.'}
            </Text>

            {!classroom && (
              <Pressable
                style={styles.primaryButton}
                onPress={() => setTab('inicio')}>
                <Text style={styles.primaryButtonText}>Ir a escanear</Text>
              </Pressable>
            )}

            {devices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                loading={togglingId === device.id}
                onToggle={() => handleToggleDevice(device)}
              />
            ))}
          </>
        )}

        {tab === 'dashboard' && (
          <>
            <View style={styles.dashboardHeader}>
              <View>
                <Text style={styles.pageTitle}>Dashboard</Text>
                <Text style={styles.pageSub}>Métricas del campus en vivo</Text>
              </View>
              {loadingDashboard && <ActivityIndicator color="#34d399" />}
            </View>

            <View style={styles.statsGrid}>
              <MetricCard
                label="Aulas activas"
                value={formatNumber(dashboardSummary?.activeClassrooms)}
              />
              <MetricCard
                label="Ahorro"
                value={formatNumber(dashboardSummary?.estimatedSavings, ' kWh')}
              />
              <MetricCard
                label="Encendidos"
                value={formatNumber(dashboardSummary?.devicesOn)}
              />
              <MetricCard
                label="Total"
                value={formatNumber(dashboardSummary?.totalDevices)}
              />
            </View>

            <Text style={styles.sectionLabel}>Salones</Text>
            {classrooms.map(item => (
              <View key={item.id} style={styles.listCard}>
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardMeta}>
                    {item.devicesOn} de {item.totalDevices} encendidos
                  </Text>
                </View>
                <Text
                  style={[
                    styles.statusChip,
                    item.status === 'ACTIVE' ? styles.onChip : styles.offChip,
                  ]}>
                  {statusLabels[item.status] || item.status}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionLabel}>Dispositivos por salón</Text>
            {dashboardDevices.map(group => (
              <View key={group.classroom.id} style={styles.groupCard}>
                <Text style={styles.cardTitle}>{group.classroom.name}</Text>
                <Text style={styles.cardMeta}>{group.classroom.qrCode}</Text>
                {(group.devices || []).map(device => (
                  <View key={device.id} style={styles.inlineRow}>
                    <Text style={styles.inlineText}>{device.name}</Text>
                    <Text
                      style={[
                        styles.inlineStatus,
                        device.status === 'ON' && styles.inlineStatusOn,
                      ]}>
                      {statusLabels[device.status] || device.status}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            <Text style={styles.sectionLabel}>Actividad reciente</Text>
            {(activity?.latestQrSessions || []).map(item => (
              <View key={`qr-${item.id}`} style={styles.activityCard}>
                <Text style={styles.cardTitle}>
                  {item.user?.name} escaneó {item.classroom?.name}
                </Text>
                <Text style={styles.cardMeta}>
                  {new Date(item.entryTime).toLocaleString('es-MX')}
                </Text>
              </View>
            ))}
            {(activity?.latestDevicesModified || []).map(item => (
              <View key={`device-${item.id}`} style={styles.activityCard}>
                <Text style={styles.cardTitle}>
                  {item.name} quedó {statusLabels[item.status] || item.status}
                </Text>
                <Text style={styles.cardMeta}>
                  {item.classroom?.name} · {deviceTypeLabels[item.type] || item.type}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TabButton label="Inicio" active={tab === 'inicio'} onPress={() => setTab('inicio')} />
        <TabButton
          label="Dispositivos"
          active={tab === 'dispositivos'}
          onPress={() => setTab('dispositivos')}
        />
        <TabButton
          label="Dashboard"
          active={tab === 'dashboard'}
          onPress={() => setTab('dashboard')}
        />
      </View>
    </SafeAreaView>
  );
}

function MetricCard({label, value}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function DeviceCard({device, loading, onToggle}) {
  const isOn = device.status === 'ON';

  return (
    <View style={[styles.deviceCard, !device.allowed && styles.deviceLocked]}>
      <View style={styles.deviceHeader}>
        <View>
          <Text style={styles.cardTitle}>{device.name}</Text>
          <Text style={styles.cardMeta}>
            {deviceTypeLabels[device.type] || device.type}
          </Text>
        </View>
        <Text style={[styles.statusChip, isOn ? styles.onChip : styles.offChip]}>
          {statusLabels[device.status] || device.status}
        </Text>
      </View>

      {device.allowed ? (
        <Pressable
          disabled={loading}
          style={[
            styles.toggleButton,
            isOn ? styles.toggleButtonOff : styles.toggleButtonOn,
            loading && styles.buttonDisabled,
          ]}
          onPress={onToggle}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.toggleButtonText}>
              {isOn ? 'Apagar' : 'Encender'}
            </Text>
          )}
        </Pressable>
      ) : (
        <Text style={styles.lockedText}>Bloqueado para tu rol</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#07111f', flex: 1},
  appbar: {
    alignItems: 'center',
    borderBottomColor: '#1e293b',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 18,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    marginRight: 12,
    width: 46,
  },
  avatarText: {color: '#052e16', fontWeight: '900'},
  appbarContent: {flex: 1},
  appbarName: {color: '#ffffff', fontSize: 16, fontWeight: '900'},
  appbarRole: {color: '#94a3b8', marginTop: 2},
  logoutText: {color: '#f87171', fontWeight: '800'},
  scroll: {flex: 1, padding: 18},
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  heroPanel: {
    backgroundColor: '#102a43',
    borderColor: '#1e3a5f',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 20,
  },
  eyebrow: {color: '#93c5fd', fontWeight: '800', marginBottom: 8},
  heroTitle: {color: '#ffffff', fontSize: 30, fontWeight: '900'},
  heroSub: {color: '#cbd5e1', lineHeight: 22, marginTop: 8},
  panel: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  panelTitle: {color: '#ffffff', fontSize: 17, fontWeight: '900', marginBottom: 10},
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 12,
    padding: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 50,
    padding: 15,
  },
  primaryButtonText: {color: '#ffffff', fontSize: 16, fontWeight: '900'},
  buttonDisabled: {opacity: 0.72},
  errorText: {
    backgroundColor: '#3f1d1d',
    borderRadius: 8,
    color: '#fecaca',
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 12,
    padding: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 88,
    padding: 14,
    width: '48%',
  },
  metricValue: {color: '#ffffff', fontSize: 21, fontWeight: '900'},
  metricLabel: {color: '#94a3b8', fontSize: 12, marginTop: 6},
  eventLine: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    color: '#bbf7d0',
    fontWeight: '800',
    marginBottom: 8,
    padding: 12,
  },
  pageTitle: {color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 10},
  pageSub: {color: '#94a3b8', marginBottom: 18, marginTop: 4},
  deviceCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  deviceLocked: {opacity: 0.72},
  deviceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {color: '#ffffff', fontSize: 16, fontWeight: '900'},
  cardMeta: {color: '#94a3b8', marginTop: 4},
  statusChip: {
    borderRadius: 999,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  onChip: {backgroundColor: '#064e3b', color: '#bbf7d0'},
  offChip: {backgroundColor: '#263244', color: '#cbd5e1'},
  toggleButton: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 46,
    justifyContent: 'center',
    padding: 13,
  },
  toggleButtonOn: {backgroundColor: '#16a34a'},
  toggleButtonOff: {backgroundColor: '#dc2626'},
  toggleButtonText: {color: '#ffffff', fontWeight: '900'},
  lockedText: {
    backgroundColor: '#263244',
    borderRadius: 8,
    color: '#cbd5e1',
    fontWeight: '800',
    padding: 12,
    textAlign: 'center',
  },
  dashboardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listCard: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 16,
  },
  inlineRow: {
    alignItems: 'center',
    borderTopColor: '#1e293b',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
  },
  inlineText: {color: '#e2e8f0', fontWeight: '700'},
  inlineStatus: {color: '#cbd5e1', fontWeight: '900'},
  inlineStatusOn: {color: '#86efac'},
  activityCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 16,
  },
  bottomNav: {
    backgroundColor: '#07111f',
    borderTopColor: '#1e293b',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
});
