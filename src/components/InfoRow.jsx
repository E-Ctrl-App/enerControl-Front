import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function InfoRow({label, value}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 12,
  },

  label: {
    color: '#94a3b8',
  },

  value: {
    color: '#bbf7d0',
    fontWeight: '800',
  },
});