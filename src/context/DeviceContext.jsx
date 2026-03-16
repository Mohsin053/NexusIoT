// src/context/DeviceContext.js
// Global connection state — wraps the whole app so any screen can check
// whether a device is online without prop-drilling.
//
// Usage in any screen:
//   import { useDevices } from '../context/DeviceContext';
//   const { status, connect, disconnect } = useDevices();

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  connectToDevice,
  disconnectDevice,
  getConnectionStatus,
} from '../services/WiFiService';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [status, setStatus] = useState({
    home: false,
    health: false,
    car: false,
  });

  // Connect one device and update global status
  const connect = useCallback(async (deviceKey) => {
    try {
      await connectToDevice(deviceKey);
      setStatus((prev) => ({ ...prev, [deviceKey]: true }));
      return true;
    } catch (e) {
      setStatus((prev) => ({ ...prev, [deviceKey]: false }));
      throw e;
    }
  }, []);

  // Disconnect one device
  const disconnect = useCallback((deviceKey) => {
    disconnectDevice(deviceKey);
    setStatus((prev) => ({ ...prev, [deviceKey]: false }));
  }, []);

  // Try to connect all devices (called on app start / pull-to-refresh)
  const connectAll = useCallback(async () => {
    const keys = ['home', 'health', 'car'];
    const results = {};
    await Promise.allSettled(
      keys.map(async (key) => {
        try {
          await connectToDevice(key);
          results[key] = true;
        } catch {
          results[key] = false;
        }
      }),
    );
    setStatus((prev) => ({ ...prev, ...results }));
  }, []);

  const connectedCount = Object.values(status).filter(Boolean).length;

  return (
    <DeviceContext.Provider
      value={{ status, connect, disconnect, connectAll, connectedCount }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevices must be used inside <DeviceProvider>');
  return ctx;
}
