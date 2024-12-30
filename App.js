import React, { useEffect, createContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TranslationProvider } from './translations/TranslationContext';
import { initializePurchases, checkPremiumStatus } from './utils/purchases';
import Purchases from 'react-native-purchases';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import GameModeScreen from './screens/GameModeScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import PlayScreen from './screens/PlayScreen';
import CreateDaresScreen from './screens/CreateDaresScreen';

const Stack = createNativeStackNavigator();
export const PremiumContext = createContext();

export default function App() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initializePurchases();
      const premium = await checkPremiumStatus();
      setIsPremium(premium);

      // Set up listener for purchase updates
      Purchases.addCustomerInfoUpdateListener(async (info) => {
        const premium = info?.entitlements?.active?.premium ?? false;
        setIsPremium(premium);
      });
    };
    setup();

    // Cleanup listener on unmount
    return () => {
      Purchases.removeCustomerInfoUpdateListener();
    };
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, setIsPremium }}>
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
    </PremiumContext.Provider>
  );
}
