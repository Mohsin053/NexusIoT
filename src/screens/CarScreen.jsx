// src/screens/CarScreen.js
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
import { GaugeBar, StatusRow } from '../components';
import { useCarData } from '../hooks/useCarData';

// ── Tire pressure display ────────────────────────────────────────────────────
function TirePressure({ pressure }) {
  const tireColor = (p) =>
    p < 28 ? COLORS.red : p < 30 ? COLORS.yellow : COLORS.green;
  const tires = [
    { label: 'FL', val: pressure.fl },
    { label: 'FR', val: pressure.fr },
    { label: 'RL', val: pressure.rl },
    { label: 'RR', val: pressure.rr },
  ];
  return (
    <View style={styles.tireGrid}>
      {tires.map((t) => (
        <View
          key={t.label}
          style={[styles.tireBox, { borderColor: tireColor(t.val) }]}
        >
          <Text style={[styles.tirePsi, { color: tireColor(t.val) }]}>
            {t.val}
          </Text>
          <Text style={styles.tirePsiUnit}>PSI</Text>
          <Text style={styles.tireLabel}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function CarScreen() {
  const { data, loading, error, sync } = useCarData();

  React.useEffect(() => {
    if (error)
      Alert.alert(
        'Car OBD',
        'Could not get car data.\nMake sure the OBD module is connected.',
      );
  }, [error]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🚗</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: COLORS.purple }]}>
            Car Monitor
          </Text>
          <Text style={styles.headerSub}>OBD2 · Live Diagnostics</Text>
        </View>
        <TouchableOpacity
          style={[styles.syncBtn, loading && { opacity: 0.6 }]}
          onPress={sync}
          disabled={loading}
        >
          <Text style={styles.syncBtnText}>{loading ? '⟳' : '⟳ SYNC'}</Text>
        </TouchableOpacity>
      </View>

      {/* Performance */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>PERFORMANCE</Text>
        <GaugeBar
          label="Speed"
          value={data.speed}
          max={200}
          unit="km/h"
          color={COLORS.purple}
          danger={data.speed > 150}
        />
        <GaugeBar
          label="RPM"
          value={data.rpm}
          max={7000}
          unit="rpm"
          color={COLORS.cyan}
          danger={data.rpm > 5500}
        />
        <GaugeBar
          label="Fuel Level"
          value={data.fuelLevel}
          max={100}
          unit="%"
          color={COLORS.yellow}
          danger={data.fuelLevel < 15}
        />
        <GaugeBar
          label="Engine Temp"
          value={data.engineTemp}
          max={130}
          unit="°C"
          color={COLORS.orange}
          danger={data.engineTemp > 105}
        />
      </View>

      {/* System status */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>SYSTEM STATUS</Text>
        <StatusRow icon="⚙️" label="Engine" value={data.engineStatus} />
        <StatusRow icon="🛢️" label="Oil Pressure" value={data.oilPressure} />
        <StatusRow
          icon="🔋"
          label="Battery"
          value={`${data.batteryVoltage}V`}
        />
        <StatusRow
          icon="❄️"
          label="Coolant Temp"
          value={data.engineTemp > 105 ? 'High' : 'Normal'}
        />
      </View>

      {/* Tires */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>TIRE PRESSURE</Text>
        <TirePressure pressure={data.tirePressure} />
        <Text style={styles.tireLegend}>
          🟢 OK (30–35 PSI) 🟡 Low 🔴 Critical
        </Text>
      </View>

      {/* Maintenance */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <Text style={styles.cardLabel}>MAINTENANCE</Text>
        {[
          {
            item: 'Oil Change',
            due: 'Due in 2,300 km',
            icon: '🛢️',
            urgent: false,
          },
          {
            item: 'Tire Rotation',
            due: 'Overdue by 1,200 km',
            icon: '🔄',
            urgent: true,
          },
          {
            item: 'Air Filter',
            due: 'Due in 5,600 km',
            icon: '🌬️',
            urgent: false,
          },
          {
            item: 'Brake Pads',
            due: 'Replace soon (3mm remaining)',
            icon: '🛑',
            urgent: true,
          },
          {
            item: 'Battery',
            due: `${data.batteryVoltage}V — Good`,
            icon: '🔋',
            urgent: false,
          },
        ].map((m, i) => (
          <View
            key={i}
            style={[styles.maintRow, m.urgent && styles.maintUrgent]}
          >
            <Text style={styles.maintIcon}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.maintItem}>{m.item}</Text>
              <Text
                style={[styles.maintDue, m.urgent && { color: COLORS.red }]}
              >
                {m.due}
              </Text>
            </View>
            {m.urgent && <Text style={styles.overdueBadge}>OVERDUE</Text>}
          </View>
        ))}
      </View>
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
  syncBtn: {
    borderWidth: 1,
    borderColor: COLORS.purple + '60',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncBtnText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
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
    marginBottom: 14,
  },
  tireGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tireBox: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tirePsi: { fontSize: 20, fontWeight: '900' },
  tirePsiUnit: { color: COLORS.textMuted, fontSize: 9 },
  tireLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
  tireLegend: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  maintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgElevated,
    marginBottom: 8,
  },
  maintUrgent: {
    borderColor: COLORS.red + '40',
    backgroundColor: COLORS.red + '08',
  },
  maintIcon: { fontSize: 20 },
  maintItem: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  maintDue: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  overdueBadge: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
