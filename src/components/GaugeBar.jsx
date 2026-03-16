// src/components/GaugeBar.js
// Horizontal progress bar used in CarScreen performance gauges.
// Also usable anywhere you want a labelled value + fill bar.
//
// Props:
//   label    string   e.g. "Speed"
//   value    number   current value
//   max      number   maximum value (bar fills to value/max)
//   unit     string   e.g. "km/h"
//   color    string   hex color for the fill
//   danger   bool     if true, bar turns COLORS.red

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

export function GaugeBar({ label, value, max, unit, color, danger }) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const barColor = danger ? COLORS.red : color;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: barColor }]}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: pct, backgroundColor: barColor }]} />
        <View style={{ flex: 1 - pct }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  value: { fontSize: 20, fontWeight: '900' },
  unit: { color: COLORS.textMuted, fontSize: 11 },
  track: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
  },
  fill: { borderRadius: 3 },
});
