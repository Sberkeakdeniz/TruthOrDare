import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from '../translations/TranslationContext';

export default function PlayerSetupScreen({ navigation, route }) {
  const { strings } = useTranslation();
  const gameMode = route.params?.gameMode || 'friends';
  const minPlayers = gameMode === 'couples' ? 2 : 2;
  const maxPlayers = gameMode === 'couples' ? 6 : 10;
  const [fadeAnims] = useState(() => new Map());

  const [players, setPlayers] = useState([
    { id: 1, name: '', gender: 'male' },
    { id: 2, name: '', gender: 'female' },
  ]);

  useEffect(() => {
    loadLastPlayers();
  }, []);

  // Initialize animation values for existing players
  useEffect(() => {
    players.forEach(player => {
      if (!fadeAnims.has(player.id)) {
        fadeAnims.set(player.id, new Animated.Value(1));
      }
    });
  }, [players]);

  const loadLastPlayers = async () => {
    try {
      const savedPlayers = await SecureStore.getItemAsync('lastPlayers');
      if (savedPlayers) {
        const parsedPlayers = JSON.parse(savedPlayers);
        if (parsedPlayers.gameMode === gameMode) {
          setPlayers(parsedPlayers.players);
        }
      }
    } catch (error) {
      console.log('Error loading last players:', error);
    }
  };

  const savePlayers = async (playersToSave) => {
    try {
      await SecureStore.setItemAsync('lastPlayers', JSON.stringify({
        players: playersToSave,
        gameMode: gameMode
      }));
    } catch (error) {
      console.log('Error saving players:', error);
    }
  };

  const addPlayer = () => {
    if (players.length < maxPlayers) {
      const newPlayerId = players.length + 1;
      const newFadeAnim = new Animated.Value(0);
      fadeAnims.set(newPlayerId, newFadeAnim);
      
      setPlayers(prevPlayers => [
        ...prevPlayers,
        { id: newPlayerId, name: '', gender: players.length % 2 === 0 ? 'male' : 'female' }
      ]);

      Animated.timing(newFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const removePlayer = (id) => {
    if (players.length > minPlayers) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(player =>
      player.id === id ? { ...player, [field]: value } : player
    ));
  };

  const toggleGender = (id) => {
    setPlayers(players.map(player =>
      player.id === id ? { ...player, gender: player.gender === 'male' ? 'female' : 'male' } : player
    ));
  };

  const startGame = async () => {
    const filledPlayers = players.every(player => player.name.trim() !== '');
    if (filledPlayers) {
      try {
        await savePlayers(players);
        await SecureStore.setItemAsync('lastPlayerIndex', '0');
        navigation.navigate('Difficulty', { players, gameMode });
      } catch (error) {
        console.log('Error saving game state:', error);
        navigation.navigate('Difficulty', { players, gameMode });
      }
    }
  };

  const getPlayerCardStyle = (playerId) => {
    const fadeAnim = fadeAnims.get(playerId) || new Animated.Value(1);
    return {
      opacity: fadeAnim,
      transform: [{ scale: fadeAnim }],
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a237e]">
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1"
      >
        <View className="flex-1 px-5 pt-5">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-white/10 justify-center items-center mr-4"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl text-white font-bold">
                {gameMode === 'couples' ? strings.playerSetup.addPlayer : strings.playerSetup.addPlayer}
              </Text>
              <Text className="text-base text-white/70 mt-1">
                {gameMode === 'couples'
                  ? `${strings.playerSetup.minPlayers} (1-3 ${strings.gameMode.couples})`
                  : `${strings.playerSetup.minPlayers} (2-10 ${strings.playerSetup.players})`}
              </Text>
            </View>
          </View>

          {/* Player List */}
          <ScrollView
            className="flex-1 -mx-2 px-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {players.map((player, index) => (
              <Animated.View 
                key={player.id}
                style={getPlayerCardStyle(player.id)}
                className="mb-4"
              >
                <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      className={`w-[48px] h-[48px] rounded-xl justify-center items-center ${
                        player.gender === 'male' ? 'bg-[#2196F3]' : 'bg-[#FF4B91]'
                      }`}
                      onPress={() => toggleGender(player.id)}
                      style={{
                        shadowColor: player.gender === 'male' ? '#2196F3' : '#FF4B91',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                    >
                      <MaterialIcons
                        name={player.gender === 'male' ? 'male' : 'female'}
                        size={26}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <TextInput
                      className="flex-1 bg-white/15 rounded-xl px-4 py-3.5 text-white text-lg"
                      placeholder={strings.playerSetup.enterName}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={player.name}
                      onChangeText={(text) => updatePlayer(player.id, 'name', text)}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    />
                    {players.length > minPlayers && (
                      <TouchableOpacity
                        className="w-[48px] h-[48px] rounded-xl bg-red-500/20 items-center justify-center"
                        onPress={() => removePlayer(player.id)}
                        style={{
                          shadowColor: '#ef4444',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <Ionicons name="trash-outline" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Bottom Buttons */}
          <View className="space-y-3 pb-5">
            {players.length < maxPlayers && (
              <TouchableOpacity
                className="flex-row items-center justify-center bg-white/15 rounded-2xl py-4"
                onPress={addPlayer}
                style={{
                  shadowColor: '#fff',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <AntDesign name="plus" size={24} color="#fff" />
                <Text className="text-white text-lg font-bold ml-2">
                  {strings.playerSetup.addPlayer}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`bg-white rounded-2xl py-4 ${
                !players.every(player => player.name.trim() !== '') ? 'opacity-50' : ''
              }`}
              onPress={startGame}
              disabled={!players.every(player => player.name.trim() !== '')}
              style={{
                shadowColor: '#7c3aed',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-purple-900 text-lg font-bold text-center">
                {strings.playerSetup.start}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 