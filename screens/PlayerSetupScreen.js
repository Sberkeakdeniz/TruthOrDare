import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function PlayerSetupScreen({ navigation, route }) {
  const gameMode = route.params?.gameMode || 'friends';
  const minPlayers = gameMode === 'couples' ? 2 : 2;
  const maxPlayers = gameMode === 'couples' ? 6 : 10;

  const [players, setPlayers] = useState([
    { id: 1, name: '', gender: 'male' },
    { id: 2, name: '', gender: 'female' },
  ]);

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

  const startGame = () => {
    const filledPlayers = players.every(player => player.name.trim() !== '');
    if (filledPlayers) {
      navigation.navigate('Difficulty', { players, gameMode });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {gameMode === 'couples' ? 'Add Couples' : 'Add Players'}
              </Text>
              <Text style={styles.subtitle}>
                {gameMode === 'couples'
                  ? 'Add 1-3 couples to play'
                  : 'Add 2-10 players to start'}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {players.map((player, index) => (
              <View key={player.id}>
                <View style={styles.playerCard}>
                  <View style={styles.playerInputs}>
                    <View style={styles.nameInputContainer}>
                      <TextInput
                        style={styles.input}
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
                      style={[
                        styles.genderButton,
                        { backgroundColor: player.gender === 'male' ? '#2196F3' : '#FF4B91' }
                      ]}
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
                        style={styles.removeButton}
                      >
                        <AntDesign name="closecircle" size={24} color="rgba(255, 255, 255, 0.8)" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {gameMode === 'couples' && index % 2 === 1 && index !== players.length - 1 && (
                  <View style={styles.coupleDivider} />
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            {players.length < maxPlayers && (
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  { backgroundColor: gameMode === 'couples' ? '#FF4B91' : '#2196F3' }
                ]} 
                onPress={addPlayer}
              >
                <AntDesign name="plus" size={20} color="#fff" style={styles.addIcon} />
                <Text style={styles.addButtonText}>
                  Add {gameMode === 'couples' ? 'Couple' : 'Player'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.startButton,
                !players.every(p => p.name.trim()) && styles.startButtonDisabled
              ]}
              onPress={startGame}
              disabled={!players.every(p => p.name.trim())}
            >
              <Text style={styles.startButtonText}>Choose Difficulty</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
  },
  playerInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameInputContainer: {
    flex: 1,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
  },
  genderButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coupleDivider: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 15,
    marginHorizontal: 30,
    borderRadius: 1,
  },
  footer: {
    gap: 12,
    paddingTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#4a148c',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 