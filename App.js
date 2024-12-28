import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TranslationProvider } from './translations/TranslationContext';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import GameModeScreen from './screens/GameModeScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import PlayScreen from './screens/PlayScreen';
import CreateDaresScreen from './screens/CreateDaresScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <TranslationProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
          <Stack.Screen name="GameMode" component={GameModeScreen} />
          <Stack.Screen name="Difficulty" component={DifficultyScreen} />
          <Stack.Screen name="Play" component={PlayScreen} />
          <Stack.Screen name="CreateDares" component={CreateDaresScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TranslationProvider>
  );
}
