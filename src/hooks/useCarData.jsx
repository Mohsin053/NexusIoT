// src/hooks/useCarData.js
// Encapsulates OBD data fetching for CarScreen.
//
// Example:
//   const { data, loading, error, sync } = useCarData();

import { useState, useCallback } from 'react';
import { requestCarData } from '../services/WiFiService';

const DEFAULT_DATA = {
  speed: 0,
  rpm: 850,
  engineTemp: 89,
  fuelLevel: 64,
  batteryVoltage: 12.6,
  engineStatus: 'OK',
  oilPressure: 'Normal',
  tirePressure: { fl: 32, fr: 33, rl: 31, rr: 32 },
};

export function useCarData() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sync = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await requestCarData();
      setData(fresh);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, sync };
}
