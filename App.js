import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './screens/WelcomeScreen';
import GameModeScreen from './screens/GameModeScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import PlayScreen from './screens/PlayScreen';
import CreateDaresScreen from './screens/CreateDaresScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="GameMode" component={GameModeScreen} />
          <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
          <Stack.Screen
            name="Difficulty"
            component={DifficultyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateDares"
            component={CreateDaresScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Play"
            component={PlayScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
