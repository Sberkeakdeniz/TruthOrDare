import React, { useState, useRef, useEffect } from 'react';
import {
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

const { width } = Dimensions.get('window');

export default function PlayScreen({ navigation, route }) {
  const { players, gameMode, difficulty } = route.params;
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [question, setQuestion] = useState('');
  const [isSpinning, setIsSpinning] = useState(true);
  const [isChoosingQuestion, setIsChoosingQuestion] = useState(false);
  const [customDares, setCustomDares] = useState({ truth: [], dare: [] });
  const [revealedQuestions, setRevealedQuestions] = useState({
    truth: new Set(),
    dare: new Set()
  });
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const questionAnimValue = useRef(new Animated.Value(0)).current;
  const spinDuration = 3000;
  const questionDuration = 2000;

  useEffect(() => {
    loadCustomDares();
    loadLastPlayerIndex();
  }, []);

  const loadLastPlayerIndex = async () => {
    try {
      const lastIndex = await SecureStore.getItemAsync('lastPlayerIndex');
      if (lastIndex !== null) {
        const index = parseInt(lastIndex);
        if (index >= 0 && index < players.length) {
          setCurrentPlayerIndex(index);
        }
      }
    } catch (error) {
      console.log('Error loading last player index:', error);
    }
  };

  const saveLastPlayerIndex = async (index) => {
    try {
      await SecureStore.setItemAsync('lastPlayerIndex', index.toString());
    } catch (error) {
      console.log('Error saving last player index:', error);
    }
  };

  // Add back the initial spin animation
  useEffect(() => {
    startSpinAnimation();
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

    // Filter out revealed questions
    const availableQuestions = allQuestions.filter(q => !revealedQuestions[type].has(q.text));
    
    // If all questions have been revealed, reset the tracking and use all questions
    if (availableQuestions.length === 0) {
      setRevealedQuestions(prev => ({
        ...prev,
        [type]: new Set()
      }));
      return allQuestions[Math.floor(Math.random() * allQuestions.length)];
    }
    
    // Get a random question from available ones
    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Add the selected question to revealed set
    setRevealedQuestions(prev => ({
      ...prev,
      [type]: new Set([...prev[type], selectedQuestion.text])
    }));
    
    return selectedQuestion;
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
    const currentIndex = currentPlayerIndex;
    let targetPlayer;
    do {
      targetPlayer = Math.floor(Math.random() * players.length);
    } while (targetPlayer === currentIndex && players.length > 1); // Ensure different player if possible

    const baseRotations = 5;
    const randomExtra = Math.random() * 2;
    const targetRotation = baseRotations + randomExtra + (targetPlayer / players.length);

    // Create a smoother spinning sequence
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: targetRotation * 0.4,
        duration: spinDuration * 0.3,
        easing: Easing.bezier(0.33, 0, 0.66, 0.33),
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: targetRotation * 0.75,
        duration: spinDuration * 0.35,
        easing: Easing.bezier(0.33, 0, 0.66, 1),
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: targetRotation * 0.95,
        duration: spinDuration * 0.25,
        easing: Easing.bezier(0.33, 0, 0.33, 1),
        useNativeDriver: true,
      }),
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
      saveLastPlayerIndex(targetPlayer);
    });
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    animateQuestionSelection(type);
  };

  const nextPlayer = () => {
    setSelectedType(null);
    setQuestion('');
    startSpinAnimation();
  };

  // Add function to reset revealed questions
  const resetRevealedQuestions = () => {
    setRevealedQuestions({
      truth: new Set(),
      dare: new Set()
    });
  };

  // Add useEffect to reset revealed questions when difficulty or gameMode changes
  useEffect(() => {
    resetRevealedQuestions();
  }, [difficulty, gameMode]);

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
          className={`absolute ${isSpinning ? 'opacity-90 scale-90' : 'opacity-100'}`}
          style={{
            transform: [
              { translateX: x },
              { translateY: y },
              { rotate: `${angle + Math.PI/4}rad` },
            ],
          }}
        >
          <Text className={`text-white text-lg font-bold ${isSpinning ? 'opacity-75' : ''}`}>
            {player.name}
          </Text>
        </Animated.View>
      );
    });
  };

  const renderSeparators = () => {
    const angleStep = (2 * Math.PI) / players.length;
    const wheelRadius = width * 0.425; // Half of the wheel width
    const centerLogoRadius = 48; // Size of the center logo circle (96/2)
    
    return players.map((_, index) => {
      const angle = index * angleStep;
      return (
        <View
          key={`separator-${index}`}
          className="absolute"
          style={{
            width: 2,
            height: wheelRadius * 2, // Full diameter of the wheel
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            left: '50%',
            top: '50%',
            transform: [
              { translateX: -1 },
              { translateY: -wheelRadius }, // Center the line
              { rotate: `${(angle * 180) / Math.PI}deg` },
            ],
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: centerLogoRadius * 2,
              backgroundColor: '#1a237e', // Same as the first gradient color
              top: wheelRadius - centerLogoRadius,
            }}
          />
        </View>
      );
    });
  };

  const renderSpinWheel = () => (
    <View className="flex-1 items-center justify-center">
      <Text className="text-4xl text-white font-bold mb-8 tracking-tight">Who's Next?</Text>
      <View className="relative mb-8">
        <View className="absolute -top-6 left-1/2 -ml-[20px] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-white/90 shadow-lg rotate-[-45deg] z-20" />
        <Animated.View
          className="items-center justify-center shadow-2xl"
          style={{
            transform: [{ rotate: spin }],
            width: width * 0.85,
            height: width * 0.85,
          }}
        >
          <LinearGradient
            colors={['#1a237e', '#4a148c']}
            className="w-full h-full rounded-full items-center justify-center border-4 border-white/20 overflow-hidden"
          >
            {renderSeparators()}
            {renderPlayerNames()}
            <View className="absolute w-24 h-24 rounded-full bg-white/20 items-center justify-center border-2 border-white/30 shadow-lg">
              <FontAwesome5 name="user-friends" size={44} color="#fff" />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
      {!isSpinning && (
        <View className="items-center">
          <Text className="text-4xl text-white font-bold text-center mb-2">
            {players[currentPlayerIndex].name}
          </Text>
          <Text className="text-xl text-white/80 font-medium text-center">
            Choose Truth or Dare
          </Text>
        </View>
      )}
    </View>
  );

  const renderQuestion = () => (
    <Animated.View
      className="flex-1 px-5"
      style={{
        transform: [{ scale: questionAnimValue }],
      }}
    >
      <View className="flex-1 items-center justify-center">
        <LinearGradient
          colors={selectedType === 'truth' ? ['#2196F3', '#1976D2'] : ['#FF4B91', '#A91079']}
          className="w-full rounded-3xl shadow-2xl overflow-hidden"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="absolute inset-0 bg-white/10" />
          <View className="p-7">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <MaterialIcons
                  name={selectedType === 'truth' ? 'question-answer' : 'local-fire-department'}
                  size={32}
                  color="#fff"
                />
              </View>
              <Text className="text-white text-xl font-bold tracking-wider ml-4">
                {selectedType.toUpperCase()}
              </Text>
              {question.isCustom && (
                <View className="bg-[#E91E63] px-3 py-1 rounded-full ml-3">
                  <Text className="text-white text-xs font-bold tracking-wider">CUSTOM</Text>
                </View>
              )}
            </View>
            <Animated.View
              className="items-center"
              style={{
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
              }}
            >
              <Text className={`text-white text-2xl text-center leading-9 font-medium ${
                isChoosingQuestion ? 'opacity-75' : ''
              }`}>
                {question.text || question}
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
      <TouchableOpacity
        className={`w-full bg-white rounded-2xl py-4 mb-6 shadow-lg ${
          isChoosingQuestion ? 'opacity-50' : ''
        }`}
        onPress={nextPlayer}
        disabled={isChoosingQuestion}
      >
        <Text className="text-purple-900 text-lg font-bold text-center tracking-wider">
          NEXT PLAYER
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1a237e] pt-[${Platform.OS === 'android' ? StatusBar.currentHeight : 0}px]">
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1"
      >
        <View className="flex-1 pt-5">
          <View className="flex-row items-center justify-between px-5 mb-8">
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white/15 justify-center items-center"
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-full">
              <MaterialIcons
                name={difficulty === 'soft' ? 'sentiment-satisfied' : 'whatshot'}
                size={24}
                color="#fff"
                className="mr-2"
              />
              <Text className="text-white text-lg font-semibold capitalize">
                {difficulty} Mode
              </Text>
            </View>
          </View>

          {!selectedType ? (
            <>
              {renderSpinWheel()}
              {!isSpinning && (
                <View className="flex-row justify-center gap-4 mb-8 px-5">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-[#2196F3] py-5 rounded-2xl shadow-lg"
                    onPress={() => handleSelectType('truth')}
                  >
                    <MaterialIcons name="question-answer" size={28} color="#fff" className="mr-3" />
                    <Text className="text-white text-xl font-bold tracking-wide">TRUTH</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-[#F44336] py-5 rounded-2xl shadow-lg"
                    onPress={() => handleSelectType('dare')}
                  >
                    <FontAwesome5 name="fire" size={28} color="#fff" className="mr-3" />
                    <Text className="text-white text-xl font-bold tracking-wide">DARE</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            renderQuestion()
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 