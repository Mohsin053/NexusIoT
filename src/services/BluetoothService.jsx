// src/services/BluetoothService.js
// BLE connections to ESP32 devices
// In production: install react-native-ble-plx
// npm install react-native-ble-plx
// Then replace MockBLEManager with: import { BleManager } from 'react-native-ble-plx';

// ─── BLE UUID CONFIG ──────────────────────────────────────────────────────────
// These UUIDs must match what you've programmed on each ESP32
export const BLE_CONFIG = {
  home: {
    serviceUUID: '87654321-4321-4321-4321-CBA987654321',
    writeUUID: '87654321-4321-4321-4321-CBA987654322', // App → ESP32
    notifyUUID: '87654321-4321-4321-4321-CBA987654323', // ESP32 → App
    deviceName: 'SMART_HOME',
  },
  health: {
    serviceUUID: 'ABCDEF01-1234-5678-ABCD-EF0123456789',
    writeUUID: 'ABCDEF01-1234-5678-ABCD-EF012345678A',
    notifyUUID: 'ABCDEF01-1234-5678-ABCD-EF012345678B',
    deviceName: 'HEALTH_BAND',
  },
  car: {
    serviceUUID: 'FEDCBA09-9876-5432-FEDC-BA0987654321',
    writeUUID: 'FEDCBA09-9876-5432-FEDC-BA0987654322',
    notifyUUID: 'FEDCBA09-9876-5432-FEDC-BA0987654323',
    deviceName: 'CAR_OBD',
  },
};

// ─── MOCK BLE MANAGER ─────────────────────────────────────────────────────────
// Replace with: const bleManager = new BleManager();
class MockBLEManager {
  constructor() {
    this._connectedDevices = {};
    this._scanning = false;
  }

  state() {
    return Promise.resolve('PoweredOn');
  }

  // Real usage: bleManager.startDeviceScan(null, null, (error, device) => { ... });
  startDeviceScan(uuids, options, callback) {
    this._scanning = true;
    const mockDevices = [
      { id: 'AA:BB:CC:11:22:33', name: 'SMART_HOME', rssi: -62 },
      { id: 'DD:EE:FF:44:55:66', name: 'HEALTH_BAND', rssi: -55 },
      { id: '77:88:99:AA:BB:CC', name: 'CAR_OBD', rssi: -78 },
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (!this._scanning || i >= mockDevices.length) {
        clearInterval(tick);
        return;
      }
      callback(null, mockDevices[i++]);
    }, 600);
  }

  stopDeviceScan() {
    this._scanning = false;
  }

  connectToDevice(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._connectedDevices[id] = { id, connected: true };
        resolve(this._connectedDevices[id]);
      }, 1000);
    });
  }

  discoverAllServicesAndCharacteristicsForDevice(id) {
    return Promise.resolve(this._connectedDevices[id]);
  }

  // Real usage: bleManager.writeCharacteristicWithResponseForDevice(id, svcUUID, charUUID, base64Value)
  writeCharacteristicWithResponseForDevice(id, svcUUID, charUUID, b64Value) {
    const decoded = Buffer.from(b64Value, 'base64').toString();
    console.log(`[BLE → ${id}]`, decoded.trim());
    return Promise.resolve();
  }

  // Real usage: subscribe to incoming notifications from ESP32
  monitorCharacteristicForDevice(id, svcUUID, charUUID, callback) {
    const timer = setInterval(() => {
      if (!this._connectedDevices[id]) {
        clearInterval(timer);
        return;
      }
      callback(null, { value: Buffer.from('OK\n').toString('base64') });
    }, 5000);
    return { remove: () => clearInterval(timer) };
  }

  cancelDeviceConnection(id) {
    delete this._connectedDevices[id];
    return Promise.resolve();
  }

  isDeviceConnected(id) {
    return Promise.resolve(!!this._connectedDevices[id]);
  }
}

const bleManager = new MockBLEManager();
const connectedDevices = {}; // { deviceKey: { deviceId, subscription } }

// ─── SCAN FOR DEVICES ─────────────────────────────────────────────────────────
export const scanForDevices = (onFound, onDone) => {
  const found = [];
  bleManager.startDeviceScan(null, null, (err, device) => {
    if (err || !device?.name) return;
    if (!found.find((d) => d.id === device.id)) {
      found.push(device);
      onFound && onFound(device);
    }
  });
  setTimeout(() => {
    bleManager.stopDeviceScan();
    onDone && onDone(found);
  }, 10000);
};

// ─── CONNECT TO BLE DEVICE ────────────────────────────────────────────────────
export const connectBLE = async (deviceKey, deviceId) => {
  const cfg = BLE_CONFIG[deviceKey];
  if (!cfg) throw new Error(`No BLE config for: ${deviceKey}`);

  const device = await bleManager.connectToDevice(deviceId);
  await bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId);

  // Subscribe to notifications (data coming FROM the ESP32)
  const sub = bleManager.monitorCharacteristicForDevice(
    deviceId,
    cfg.serviceUUID,
    cfg.notifyUUID,
    (err, char) => {
      if (!err && char?.value) {
        const msg = Buffer.from(char.value, 'base64').toString('utf8');
        console.log(`[BLE ← ${deviceKey}]`, msg.trim());
      }
    },
  );

  connectedDevices[deviceKey] = { deviceId, subscription: sub };
  return true;
};

// ─── SEND BLE COMMAND ─────────────────────────────────────────────────────────
export const sendBLECommand = async (deviceKey, command) => {
  const conn = connectedDevices[deviceKey];
  if (!conn) throw new Error(`${deviceKey} not connected via BLE`);

  const cfg = BLE_CONFIG[deviceKey];
  const b64 = Buffer.from(command + '\n').toString('base64');
  await bleManager.writeCharacteristicWithResponseForDevice(
    conn.deviceId,
    cfg.serviceUUID,
    cfg.writeUUID,
    b64,
  );
};

// ─── DISCONNECT ───────────────────────────────────────────────────────────────
export const disconnectBLE = async (deviceKey) => {
  const conn = connectedDevices[deviceKey];
  if (conn) {
    conn.subscription?.remove();
    await bleManager.cancelDeviceConnection(conn.deviceId);
    delete connectedDevices[deviceKey];
  }
};

export const getBLEState = () => bleManager.state();
export const isBLEConnected = (deviceKey) => {
  const conn = connectedDevices[deviceKey];
  return conn
    ? bleManager.isDeviceConnected(conn.deviceId)
    : Promise.resolve(false);
};
