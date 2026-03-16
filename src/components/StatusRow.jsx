// src/components/StatusRow.js
// A single row showing icon | label | value | colored dot.
// Used in CarScreen system status, but reusable anywhere.
//
// Props:
//   icon    string   emoji
//   label   string   e.g. "Engine"
//   value   string   e.g. "OK" | "CHECK" | "Normal" | "Low"

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

const OK_VALUES = ['OK', 'Normal', 'Good', 'Online'];
const BAD_VALUES = ['CHECK', 'Low', 'High', 'Error', 'Offline'];

export function StatusRow({ icon, label, value }) {
  const color = OK_VALUES.includes(value)
    ? COLORS.green
    : BAD_VALUES.includes(value)
    ? COLORS.red
    : COLORS.textPrimary;

  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  icon: { fontSize: 18, width: 26, textAlign: 'center' },
  label: { flex: 1, color: COLORS.textSecondary, fontSize: 13 },
  value: { fontSize: 13, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
