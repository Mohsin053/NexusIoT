// src/components/SectionCard.js
// Standard card container with an optional title label.
// Keeps padding/border/radius consistent across all screens.
//
// Props:
//   label       string (optional)  upper-case section title
//   children    ReactNode
//   style       ViewStyle (optional) extra styles on the card
//   accentColor string (optional)  tints the border when provided

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

export function SectionCard({ label, children, style, accentColor }) {
  return (
    <View
      style={[
        styles.card,
        accentColor && { borderColor: accentColor + '40' },
        style,
      ]}
    >
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
});
