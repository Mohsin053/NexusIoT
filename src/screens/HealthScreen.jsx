// src/screens/HealthScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { useHealthData } from '../hooks/useHealthData';

// ── Vitals stat box ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, unit, color, note }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '35' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {note ? <Text style={[styles.statNote, { color }]}>{note}</Text> : null}
    </View>
  );
}

// ── Mini bar chart ───────────────────────────────────────────────────────────
function MiniChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <View style={styles.chart}>
      {data.map((v, i) => (
        <View key={i} style={styles.chartBarWrap}>
          <View
            style={[
              styles.chartBar,
              {
                height: (v / max) * 44 + 6,
                backgroundColor: color,
                opacity: 0.35 + (i / data.length) * 0.65,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function HealthScreen() {
  const {
    vitals,
    hrHistory,
    loading,
    error,
    fetch,
    autoRefresh,
    setAutoRefresh,
  } = useHealthData();

  React.useEffect(() => {
    if (error)
      Alert.alert(
        'Health Band',
        'Could not get data.\nMake sure the device is connected.',
      );
  }, [error]);

  const hrZone =
    vitals.heartRate < 60
      ? { label: 'RESTING', color: COLORS.cyan }
      : vitals.heartRate < 100
      ? { label: 'NORMAL', color: COLORS.green }
      : vitals.heartRate < 140
      ? { label: 'ACTIVE', color: COLORS.yellow }
      : { label: 'HIGH', color: COLORS.red };

  const insight =
    vitals.heartRate > 120
      ? {
          text: 'Heart rate elevated — take a rest.',
          color: COLORS.red,
          icon: '⚠️',
        }
      : vitals.bloodOxygen < 95
      ? { text: 'Low SpO₂ — breathe deeply.', color: COLORS.orange, icon: '🫁' }
      : vitals.temperature > 37.8
      ? { text: 'Slight fever detected.', color: COLORS.orange, icon: '🌡️' }
      : vitals.steps < 3000
      ? {
          text: 'Low step count — try a short walk!',
          color: COLORS.yellow,
          icon: '🚶',
        }
      : {
          text: 'All vitals look normal. Keep it up!',
          color: COLORS.green,
          icon: '✅',
        };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💓</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: COLORS.orange }]}>
            Health Band
          </Text>
          <Text style={styles.headerSub}>Real-time vitals</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.autoBtn,
            autoRefresh && {
              borderColor: COLORS.orange,
              backgroundColor: COLORS.orange + '15',
            },
          ]}
          onPress={() => setAutoRefresh((v) => !v)}
        >
          <Text
            style={[
              styles.autoBtnText,
              { color: autoRefresh ? COLORS.orange : COLORS.textMuted },
            ]}
          >
            {autoRefresh ? '⏸ AUTO' : '▶ AUTO'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Heart rate */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>HEART RATE</Text>
        <View style={styles.hrRow}>
          <Text style={styles.bpmLarge}>{vitals.heartRate}</Text>
          <View>
            <Text style={styles.bpmUnit}>BPM</Text>
            <View
              style={[
                styles.zonePill,
                {
                  borderColor: hrZone.color,
                  backgroundColor: hrZone.color + '20',
                },
              ]}
            >
              <Text style={[styles.zoneText, { color: hrZone.color }]}>
                {hrZone.label}
              </Text>
            </View>
          </View>
        </View>
        <MiniChart data={hrHistory} color={COLORS.orange} />
        <Text style={styles.chartNote}>Last {hrHistory.length} readings</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🫧"
          label="Blood O₂"
          value={vitals.bloodOxygen}
          unit="%"
          color={COLORS.cyan}
          note={vitals.bloodOxygen < 95 ? '⚠ Low' : '✓ Normal'}
        />
        <StatCard
          icon="👟"
          label="Steps"
          value={vitals.steps.toLocaleString()}
          unit="/ 10k"
          color={COLORS.green}
        />
        <StatCard
          icon="🌡️"
          label="Temp"
          value={vitals.temperature}
          unit="°C"
          color={vitals.temperature > 37.8 ? COLORS.red : COLORS.green}
          note={vitals.temperature > 37.8 ? '⚠ Fever' : '✓ Normal'}
        />
        <StatCard
          icon="🔥"
          label="Calories"
          value={vitals.calories}
          unit="kcal"
          color={COLORS.purple}
        />
      </View>

      {/* Insight */}
      <View
        style={[
          styles.card,
          {
            borderColor: insight.color + '40',
            backgroundColor: insight.color + '08',
          },
        ]}
      >
        <Text style={styles.cardLabel}>HEALTH INSIGHT</Text>
        <View style={styles.insightRow}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          <Text style={[styles.insightText, { color: insight.color }]}>
            {insight.text}
          </Text>
        </View>
      </View>

      {/* Sync */}
      <TouchableOpacity
        style={[styles.syncBtn, loading && { opacity: 0.6 }]}
        onPress={fetch}
        disabled={loading}
      >
        <Text style={styles.syncBtnText}>
          {loading ? '⟳ Fetching…' : '⟳ Sync Health Data'}
        </Text>
      </TouchableOpacity>

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
  autoBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  autoBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cardLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  hrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  bpmLarge: {
    color: COLORS.orange,
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 74,
  },
  bpmUnit: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 6,
  },
  zonePill: {
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  zoneText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 4 },
  chartBarWrap: { flex: 1 },
  chartBar: { borderRadius: 3 },
  chartNote: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: SPACING.md,
    marginBottom: 12,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: '900' },
  statUnit: { color: COLORS.textMuted, fontSize: 11 },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statNote: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightIcon: { fontSize: 26 },
  insightText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  syncBtn: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.orange + '18',
    borderWidth: 1,
    borderColor: COLORS.orange + '60',
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  syncBtnText: { color: COLORS.orange, fontWeight: '800', letterSpacing: 1 },
});
