import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';

export default function TabButton({label, active, onPress}) {
  return (
    <Pressable
      style={[styles.button, active && styles.active]}
      onPress={onPress}>
      <Text style={[styles.text, active && styles.activeText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },

  active: {
    backgroundColor: '#16a34a',
  },

  text: {
    color: '#94a3b8',
    fontWeight: '800',
  },

  activeText: {
    color: '#ffffff',
  },
});