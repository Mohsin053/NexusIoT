// src/screens/SmartHomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { useSmartHome, APPLIANCES, SCENES } from '../hooks/useSmartHome';

// ── Appliance toggle card ────────────────────────────────────────────────────
function ApplianceCard({ appliance, active, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.card, active && { borderColor: COLORS.green + '60' }]}
      onPress={() => onToggle(appliance)}
      activeOpacity={0.8}
    >
      {active && <View style={styles.cardGlow} />}
      <View
        style={[
          styles.iconBox,
          active
            ? {
                backgroundColor: COLORS.green + '20',
                borderColor: COLORS.green + '40',
              }
            : {
                backgroundColor: COLORS.bgElevated,
                borderColor: COLORS.border,
              },
        ]}
      >
        <Text style={styles.cardIcon}>{appliance.icon}</Text>
      </View>
      <Text
        style={[
          styles.cardLabel,
          { color: active ? COLORS.textPrimary : COLORS.textSecondary },
        ]}
      >
        {appliance.label}
      </Text>
      <Text style={styles.cardRoom}>{appliance.room}</Text>
      <View
        style={[
          styles.chip,
          { backgroundColor: active ? COLORS.green + '20' : COLORS.bgElevated },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: active ? COLORS.green : COLORS.textMuted },
          ]}
        >
          {active ? appliance.labelOn || 'ON' : appliance.labelOff || 'OFF'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function SmartHomeScreen() {
  const { states, toggle, runScene, activeCount, runningScene } =
    useSmartHome();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏠</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: COLORS.green }]}>
            Smart Home
          </Text>
          <Text style={styles.headerSub}>
            {activeCount} device{activeCount !== 1 ? 's' : ''} active
          </Text>
        </View>
      </View>

      {/* Scenes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SCENES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.scenesRow}>
            {SCENES.map((scene) => {
              const running = runningScene === scene.id;
              return (
                <TouchableOpacity
                  key={scene.id}
                  style={[
                    styles.sceneBtn,
                    running && {
                      borderColor: COLORS.green + '80',
                      backgroundColor: COLORS.green + '15',
                    },
                  ]}
                  onPress={() => runScene(scene)}
                  disabled={!!runningScene}
                >
                  <Text style={styles.sceneIcon}>{scene.icon}</Text>
                  <Text
                    style={[
                      styles.sceneLabel,
                      running && { color: COLORS.green },
                    ]}
                  >
                    {running ? 'Running…' : scene.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Appliances */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>APPLIANCES</Text>
        <View style={styles.grid}>
          {APPLIANCES.map((a) => (
            <ApplianceCard
              key={a.id}
              appliance={a}
              active={!!states[a.id]}
              onToggle={toggle}
            />
          ))}
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,

    gap: 10,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  scenesRow: { flexDirection: 'row', gap: 10, paddingRight: 16 },
  sceneBtn: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: 'center',
    minWidth: 110,
  },
  sceneIcon: { fontSize: 26, marginBottom: 6 },
  sceneLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47.5%',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: COLORS.green + '12',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardIcon: { fontSize: 20 },
  cardLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  cardRoom: { color: COLORS.textMuted, fontSize: 11, marginBottom: 8 },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});
