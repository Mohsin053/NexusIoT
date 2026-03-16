// src/hooks/useSmartHome.js
// Manages local appliance on/off state and scene execution for SmartHomeScreen.
//
// Example:
//   const { states, toggle, runScene, activeCount, runningScene } = useSmartHome();

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { sendCommand } from '../services/WiFiService';

export const APPLIANCES = [
  {
    id: 'light',
    label: 'Living Room Light',
    icon: '💡',
    room: 'Living Room',
    cmdOn: 'light_on',
    cmdOff: 'light_off',
  },
  {
    id: 'fan',
    label: 'Ceiling Fan',
    icon: '🌀',
    room: 'Bedroom',
    cmdOn: 'fan_on',
    cmdOff: 'fan_off',
  },
  {
    id: 'ac',
    label: 'Air Conditioner',
    icon: '❄️',
    room: 'Living Room',
    cmdOn: 'ac_on',
    cmdOff: 'ac_off',
  },
  {
    id: 'tv',
    label: 'Smart TV',
    icon: '📺',
    room: 'Living Room',
    cmdOn: 'tv_on',
    cmdOff: 'tv_off',
  },
  {
    id: 'bedroom_light',
    label: 'Bedroom Light',
    icon: '🛏️',
    room: 'Bedroom',
    cmdOn: 'bedroom_light_on',
    cmdOff: 'bedroom_light_off',
  },
  {
    id: 'door',
    label: 'Door Lock',
    icon: '🔒',
    room: 'Entrance',
    cmdOn: 'door_open',
    cmdOff: 'door_close',
    labelOn: 'UNLOCK',
    labelOff: 'LOCK',
  },
];

export const SCENES = [
  {
    id: 'movie',
    label: 'Movie Night',
    icon: '🎬',
    cmds: ['light_off', 'tv_on', 'ac_on'],
  },
  {
    id: 'sleep',
    label: 'Sleep Mode',
    icon: '🌙',
    cmds: ['light_off', 'fan_on', 'tv_off', 'ac_off'],
  },
  {
    id: 'morning',
    label: 'Good Morning',
    icon: '☀️',
    cmds: ['light_on', 'fan_off', 'ac_off'],
  },
  {
    id: 'away',
    label: 'Away Mode',
    icon: '🔐',
    cmds: ['light_off', 'fan_off', 'ac_off', 'tv_off', 'door_close'],
  },
];

export function useSmartHome() {
  // { applianceId: boolean }
  const [states, setStates] = useState({});
  const [runningScene, setRunningScene] = useState(null);

  const activeCount = Object.values(states).filter(Boolean).length;

  // Toggle a single appliance
  const toggle = useCallback(
    async (appliance) => {
      const isOn = !!states[appliance.id];
      try {
        await sendCommand('home', isOn ? appliance.cmdOff : appliance.cmdOn);
        setStates((prev) => ({ ...prev, [appliance.id]: !isOn }));
      } catch {
        Alert.alert(
          'Not Connected',
          'Smart Home ESP32 is offline.\nGo to the Connect tab to pair it.',
        );
      }
    },
    [states],
  );

  // Run a scene (sequence of commands)
  const runScene = useCallback(async (scene) => {
    setRunningScene(scene.id);
    for (const cmd of scene.cmds) {
      try {
        await sendCommand('home', cmd);
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        Alert.alert('Scene Failed', 'Smart Home is not connected.');
        setRunningScene(null);
        return;
      }
    }
    Alert.alert('✓ Scene Active', `"${scene.label}" is now active`);
    setRunningScene(null);
  }, []);

  return { states, toggle, runScene, activeCount, runningScene };
}
