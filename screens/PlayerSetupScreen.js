import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function PlayerSetupScreen({ navigation, route }) {
  const gameMode = route.params?.gameMode || 'friends';
  const minPlayers = gameMode === 'couples' ? 2 : 2;
  const maxPlayers = gameMode === 'couples' ? 6 : 10;

  const [players, setPlayers] = useState([
    { id: 1, name: '', gender: 'male' },
    { id: 2, name: '', gender: 'female' },
  ]);

  useEffect(() => {
    loadLastPlayers();
  }, []);

  const loadLastPlayers = async () => {
    try {
      const savedPlayers = await SecureStore.getItemAsync('lastPlayers');
      if (savedPlayers) {
        const parsedPlayers = JSON.parse(savedPlayers);
        // Only load if the game mode matches
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
      setPlayers([...players, { id: players.length + 1, name: '', gender: 'male' }]);
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
        // Save the current players
        await savePlayers(players);
        // Reset the last player index to 0 when starting a new game
        await SecureStore.setItemAsync('lastPlayerIndex', '0');
        navigation.navigate('Difficulty', { players, gameMode });
      } catch (error) {
        console.log('Error saving game state:', error);
        // Still navigate even if saving fails
        navigation.navigate('Difficulty', { players, gameMode });
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a237e] pt-[${Platform.OS === 'android' ? StatusBar.currentHeight : 0}px]">
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1"
      >
        <View className="flex-1 p-5">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/15 justify-center items-center mr-4"
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl text-white font-bold mb-1">
                {gameMode === 'couples' ? 'Add Couples' : 'Add Players'}
              </Text>
              <Text className="text-base text-white/80">
                {gameMode === 'couples'
                  ? 'Add 1-3 couples to play'
                  : 'Add 2-10 players to start'}
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-5"
            showsVerticalScrollIndicator={false}
          >
            {players.map((player, index) => (
              <View key={player.id}>
                <View className="bg-white/10 rounded-2xl p-4 mb-3">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 h-[45px] bg-white/10 rounded-xl overflow-hidden">
                      <TextInput
                        className="flex-1 h-full px-4 text-white text-base"
                        placeholder={gameMode === 'couples' 
                          ? `Enter ${index % 2 === 0 ? 'first' : 'second'} player's name`
                          : "Enter player's name"
                        }
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={player.name}
                        onChangeText={(text) => updatePlayer(player.id, 'name', text)}
                      />
                    </View>
                    <TouchableOpacity
                      className={`w-[45px] h-[45px] rounded-xl justify-center items-center ${
                        player.gender === 'male' ? 'bg-[#2196F3]' : 'bg-[#FF4B91]'
                      }`}
                      onPress={() => toggleGender(player.id)}
                    >
                      <MaterialIcons
                        name={player.gender === 'male' ? 'male' : 'female'}
                        size={24}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    {players.length > minPlayers && (
                      <TouchableOpacity
                        onPress={() => removePlayer(player.id)}
                        className="w-[45px] h-[45px] justify-center items-center"
                      >
                        <AntDesign name="closecircle" size={24} color="rgba(255, 255, 255, 0.8)" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {gameMode === 'couples' && index % 2 === 1 && index !== players.length - 1 && (
                  <View className="h-4" />
                )}
              </View>
            ))}
          </ScrollView>

          <View className="mt-4 space-y-3">
            {players.length < maxPlayers && (
              <TouchableOpacity 
                className={`flex-row items-center justify-center py-4 rounded-xl ${
                  gameMode === 'couples' ? 'bg-[#FF4B91]' : 'bg-[#2196F3]'
                }`}
                onPress={addPlayer}
              >
                <AntDesign name="plus" size={20} color="#fff" className="mr-2" />
                <Text className="text-white font-semibold text-base">
                  Add {gameMode === 'couples' ? 'Couple' : 'Player'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className={`py-4 rounded-xl bg-white ${
                !players.every(p => p.name.trim()) ? 'opacity-50' : ''
              }`}
              onPress={startGame}
              disabled={!players.every(p => p.name.trim())}
            >
              <Text className="text-purple-900 font-bold text-center text-base">
                Choose Difficulty
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 