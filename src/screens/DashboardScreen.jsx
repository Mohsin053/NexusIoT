// src/screens/DashboardScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { useDevices } from '../context/DeviceContext';
import { sendCommand } from '../services/WiFiService';

const DEVICES = [
  {
    key: 'home',
    label: 'Smart Home',
    icon: '🏠',
    color: COLORS.green,
    screen: 'SmartHome',
    desc: 'Lights · Fan · AC · Door',
  },
  {
    key: 'health',
    label: 'Health Band',
    icon: '💓',
    color: COLORS.orange,
    screen: 'Health',
    desc: 'Heart Rate · SpO₂ · Steps',
  },
  {
    key: 'car',
    label: 'Car Monitor',
    icon: '🚗',
    color: COLORS.purple,
    screen: 'Car',
    desc: 'Speed · RPM · Fuel · Tires',
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Lights ON',
    icon: '💡',
    color: COLORS.yellow,
    cmd: 'light_on',
    device: 'home',
  },
  {
    label: 'Lights OFF',
    icon: '🌑',
    color: COLORS.textSecondary,
    cmd: 'light_off',
    device: 'home',
  },
  {
    label: 'Fan ON',
    icon: '🌀',
    color: COLORS.cyan,
    cmd: 'fan_on',
    device: 'home',
  },
  {
    label: 'Fan OFF',
    icon: '⏹️',
    color: COLORS.textMuted,
    cmd: 'fan_off',
    device: 'home',
  },
];

export default function DashboardScreen({ navigation }) {
  const { status, connectAll, connectedCount } = useDevices();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    connectAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await connectAll();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.cyan}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>NEXUS IoT</Text>
          <Text style={styles.title}>Control Hub</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { borderColor: connectedCount > 0 ? COLORS.green : COLORS.red },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: connectedCount > 0 ? COLORS.green : COLORS.red,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: connectedCount > 0 ? COLORS.green : COLORS.red },
            ]}
          >
            {connectedCount}/3 Online
          </Text>
        </View>
      </View>

      {/* Device list */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DEVICES</Text>
        {DEVICES.map((device) => {
          const online = status[device.key];
          return (
            <TouchableOpacity
              key={device.key}
              style={[
                styles.deviceCard,
                online && { borderColor: device.color + '50' },
              ]}
              onPress={() => navigation.navigate(device.screen)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: device.color + '18',
                    borderColor: device.color + '30',
                  },
                ]}
              >
                <Text style={styles.deviceIcon}>{device.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.deviceName, { color: device.color }]}>
                  {device.label}
                </Text>
                <Text style={styles.deviceDesc}>{device.desc}</Text>
              </View>
              <View style={styles.deviceRight}>
                <View
                  style={[
                    styles.onlineDot,
                    {
                      backgroundColor: online ? COLORS.green : COLORS.textMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.onlineText,
                    { color: online ? COLORS.green : COLORS.textMuted },
                  ]}
                >
                  {online ? 'ONLINE' : 'OFFLINE'}
                </Text>
                <Text style={[styles.arrow, { color: device.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickBtn, { borderColor: a.color + '40' }]}
              onPress={async () => {
                try {
                  await sendCommand(a.device, a.cmd);
                  Alert.alert('✓ Done', `${a.label} executed`);
                } catch {
                  Alert.alert(
                    'Not Connected',
                    'Smart Home is offline.\nGo to Connect tab to pair it.',
                  );
                }
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.quickIcon}>{a.icon}</Text>
              <Text style={[styles.quickLabel, { color: a.color }]}>
                {a.label}
              </Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  brand: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: 10,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIcon: { fontSize: 24 },
  deviceName: { fontSize: 16, fontWeight: '700' },
  deviceDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  deviceRight: { alignItems: 'flex-end', gap: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, marginBottom: 1 },
  onlineText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  arrow: { fontSize: 22, fontWeight: '300', marginTop: 2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: { fontSize: 26 },
  quickLabel: { fontSize: 13, fontWeight: '700' },
});
