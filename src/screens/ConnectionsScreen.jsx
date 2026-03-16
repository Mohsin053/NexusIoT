// src/screens/ConnectionsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { useDevices } from '../context/DeviceContext';
import { DEVICE_CONFIG } from '../services/WiFiService';
import { scanForDevices } from '../services/BluetoothService';

const DEVICES = [
  {
    key: 'home',
    label: 'Smart Home',
    icon: '🏠',
    color: COLORS.green,
    bleName: 'SMART_HOME',
  },
  {
    key: 'health',
    label: 'Health Band',
    icon: '💓',
    color: COLORS.orange,
    bleName: 'HEALTH_BAND',
  },
  {
    key: 'car',
    label: 'Car Monitor',
    icon: '🚗',
    color: COLORS.purple,
    bleName: 'CAR_OBD',
  },
];

// ── Per-device card ──────────────────────────────────────────────────────────
function DeviceCard({ device }) {
  const { status, connect, disconnect } = useDevices();
  const [ip, setIp] = useState(DEVICE_CONFIG[device.key]?.ip || '');
  const [port, setPort] = useState(
    String(DEVICE_CONFIG[device.key]?.port || ''),
  );
  const [busy, setBusy] = useState(false);
  const [useBLE, setUseBLE] = useState(false);

  const online = status[device.key];

  const handleConnect = async () => {
    setBusy(true);
    try {
      await connect(device.key);
    } catch {
      Alert.alert(
        'Connection Failed',
        `Could not connect to ${device.label}.\n\nCheck:\n• Same WiFi network?\n• IP: ${ip}\n• Port: ${port}\n• ESP32 TCP server running?`,
      );
    }
    setBusy(false);
  };

  const handleDisconnect = () => disconnect(device.key);

  return (
    <View
      style={[
        styles.deviceCard,
        online && { borderColor: device.color + '50' },
      ]}
    >
      {/* Card header */}
      <View style={styles.deviceCardHeader}>
        <View
          style={[
            styles.deviceIconBox,
            {
              backgroundColor: device.color + '18',
              borderColor: device.color + '30',
            },
          ]}
        >
          <Text style={{ fontSize: 22 }}>{device.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.deviceName, { color: device.color }]}>
            {device.label}
          </Text>
          <Text
            style={[
              styles.deviceStatus,
              {
                color: online
                  ? COLORS.green
                  : busy
                  ? COLORS.yellow
                  : COLORS.textMuted,
              },
            ]}
          >
            {online ? '● CONNECTED' : busy ? '⟳ CONNECTING' : '○ OFFLINE'}
          </Text>
        </View>
        <View style={styles.bleToggleRow}>
          <Text style={styles.bleToggleLabel}>BLE</Text>
          <Switch
            value={useBLE}
            onValueChange={setUseBLE}
            thumbColor={useBLE ? device.color : COLORS.textMuted}
            trackColor={{ false: COLORS.bgElevated, true: device.color + '40' }}
          />
        </View>
      </View>

      {!useBLE ? (
        /* WiFi config */
        <>
          <View style={styles.inputRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.inputLabel}>IP Address</Text>
              <TextInput
                style={styles.input}
                value={ip}
                onChangeText={setIp}
                placeholder="192.168.1.x"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                editable={!online}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Port</Text>
              <TextInput
                style={styles.input}
                value={port}
                onChangeText={setPort}
                placeholder="12345"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                editable={!online}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                borderColor: online ? COLORS.red : device.color,
                backgroundColor: online
                  ? COLORS.red + '15'
                  : device.color + '15',
              },
            ]}
            onPress={online ? handleDisconnect : handleConnect}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color={device.color} />
            ) : (
              <Text
                style={[
                  styles.actionBtnText,
                  { color: online ? COLORS.red : device.color },
                ]}
              >
                {online ? '⏹ DISCONNECT' : '▶ CONNECT (WiFi)'}
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        /* BLE config */
        <>
          <Text style={styles.bleHint}>
            Looking for:{' '}
            <Text style={{ color: device.color, fontWeight: '700' }}>
              {device.bleName}
            </Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                borderColor: device.color,
                backgroundColor: device.color + '15',
              },
            ]}
            onPress={() =>
              Alert.alert(
                'BLE',
                `Make sure ${device.bleName} is advertising.\nUse the BLE Scanner below to find and pair it.`,
              )
            }
          >
            <Text style={[styles.actionBtnText, { color: device.color }]}>
              🔵 SCAN & CONNECT (BLE)
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function ConnectionsScreen() {
  const [scanning, setScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);

  const startScan = () => {
    setScanning(true);
    setFoundDevices([]);
    scanForDevices(
      (device) => setFoundDevices((prev) => [...prev, device]),
      () => setScanning(false),
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔗 Connections</Text>
        <Text style={styles.headerSub}>
          Pair your IoT devices via WiFi or Bluetooth
        </Text>
      </View>

      {/* Setup guide */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>📡 Quick Setup</Text>
        <Text style={styles.guideText}>
          {
            'WiFi: Connect phone & ESP32 to the same network → find ESP32 IP from your router → enter below → tap Connect.\n\nBLE: Toggle to BLE mode → press Scan & Connect.'
          }
        </Text>
      </View>

      {/* Device cards */}
      {DEVICES.map((d) => (
        <DeviceCard key={d.key} device={d} />
      ))}

      {/* BLE Scanner */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>BLE SCANNER</Text>
        <TouchableOpacity
          style={[styles.scanBtn, scanning && { opacity: 0.6 }]}
          onPress={startScan}
          disabled={scanning}
        >
          {scanning && (
            <ActivityIndicator
              size="small"
              color={COLORS.cyan}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={styles.scanBtnText}>
            {scanning ? 'SCANNING…' : '🔍 SCAN FOR BLE DEVICES'}
          </Text>
        </TouchableOpacity>
        {scanning && foundDevices.length === 0 && (
          <Text style={styles.scanHint}>Looking for nearby BLE devices…</Text>
        )}
        {foundDevices.map((d, i) => (
          <View key={i} style={styles.bleDevice}>
            <View>
              <Text style={styles.bleName}>{d.name || 'Unknown Device'}</Text>
              <Text style={styles.bleId}>{d.id}</Text>
            </View>
            <View style={styles.bleRight}>
              <Text style={styles.bleRssi}>{d.rssi} dBm</Text>
              <TouchableOpacity
                style={styles.pairBtn}
                onPress={() =>
                  Alert.alert('BLE', `Pairing with ${d.name || d.id}…`)
                }
              >
                <Text style={styles.pairBtnText}>PAIR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* ESP32 code snippet */}
      <View style={[styles.guideCard, { marginBottom: 30 }]}>
        <Text style={styles.guideTitle}>⚡ ESP32 TCP Server (Arduino)</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code}>{`#include <WiFi.h>
WiFiServer server(12346);

void loop() {
  WiFiClient client = server.available();
  if (client && client.connected()) {
    String cmd = client.readStringUntil('\\n');
    cmd.trim();
    if (cmd == "light_on")  digitalWrite(LED, HIGH);
    if (cmd == "light_off") digitalWrite(LED, LOW);
    if (cmd == "fan_on")    digitalWrite(FAN, HIGH);
    if (cmd == "fan_off")   digitalWrite(FAN, LOW);
    client.println("OK");
  }
}`}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: SPACING.md },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  guideCard: {
    marginHorizontal: SPACING.md,
    marginBottom: 12,
    backgroundColor: COLORS.cyan + '08',
    borderWidth: 1,
    borderColor: COLORS.cyan + '30',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  guideTitle: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  guideText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  deviceCard: {
    marginHorizontal: SPACING.md,
    marginBottom: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  deviceIconBox: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: { fontSize: 16, fontWeight: '800' },
  deviceStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 3,
  },
  bleToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bleToggleLabel: { color: COLORS.textMuted, fontSize: 11 },
  inputRow: { flexDirection: 'row', marginBottom: 10 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: { fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  bleHint: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 10 },
  section: { paddingHorizontal: SPACING.md, marginBottom: 12 },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  scanBtn: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.cyan + '15',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scanBtnText: { color: COLORS.cyan, fontWeight: '800', letterSpacing: 0.5 },
  scanHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  bleDevice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 6,
  },
  bleName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  bleId: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  bleRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bleRssi: { color: COLORS.textSecondary, fontSize: 12 },
  pairBtn: {
    backgroundColor: COLORS.cyan + '20',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pairBtnText: { color: COLORS.cyan, fontSize: 12, fontWeight: '700' },
  codeBlock: {
    backgroundColor: '#000',
    borderRadius: RADIUS.sm,
    padding: 12,
    marginTop: 4,
  },
  code: {
    color: '#00FF44',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
