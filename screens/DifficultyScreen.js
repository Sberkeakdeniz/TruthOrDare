import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const DIFFICULTIES = [
  {
    id: 'soft',
    title: 'Soft',
    icon: 'sentiment-satisfied',
    iconFamily: 'MaterialIcons',
    colors: ['#4CAF50', '#388E3C'],
    description: 'Keep it light and fun'
  },
  {
    id: 'hot',
    title: 'Hot',
    icon: 'whatshot',
    iconFamily: 'MaterialIcons',
    colors: ['#FF9800', '#F57C00'],
    description: 'Spice things up a bit'
  },
  {
    id: 'hard',
    title: 'Hard',
    icon: 'grin-hearts',
    iconFamily: 'FontAwesome5',
    colors: ['#F44336', '#D32F2F'],
    description: 'Take it to the next level'
  },
  {
    id: 'extreme',
    title: 'Extreme',
    icon: 'grin-tongue-wink',
    iconFamily: 'FontAwesome5',
    colors: ['#9C27B0', '#7B1FA2'],
    description: 'No limits, pure fun'
  }
];

export default function DifficultyScreen({ navigation, route }) {
  const { players, gameMode } = route.params;

  const handleSelectDifficulty = (difficulty) => {
    navigation.navigate('Play', { players, gameMode, difficulty });
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
              <Text style={styles.title}>Choose Difficulty</Text>
              <Text style={styles.subtitle}>Select how daring you want to be</Text>
            </View>
          </View>

          <View style={styles.difficultiesContainer}>
            {DIFFICULTIES.map((difficulty, index) => (
              <TouchableOpacity
                key={difficulty.id}
                style={styles.difficultyCard}
                onPress={() => handleSelectDifficulty(difficulty.id)}
              >
                <LinearGradient
                  colors={difficulty.colors}
                  style={styles.difficultyGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.glassEffect} />
                  <View style={styles.difficultyContent}>
                    <View style={styles.iconContainer}>
                      {difficulty.iconFamily === 'MaterialIcons' ? (
                        <MaterialIcons name={difficulty.icon} size={32} color="#fff" />
                      ) : (
                        <FontAwesome5 name={difficulty.icon} size={32} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.difficultyTitle}>{difficulty.title}</Text>
                    <AntDesign name="right" size={24} color="#fff" style={styles.arrowIcon} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateDares')}
            >
              <LinearGradient
                colors={['#E91E63', '#C2185B']}
                style={styles.createGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.glassEffect} />
                <View style={styles.createContent}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="add-circle" size={32} color="#fff" />
                  </View>
                  <Text style={styles.createTitle}>Create your own dares!</Text>
                  <AntDesign name="right" size={24} color="#fff" style={styles.arrowIcon} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');

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
  difficultiesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingBottom: height * 0.05,
  },
  difficultyCard: {
    height: height * 0.11,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  createButton: {
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    marginTop: 20,
  },
  difficultyGradient: {
    flex: 1,
    padding: 16,
  },
  glassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  difficultyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  difficultyTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  arrowIcon: {
    opacity: 0.9,
  },
  createGradient: {
    flex: 1,
    padding: 20,
  },
  createContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
}); 