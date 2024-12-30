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
import { getQuestions } from '../data/questions_manager';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from '../translations/TranslationContext';

const { width } = Dimensions.get('window');

export default function PlayScreen({ navigation, route }) {
  const { players, gameMode, difficulty } = route.params;
  const { strings, language } = useTranslation();
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
    try {
      // Get questions for current language and difficulty
      const questions = getQuestions(language, difficulty, gameMode, type);
      let allQuestions = [];
      
      // If no questions found for this combination, fall back to English
      if (!questions || questions.length === 0) {
        console.warn(`No questions found for combination: ${language}, ${difficulty}, ${gameMode}, ${type}`);
        const fallbackQuestions = getQuestions('en', difficulty, gameMode, type);
        allQuestions = fallbackQuestions.map(q => ({ text: q, isCustom: false }));
      } else {
        // Map the questions to include isCustom flag
        allQuestions = questions.map(q => ({ text: q, isCustom: false }));
        
        // Only include custom dares if difficulty is not 'soft'
        if (difficulty !== 'soft' && customDares[type]) {
          const userQuestions = customDares[type] || [];
          const formattedUserQuestions = userQuestions.map(q => ({
            text: q,
            isCustom: true
          }));
          
          allQuestions = [
            ...allQuestions,
            ...formattedUserQuestions
          ];
        }
      }

      // Filter out already revealed questions
      const availableQuestions = allQuestions.filter(q => !revealedQuestions[type].has(q.text));
      
      // If all questions have been revealed, reset the set and use all questions
      if (availableQuestions.length === 0) {
        revealedQuestions[type].clear();
        setRevealedQuestions({ ...revealedQuestions });
        return getRandomQuestion(type);
      }

      // Get a random question from available ones
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const selectedQuestion = availableQuestions[randomIndex];
      
      // Mark question as revealed
      revealedQuestions[type].add(selectedQuestion.text);
      setRevealedQuestions({ ...revealedQuestions });
      
      return selectedQuestion;
    } catch (error) {
      console.error('Error getting random question:', error);
      // Return a simple fallback question in case of error
      return {
        text: type === 'truth' ? 
          'Tell us something interesting about yourself.' :
          'Do your best dance move.',
        isCustom: false
      };
    }
  };

  const animateQuestionSelection = (type) => {
    setIsChoosingQuestion(true);
    questionAnimValue.setValue(0);
    
    // Store the final question but don't show it immediately
    const finalQuestion = getRandomQuestion(type);
    const questions = getQuestions(language, difficulty, gameMode, type);
    let questionsList = [];

    if (!questions || questions.length === 0) {
      // Fall back to English questions if none found for current language
      const fallbackQuestions = getQuestions('en', difficulty, gameMode, type);
      questionsList = fallbackQuestions.map(q => ({ text: q, isCustom: false }));
    } else {
      questionsList = questions.map(q => ({ text: q, isCustom: false }));
      
      // Only include custom dares if difficulty is not 'soft'
      if (difficulty !== 'soft' && customDares[type]) {
        const userQuestions = customDares[type] || [];
        const formattedUserQuestions = userQuestions.map(q => ({
          text: q,
          isCustom: true
        }));
        
        questionsList = [
          ...questionsList,
          ...formattedUserQuestions
        ];
      }
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
      
      currentIndex = (currentIndex + 1) % questionsList.length;
      setQuestion(questionsList[currentIndex]);
    }, currentSpeed);

    // Create a smooth emergence animation sequence
    Animated.parallel([
      // Scale and fade animation
      Animated.timing(questionAnimValue, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // Custom easing for smooth emergence
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
    const radius = wheelSize / 2 - 60;
    const angleStep = (2 * Math.PI) / players.length;
    const textWidth = 100; // Width of text container
    const textHeight = 24; // Height of text container

    return players.map((player, index) => {
      let sectionCenterAngle;
      let adjustedRadius;

      // Specific calculations based on player count
      switch (players.length) {
        case 2:
          sectionCenterAngle = index * Math.PI - Math.PI / 2; // 180 degrees apart
          adjustedRadius = radius * 0.7;
          break;
        case 3:
          sectionCenterAngle = (index * angleStep) + (angleStep / 2) - Math.PI / 2;
          adjustedRadius = radius * 0.8;
          break;
        case 4:
          sectionCenterAngle = (index * angleStep) + (angleStep / 2) - Math.PI / 2;
          adjustedRadius = radius * 0.85;
          break;
        default:
          sectionCenterAngle = (index * angleStep) + (angleStep / 2) - Math.PI / 2;
          adjustedRadius = radius * 0.9;
      }
      
      // Calculate position based on the center angle
      const x = adjustedRadius * Math.cos(sectionCenterAngle);
      const y = adjustedRadius * Math.sin(sectionCenterAngle);

      // Calculate the position to center the text
      const textCenterX = x - (textWidth / 2);
      const textCenterY = y - (textHeight / 2);

      // Calculate text rotation angle
      const textRotationAngle = sectionCenterAngle + Math.PI/2;
      
      // For 2 players, keep text horizontal
      const finalRotation = players.length === 2 
        ? (index === 0 ? 0 : Math.PI) 
        : textRotationAngle;

      return (
        <Animated.View
          key={index}
          className={`absolute ${isSpinning ? 'opacity-90 scale-90' : 'opacity-100'}`}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: textWidth,
            height: textHeight,
            transform: [
              { translateX: textCenterX },
              { translateY: textCenterY },
              { rotate: `${finalRotation}rad` },
            ],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text 
            className={`text-white text-lg font-bold ${isSpinning ? 'opacity-75' : ''}`}
            style={{ 
              textAlign: 'center',
              width: '100%',
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {player.name}
          </Text>
        </Animated.View>
      );
    });
  };

  const renderSeparators = () => {
    const angleStep = (2 * Math.PI) / players.length;
    const wheelRadius = width * 0.425;
    const centerLogoRadius = 48;

    return players.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top (-90 degrees)
      return (
        <View
          key={`separator-${index}`}
          className="absolute"
          style={{
            position: 'absolute',
            width: 2,
            height: wheelRadius * 2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            left: '50%',
            top: '50%',
            transform: [
              { translateX: -1 },
              { translateY: -wheelRadius },
              { rotate: `${(angle * 180) / Math.PI}deg` },
            ],
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: centerLogoRadius * 2,
              backgroundColor: '#1a237e',
              top: wheelRadius - centerLogoRadius,
            }}
          />
        </View>
      );
    });
  };

  const renderSpinWheel = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl text-white font-bold mb-8 tracking-tight">
          {strings.gameSetup.whoNext}
        </Text>
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
              {strings.gameSetup.chooseType}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderQuestion = () => {
    return (
      <Animated.View
        className="flex-1 px-5"
        style={{
          transform: [
            { scale: questionAnimValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })},
            { translateY: questionAnimValue.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            })},
          ],
          opacity: questionAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
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
                <Animated.View 
                  className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                  style={{
                    transform: [{
                      scale: questionAnimValue.interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [0.6, 1.1, 1],
                      }),
                    }],
                    opacity: questionAnimValue.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [0, 1, 1],
                    }),
                  }}
                >
                  <MaterialIcons
                    name={selectedType === 'truth' ? 'question-answer' : 'local-fire-department'}
                    size={32}
                    color="#fff"
                  />
                </Animated.View>
                <Animated.Text 
                  className="text-white text-xl font-bold tracking-wider ml-4"
                  style={{
                    transform: [{
                      translateX: questionAnimValue.interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [20, -10, 0],
                      }),
                    }],
                    opacity: questionAnimValue.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [0, 1, 1],
                    }),
                  }}
                >
                  {selectedType === 'truth' ? strings.gameSetup.truth : strings.gameSetup.dare}
                </Animated.Text>
                {question.isCustom && (
                  <Animated.View 
                    className="bg-[#E91E63] px-3 py-1 rounded-full ml-3"
                    style={{
                      transform: [{
                        scale: questionAnimValue.interpolate({
                          inputRange: [0, 0.8, 1],
                          outputRange: [0.5, 1.1, 1],
                        }),
                      }],
                      opacity: questionAnimValue.interpolate({
                        inputRange: [0, 0.8, 1],
                        outputRange: [0, 1, 1],
                      }),
                    }}
                  >
                    <Text className="text-white text-xs font-bold tracking-wider">{strings.common.custom}</Text>
                  </Animated.View>
                )}
              </View>
              <Animated.View
                className="items-center"
                style={{
                  transform: [{
                    translateY: questionAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  }],
                  opacity: questionAnimValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.8, 1],
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
            {strings.common.next}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
                {strings.difficulties[difficulty]} {strings.gameSetup.mode}
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
                    <Text className="text-white text-xl font-bold tracking-wide">{strings.gameSetup.truth}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-[#F44336] py-5 rounded-2xl shadow-lg"
                    onPress={() => handleSelectType('dare')}
                  >
                    <FontAwesome5 name="fire" size={28} color="#fff" className="mr-3" />
                    <Text className="text-white text-xl font-bold tracking-wide">{strings.gameSetup.dare}</Text>
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