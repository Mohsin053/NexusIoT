import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS, RADIUS } from '../utils/theme';
import DashboardScreen from '../screens/DashboardScreen';
import SmartHomeScreen from '../screens/SmartHomeScreen';
import HealthScreen from '../screens/HealthScreen';
import CarScreen from '../screens/CarScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', icon: '📊', color: COLORS.textPrimary },
  { name: 'SmartHome', icon: '🏠', color: COLORS.green },
  { name: 'Health', icon: '💓', color: COLORS.orange },
  { name: 'Car', icon: '🚗', color: COLORS.purple },
  { name: 'Connect', icon: '🔗', color: COLORS.cyan },
];
function TabBar({ state, navigation }) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name) || TABS[0];
        const focused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.tab,
              focused && { backgroundColor: tab.color + '18' },
            ]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon]}>{tab.icon}</Text>

            <Text style={[styles.label, { color: tab.color }]}>
              {route.name === 'SmartHome' ? 'HOME' : route.name.toUpperCase()}
            </Text>

            {focused && (
              <View style={[styles.dot, { backgroundColor: tab.color }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="SmartHome" component={SmartHomeScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen name="Car" component={CarScreen} />
      <Tab.Screen name="Connect" component={ConnectionsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 5,
    paddingHorizontal: 8,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },

  icon: {
    fontSize: 22,
  },

  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 5,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
});
