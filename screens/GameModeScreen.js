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
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

export default function GameModeScreen({ navigation }) {
  const handleModeSelect = (mode) => {
    navigation.navigate('PlayerSetup', { gameMode: mode });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        style={styles.background}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Select Mode</Text>
            <Text style={styles.subtitle}>Choose your game style</Text>
          </View>

          <View style={styles.modesContainer}>
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => handleModeSelect('couples')}
            >
              <LinearGradient
                colors={['#FF4B91', '#A91079']}
                style={styles.modeCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.glassEffect, { backgroundColor: 'rgba(255, 192, 203, 0.05)' }]} />
                <View style={styles.modeContent}>
                  <View style={[styles.modeIconContainer, { backgroundColor: 'rgba(255, 192, 203, 0.2)' }]}>
                    <MaterialIcons name="favorite" size={46} color="#fff" />
                  </View>
                  <View style={styles.modeTextContainer}>
                    <Text style={styles.modeTitle}>Couples Mode</Text>
                    <Text style={styles.modeDescription}>
                      Perfect for date night or couples gathering
                    </Text>
                  </View>
                  <AntDesign name="right" size={28} color="#fff" style={styles.arrowIcon} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => handleModeSelect('friends')}
            >
              <LinearGradient
                colors={['#00BCD4', '#3F51B5']}
                style={styles.modeCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.glassEffect} />
                <View style={styles.modeContent}>
                  <View style={styles.modeIconContainer}>
                    <FontAwesome5 name="user-friends" size={40} color="#fff" />
                  </View>
                  <View style={styles.modeTextContainer}>
                    <Text style={styles.modeTitle}>Friends Mode</Text>
                    <Text style={styles.modeDescription}>
                      Fun challenges for friend groups
                    </Text>
                  </View>
                  <AntDesign name="right" size={28} color="#fff" style={styles.arrowIcon} />
                </View>
              </LinearGradient>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingBottom: height * 0.1,
  },
  modeCard: {
    height: height * 0.22,
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
  },
  modeCardGradient: {
    flex: 1,
    padding: 24,
  },
  glassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  modeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  modeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  modeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  arrowIcon: {
    opacity: 0.9,
  },
}); 