import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { questions } from '../data/questions';
import * as SecureStore from 'expo-secure-store';

export default function PlayScreen({ navigation, route }) {
  const { players, gameMode, difficulty } = route.params;
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [question, setQuestion] = useState('');
  const [isSpinning, setIsSpinning] = useState(true);
  const [isChoosingQuestion, setIsChoosingQuestion] = useState(false);
  const [customDares, setCustomDares] = useState({ truth: [], dare: [] });
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const questionAnimValue = useRef(new Animated.Value(0)).current;
  const spinDuration = 3000;
  const questionDuration = 2000;

  useEffect(() => {
    loadCustomDares();
  }, []);

  const loadCustomDares = async () => {
    try {
      const savedDares = await SecureStore.getItemAsync('customDares');
      if (savedDares) {
        setCustomDares(JSON.parse(savedDares));
      }
    } catch (error) {
      console.log('Error loading custom dares:', error);
    }
  };

  const getRandomQuestion = (type) => {
    // Get default questions for the current difficulty
    const defaultQuestions = questions[difficulty][gameMode][type];
    
    // Only include custom dares if difficulty is not 'soft'
    let allQuestions = [];
    if (difficulty === 'soft') {
      allQuestions = defaultQuestions.map(q => ({ text: q, isCustom: false }));
    } else {
      const userQuestions = customDares[type];
      const formattedUserQuestions = userQuestions.map(q => ({
        text: q,
        isCustom: true
      }));
      
      allQuestions = [
        ...defaultQuestions.map(q => ({ text: q, isCustom: false })),
        ...formattedUserQuestions
      ];
    }
    
    // Return a random question from the combined array
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
  };

  const animateQuestionSelection = (type) => {
    setIsChoosingQuestion(true);
    questionAnimValue.setValue(0);
    
    // Store the final question but don't show it immediately
    const finalQuestion = getRandomQuestion(type);
    const defaultQuestions = questions[difficulty][gameMode][type];
    
    // Only include custom dares if difficulty is not 'soft'
    let allQuestions = [];
    if (difficulty === 'soft') {
      allQuestions = defaultQuestions.map(q => ({ text: q, isCustom: false }));
    } else {
      const userQuestions = customDares[type];
      allQuestions = [
        ...defaultQuestions.map(q => ({ text: q, isCustom: false })),
        ...userQuestions.map(q => ({ text: q, isCustom: true }))
      ];
    }
    
    let currentSpeed = 30;
    let speedIncrement = 2;
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentSpeed += speedIncrement;
      if (currentSpeed > 200) {
        speedIncrement = 10;
      }
      if (currentSpeed > 400) {
        clearInterval(interval);
        setQuestion(finalQuestion);
        return;
      }
      
      currentIndex = (currentIndex + 1) % allQuestions.length;
      setQuestion(allQuestions[currentIndex]);
    }, currentSpeed);

    // Create a bouncy animation sequence
    Animated.sequence([
      // Initial quick scale up
      Animated.timing(questionAnimValue, {
        toValue: 0.3,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Bouncy animation during question cycling
      Animated.sequence([
        Animated.timing(questionAnimValue, {
          toValue: 0.6,
          duration: 600,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), // Bouncy easing
          useNativeDriver: true,
        }),
        Animated.timing(questionAnimValue, {
          toValue: 0.4,
          duration: 400,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
      // Final settling animation
      Animated.spring(questionAnimValue, {
        toValue: 1,
        friction: 8, // More springiness
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearInterval(interval);
      setQuestion(finalQuestion);
      setIsChoosingQuestion(false);
    });
  };

  const startSpinAnimation = () => {
    setIsSpinning(true);
    spinValue.setValue(0);
    
    // Calculate final position with more precise control
    const targetPlayer = Math.floor(Math.random() * players.length);
    const baseRotations = 5; // Minimum number of full rotations
    const randomExtra = Math.random() * 2; // Random additional rotations (0-2)
    const targetRotation = baseRotations + randomExtra + (targetPlayer / players.length);

    // Create a smoother spinning sequence
    Animated.sequence([
      // Initial acceleration
      Animated.timing(spinValue, {
        toValue: targetRotation * 0.4,
        duration: spinDuration * 0.3,
        easing: Easing.bezier(0.33, 0, 0.66, 0.33), // Custom easing for smooth acceleration
        useNativeDriver: true,
      }),
      // Main spinning phase
      Animated.timing(spinValue, {
        toValue: targetRotation * 0.75,
        duration: spinDuration * 0.35,
        easing: Easing.bezier(0.33, 0, 0.66, 1), // Maintain speed with slight deceleration
        useNativeDriver: true,
      }),
      // Gradual deceleration
      Animated.timing(spinValue, {
        toValue: targetRotation * 0.95,
        duration: spinDuration * 0.25,
        easing: Easing.bezier(0.33, 0, 0.33, 1), // Custom easing for natural slowdown
        useNativeDriver: true,
      }),
      // Final gentle settling
      Animated.spring(spinValue, {
        toValue: targetRotation,
        duration: spinDuration * 0.1,
        damping: 15,
        stiffness: 50,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSpinning(false);
      setCurrentPlayerIndex(targetPlayer);
    });
  };

  useEffect(() => {
    startSpinAnimation();
  }, []);

  const handleSelectType = (type) => {
    setSelectedType(type);
    animateQuestionSelection(type);
  };

  const nextPlayer = () => {
    setSelectedType(null);
    setQuestion('');
    startSpinAnimation();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const renderPlayerNames = () => {
    const wheelSize = width * 0.8;
    const radius = wheelSize / 2 - 40;
    const angleStep = (2 * Math.PI) / players.length;

    return players.map((player, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      return (
        <Animated.View
          key={index}
          style={[
            styles.playerNameContainer,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${angle + Math.PI/4}rad` }, // Offset to match container rotation
                { scale: isSpinning ? 0.9 : 1 }, // Slight scale during spin
              ],
            },
          ]}
        >
          <Text style={[
            styles.playerNameText,
            isSpinning && styles.playerNameSpinning,
          ]}>
            {player.name}
          </Text>
        </Animated.View>
      );
    });
  };

  const renderSpinWheel = () => (
    <View style={styles.spinContainer}>
      <Text style={styles.spinTitle}>Who's Next?</Text>
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={['#1a237e', '#4a148c']}
            style={styles.wheelGradient}
          >
            {renderPlayerNames()}
            <View style={styles.wheelCenter}>
              <FontAwesome5 name="user-friends" size={40} color="#fff" />
            </View>
          </LinearGradient>
        </Animated.View>
        <View style={styles.wheelPointer} />
      </View>
      {!isSpinning && (
        <View style={styles.selectedPlayerContainer}>
          <Text style={styles.selectedPlayerText}>
            {players[currentPlayerIndex].name}'s Turn!
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setIsSpinning(false)}
          >
            <Text style={styles.continueButtonText}>START TURN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isSpinning) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#1a237e', '#4a148c', '#311b92']}
          style={styles.background}
        >
          <View style={styles.container}>
            {renderSpinWheel()}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.playerName}>{players[currentPlayerIndex].name}'s Turn</Text>
              <Text style={styles.subtitle}>Choose Truth or Dare</Text>
            </View>
          </View>

          {!selectedType ? (
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={() => handleSelectType('truth')}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.choiceGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.glassEffect} />
                  <View style={styles.choiceContent}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="question-answer" size={40} color="#fff" />
                    </View>
                    <Text style={styles.choiceTitle}>TRUTH</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choiceCard}
                onPress={() => handleSelectType('dare')}
              >
                <LinearGradient
                  colors={['#FF4B91', '#A91079']}
                  style={styles.choiceGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.glassEffect} />
                  <View style={styles.choiceContent}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="flame" size={40} color="#fff" />
                    </View>
                    <Text style={styles.choiceTitle}>DARE</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <LinearGradient
                colors={selectedType === 'truth' ? ['#2196F3', '#1976D2'] : ['#FF4B91', '#A91079']}
                style={styles.questionCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.glassEffect} />
                <View style={styles.questionContent}>
                  <View style={styles.typeContainer}>
                    <MaterialIcons
                      name={selectedType === 'truth' ? 'question-answer' : 'local-fire-department'}
                      size={32}
                      color="#fff"
                    />
                    <Text style={styles.typeText}>
                      {selectedType.toUpperCase()}
                    </Text>
                    {question.isCustom && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>CUSTOM</Text>
                      </View>
                    )}
                  </View>
                  <Animated.View
                    style={[
                      styles.questionTextContainer,
                      {
                        transform: [
                          {
                            scale: questionAnimValue.interpolate({
                              inputRange: [0, 0.3, 0.6, 0.8, 1],
                              outputRange: [1, 1.1, 1.15, 1.05, 1],
                            }),
                          },
                          {
                            rotate: questionAnimValue.interpolate({
                              inputRange: [0, 0.3, 0.6, 0.8, 1],
                              outputRange: ['0deg', '-2deg', '2deg', '-1deg', '0deg'],
                            }),
                          },
                        ],
                        opacity: questionAnimValue.interpolate({
                          inputRange: [0, 0.2, 0.8, 1],
                          outputRange: [0.7, 1, 1, 1],
                        }),
                      },
                    ]}
                  >
                    <Text style={[
                      styles.questionText,
                      isChoosingQuestion && styles.questionTextAnimating,
                    ]}>
                      {question.text || question}
                    </Text>
                  </Animated.View>
                </View>
              </LinearGradient>

              <TouchableOpacity
                style={[styles.nextButton, isChoosingQuestion && styles.nextButtonDisabled]}
                onPress={nextPlayer}
                disabled={isChoosingQuestion}
              >
                <Text style={styles.nextButtonText}>NEXT PLAYER</Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: 40,
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
  playerName: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  choiceContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  choiceCard: {
    height: height * 0.25,
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
  choiceGradient: {
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
  choiceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  choiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  questionCard: {
    flex: 1,
    maxHeight: height * 0.5,
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
  questionContent: {
    flex: 1,
    padding: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  typeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  questionText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
  },
  nextButton: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
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
  nextButtonText: {
    color: '#4a148c',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  spinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  spinTitle: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wheelContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    transform: [{ rotate: '45deg' }], // Offset the initial position
  },
  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    backfaceVisibility: 'hidden', // Reduces visual artifacts during rotation
  },
  wheelGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  wheelPointer: {
    position: 'absolute',
    top: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    transform: [{ rotate: '-45deg' }], // Match container rotation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedPlayerContainer: {
    alignItems: 'center',
    gap: 20,
  },
  selectedPlayerText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  continueButtonText: {
    color: '#4a148c',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playerNameContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 30,
    backfaceVisibility: 'hidden',
  },
  playerNameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playerNameSpinning: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  questionTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  questionTextAnimating: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  customBadge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  customBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 