import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';

import InfoRow from '../components/InfoRow';
import ClassItem from '../components/ClassItem';
import HistoryItem from '../components/HistoryItem';
import TabButton from '../components/TabButton';

export default function TeacherHome({onLogout}) {
  const [tab, setTab] = useState('inicio');
  const [lightsOn, setLightsOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = [
    {id: 'A-101', name: 'Lab. Cómputo', cap: 28, status: 'ocupado'},
    {id: 'A-102', name: 'Aula Magna', cap: 40, status: 'libre'},
    {id: 'B-201', name: 'Lab. de Física', cap: 24, status: 'libre'},
    {id: 'B-202', name: 'Aula asignada', cap: 35, status: 'ocupado'},
    {id: 'C-301', name: 'Multimedia', cap: 30, status: 'libre'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appbar}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MG</Text>
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.appbarName}>Mtra. García López</Text>
          <Text style={styles.appbarRole}>Ing. Industrial · ID 4821</Text>
        </View>

        <Pressable onPress={onLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'inicio' && (
          <>
            <Text style={styles.sectionLabel}>Mi salón asignado hoy</Text>

            <View style={styles.scheduleCard}>
              <Text style={styles.eyebrow}>Próxima clase</Text>
              <Text style={styles.roomTitle}>B-202</Text>
              <Text style={styles.subject}>Cálculo Diferencial · Grupo 3A</Text>
              <Text style={styles.meta}>08:00 – 10:00 · Edificio B, piso 2</Text>
              <Text style={styles.meta}>35 alumnos</Text>
            </View>

            <Text style={styles.sectionLabel}>Control de iluminación — B-202</Text>

            <View style={[styles.lightPill, lightsOn && styles.lightPillOn]}>
              <Text style={[styles.lightText, lightsOn && styles.lightTextOn]}>
                {lightsOn ? 'Luces encendidas · B-202' : 'Luces apagadas'}
              </Text>
            </View>

            <Pressable
              style={[styles.lightButton, lightsOn && styles.lightButtonOff]}
              onPress={() => setLightsOn(!lightsOn)}>
              <Text style={styles.lightButtonText}>
                {lightsOn ? 'Apagar luces del salón' : 'Encender luces del salón'}
              </Text>
            </Pressable>

            <Text style={styles.sectionLabel}>Sesión en curso</Text>

            <View style={styles.sessionCard}>
              <Text style={styles.timer}>00:00:00</Text>
              <Text style={styles.timerSub}>Tiempo de sesión activa</Text>

              <InfoRow label="Entrada" value={lightsOn ? '08:00' : '—'} />
              <InfoRow label="Consumo" value={lightsOn ? '0.248 kWh' : '0.000 kWh'} />
              <InfoRow label="Salón" value="B-202" />
            </View>

            <Text style={styles.sectionLabel}>Mis clases del día</Text>
            <ClassItem title="Cálculo Diferencial" meta="08:00 – 10:00 · Grupo 3A" />
            <ClassItem title="Álgebra Lineal" meta="12:00 – 14:00 · Grupo 2B" />
            <ClassItem title="Cálculo Integral" meta="16:00 – 18:00 · Grupo 4A" />
          </>
        )}

        {tab === 'salones' && (
          <>
            <Text style={styles.pageTitle}>Disponibilidad de salones</Text>
            <Text style={styles.pageSub}>Toca un salón libre para solicitarlo</Text>

            {rooms.map(room => (
              <Pressable
                key={room.id}
                style={styles.roomCard}
                disabled={room.status !== 'libre'}
                onPress={() => {
                  setSelectedRoom(room);
                  setModalVisible(true);
                }}>
                <View>
                  <Text style={styles.roomCode}>{room.id}</Text>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomCap}>Capacidad: {room.cap} personas</Text>
                </View>

                <Text
                  style={[
                    styles.statusChip,
                    room.status === 'libre' ? styles.freeChip : styles.busyChip,
                  ]}>
                  {room.status === 'libre' ? 'Libre' : 'Ocupado'}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {tab === 'historial' && (
          <>
            <Text style={styles.pageTitle}>Mi consumo energético</Text>

            <View style={styles.statsRow}>
              <View style={styles.bigStatCard}>
                <Text style={styles.statLabel}>Total esta semana</Text>
                <Text style={styles.bigStatValue}>18.4 kWh</Text>
              </View>

              <View style={styles.bigStatCard}>
                <Text style={styles.statLabel}>Ahorro logrado</Text>
                <Text style={styles.bigStatValue}>↓ 14%</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Sesiones de esta semana</Text>

            <HistoryItem title="Cálculo Diferencial" meta="Lun · 08:00 – 09:48" value="0.53 kWh" />
            <HistoryItem title="Lab. Cómputo" meta="Mar · 10:00 – 11:55" value="1.02 kWh" />
            <HistoryItem title="Multimedia" meta="Jue · 12:00 – 13:50" value="0.67 kWh" />
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TabButton label="Inicio" active={tab === 'inicio'} onPress={() => setTab('inicio')} />
        <TabButton label="Salones" active={tab === 'salones'} onPress={() => setTab('salones')} />
        <TabButton label="Historial" active={tab === 'historial'} onPress={() => setTab('historial')} />
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar salón</Text>
            <Text style={styles.modalSub}>¿Deseas reservar este salón?</Text>

            <Text style={styles.modalRoom}>{selectedRoom?.id}</Text>
            <Text style={styles.modalRoomName}>{selectedRoom?.name}</Text>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.confirmText}>Confirmar reserva</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#07111f'},
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {fontWeight: '900', color: '#052e16'},
  appbarName: {color: '#ffffff', fontWeight: '900', fontSize: 16},
  appbarRole: {color: '#94a3b8', marginTop: 2},
  logoutText: {color: '#f87171', fontWeight: '800'},
  scroll: {flex: 1, padding: 18},
  sectionLabel: {
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  scheduleCard: {
    backgroundColor: '#102a43',
    padding: 20,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  eyebrow: {color: '#93c5fd', fontWeight: '800', marginBottom: 8},
  roomTitle: {color: '#ffffff', fontSize: 42, fontWeight: '900'},
  subject: {color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginTop: 4},
  meta: {color: '#94a3b8', marginTop: 6},
  lightPill: {
    backgroundColor: '#1e293b',
    borderRadius: 99,
    padding: 12,
    marginBottom: 12,
  },
  lightPillOn: {backgroundColor: '#064e3b'},
  lightText: {color: '#cbd5e1', fontWeight: '800', textAlign: 'center'},
  lightTextOn: {color: '#bbf7d0'},
  lightButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  lightButtonOff: {backgroundColor: '#ef4444'},
  lightButtonText: {color: '#ffffff', fontWeight: '900', fontSize: 16},
  sessionCard: {
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  timer: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  timerSub: {color: '#94a3b8', textAlign: 'center', marginBottom: 16},
  pageTitle: {color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 10},
  pageSub: {color: '#94a3b8', marginTop: 4, marginBottom: 18},
  roomCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomCode: {color: '#ffffff', fontWeight: '900', fontSize: 18},
  roomName: {color: '#e2e8f0', fontWeight: '700', marginTop: 4},
  roomCap: {color: '#94a3b8', marginTop: 3},
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '900',
    overflow: 'hidden',
  },
  freeChip: {backgroundColor: '#064e3b', color: '#bbf7d0'},
  busyChip: {backgroundColor: '#3f1d1d', color: '#fecaca'},
  statsRow: {flexDirection: 'row', gap: 10, marginTop: 18},
  statLabel: {color: '#94a3b8', fontSize: 12, marginTop: 4},
  bigStatCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  bigStatValue: {color: '#ffffff', fontSize: 21, fontWeight: '900', marginTop: 8},
  bottomNav: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#07111f',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {color: '#0f172a', fontWeight: '900', fontSize: 22},
  modalSub: {color: '#64748b', marginTop: 6},
  modalRoom: {color: '#16a34a', fontSize: 42, fontWeight: '900', marginTop: 18},
  modalRoomName: {color: '#334155', fontWeight: '800', marginBottom: 22},
  modalButtons: {flexDirection: 'row', gap: 10},
  cancelButton: {padding: 14, borderRadius: 14, backgroundColor: '#e2e8f0'},
  confirmButton: {padding: 14, borderRadius: 14, backgroundColor: '#16a34a'},
  cancelText: {color: '#334155', fontWeight: '800'},
  confirmText: {color: '#ffffff', fontWeight: '900'},
});