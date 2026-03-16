import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DeviceProvider } from './src/context/DeviceContext';
import TabNavigator from './src/navigation/TabNavigator';
import { COLORS } from './src/utils/theme';

LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'Non-serializable values were found',
  'Require cycle:',
]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DeviceProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <TabNavigator />
          </NavigationContainer>
        </DeviceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
