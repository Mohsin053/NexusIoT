// src/hooks/useHealthData.js
// Encapsulates health data fetching + auto-refresh logic.
// Use this hook in HealthScreen (or anywhere else you need vitals).
//
// Example:
//   const { vitals, loading, hrHistory, fetch, autoRefresh, setAutoRefresh } = useHealthData();

import { useState, useEffect, useRef, useCallback } from 'react';
import { requestHealthData } from '../services/WiFiService';

const DEFAULT_VITALS = {
  heartRate: 72,
  bloodOxygen: 98,
  steps: 5280,
  temperature: 37.1,
  calories: 342,
};

export function useHealthData() {
  const [vitals, setVitals] = useState(DEFAULT_VITALS);
  const [hrHistory, setHrHistory] = useState([70, 74, 72, 68, 75, 73, 72]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestHealthData();
      setVitals(data);
      setHrHistory((prev) => [...prev.slice(-6), data.heartRate]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetch, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, fetch]);

  return {
    vitals,
    hrHistory,
    loading,
    error,
    fetch,
    autoRefresh,
    setAutoRefresh,
  };
}
