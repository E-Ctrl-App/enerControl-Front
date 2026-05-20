import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function ClassItem({title, meta}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{meta}</Text>
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
});