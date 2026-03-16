// src/services/WiFiService.js
// TCP socket connections to ESP32 devices over WiFi
// In production: install react-native-tcp-socket
// npm install react-native-tcp-socket
// Then replace MockTCPSocket with: import TcpSocket from 'react-native-tcp-socket';

// ─── DEVICE CONFIGURATION ────────────────────────────────────────────────────
// Update these IPs to match your ESP32s on your local network
export const DEVICE_CONFIG = {
  home: {
    ip: '192.168.1.56', // <-- Change to your Smart Home ESP32 IP
    port: 12346,
    name: 'Smart Home',
  },
  health: {
    ip: '192.168.43.100', // <-- Change to your Health Band ESP32 IP
    port: 12347,
    name: 'Health Band',
  },
  car: {
    ip: '192.168.43.200', // <-- Change to your Car OBD ESP32 IP
    port: 12348,
    name: 'Car Monitor',
  },
};

// ─── MOCK TCP SOCKET ──────────────────────────────────────────────────────────
// Replace this class with real TcpSocket from react-native-tcp-socket
// Real usage:
//   const socket = TcpSocket.createConnection({ port, host }, () => { ... });
//   socket.on('data', (data) => { ... });
//   socket.write('command\n');
//   socket.destroy();
class MockTCPSocket {
  constructor(deviceKey) {
    this.deviceKey = deviceKey;
    this.connected = false;
    this._dataCallback = null;
  }

  connect(port, host, callback) {
    setTimeout(() => {
      this.connected = true; // In demo always connects; real TCP will call back with error on failure
      callback(null);
    }, 800 + Math.random() * 600);
  }

  write(data, callback) {
    if (!this.connected) {
      callback && callback(new Error('Not connected'));
      return;
    }
    // Real socket: this.socket.write(data)
    console.log(`[TCP → ${this.deviceKey}]`, data.trim());
    callback && callback(null);
  }

  // Register callback for incoming data from ESP32
  onData(callback) {
    this._dataCallback = callback;
  }

  destroy() {
    this.connected = false;
  }
}

// ─── CONNECTION STATE ─────────────────────────────────────────────────────────
const connections = {};
const status = { home: false, health: false, car: false };

// ─── CONNECT TO DEVICE ────────────────────────────────────────────────────────
export const connectToDevice = (deviceKey) => {
  const config = DEVICE_CONFIG[deviceKey];
  if (!config) return Promise.reject(new Error(`Unknown device: ${deviceKey}`));

  return new Promise((resolve, reject) => {
    const socket = new MockTCPSocket(deviceKey);
    socket.connect(config.port, config.ip, (err) => {
      if (err) {
        status[deviceKey] = false;
        reject(err);
        return;
      }
      connections[deviceKey] = socket;
      status[deviceKey] = true;
      console.log(
        `[WiFi] Connected to ${config.name} at ${config.ip}:${config.port}`,
      );
      resolve(true);
    });
  });
};

// ─── SEND COMMAND ─────────────────────────────────────────────────────────────
// Sends a text command to the ESP32 (e.g. "light_on\n")
// ESP32 reads this with: String cmd = client.readStringUntil('\n');
export const sendCommand = (deviceKey, command) => {
  const socket = connections[deviceKey];
  if (!socket || !socket.connected) {
    return Promise.reject(
      new Error(
        `${DEVICE_CONFIG[deviceKey]?.name || deviceKey} is not connected`,
      ),
    );
  }
  return new Promise((resolve, reject) => {
    socket.write(command + '\n', (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
};

// ─── REQUEST HEALTH DATA ──────────────────────────────────────────────────────
// Sends "HEALTH\n" to ESP32; ESP32 replies with JSON or CSV
// Real implementation: listen on socket.onData() for the response
export const requestHealthData = async () => {
  try {
    await sendCommand('health', 'HEALTH');
    // TODO: In production, wait for socket.onData() response and parse it
    // Simulated response (replace with actual parsed ESP32 response):
    return {
      heartRate: Math.floor(65 + Math.random() * 30),
      bloodOxygen: Math.floor(95 + Math.random() * 5),
      steps: Math.floor(3000 + Math.random() * 7000),
      temperature: parseFloat((36.5 + Math.random() * 1.5).toFixed(1)),
      calories: Math.floor(200 + Math.random() * 300),
    };
  } catch (e) {
    throw new Error('Health data request failed: ' + e.message);
  }
};

// ─── REQUEST CAR DATA ─────────────────────────────────────────────────────────
// Sends "STATUS\n" to OBD ESP32; ESP32 replies with sensor readings
export const requestCarData = async () => {
  try {
    await sendCommand('car', 'STATUS');
    // TODO: In production, wait for socket.onData() response and parse it
    return {
      speed: Math.floor(Math.random() * 120),
      rpm: Math.floor(800 + Math.random() * 3000),
      engineTemp: Math.floor(80 + Math.random() * 40),
      fuelLevel: Math.floor(20 + Math.random() * 80),
      batteryVoltage: parseFloat((12 + Math.random() * 2).toFixed(1)),
      engineStatus: Math.random() > 0.1 ? 'OK' : 'CHECK',
      oilPressure: Math.random() > 0.1 ? 'Normal' : 'Low',
      tirePressure: {
        fl: Math.floor(30 + Math.random() * 5),
        fr: Math.floor(30 + Math.random() * 5),
        rl: Math.floor(29 + Math.random() * 5),
        rr: Math.floor(30 + Math.random() * 5),
      },
    };
  } catch (e) {
    throw new Error('Car data request failed: ' + e.message);
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const getConnectionStatus = () => ({ ...status });

export const disconnectDevice = (deviceKey) => {
  connections[deviceKey]?.destroy();
  connections[deviceKey] = null;
  status[deviceKey] = false;
};

export const disconnectAll = () => {
  Object.keys(connections).forEach(disconnectDevice);
};
