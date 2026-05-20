import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function HistoryItem({title, meta, value}) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },

  meta: {
    color: '#94a3b8',
    marginTop: 4,
  },

  value: {
    color: '#86efac',
    fontWeight: '900',
  },
});