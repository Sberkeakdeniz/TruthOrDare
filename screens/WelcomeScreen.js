import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Animated, Easing, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '../translations/TranslationContext';
import React, { useRef, useEffect, useState } from 'react';

export default function WelcomeScreen({ navigation }) {
  const { strings, language, changeLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateRightAnim = useRef(new Animated.Value(0)).current;
  const rotateLeftAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const languages = [
    { code: 'en', flag: '\uD83C\uDDFA\uD83C\uDDF8', name: 'English' },
    { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
  ];

  useEffect(() => {
    if (strings && strings.welcome) {
      setIsLoading(false);
    }
  }, [strings]);

  useEffect(() => {
    // Continuous pulse animation for the container
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Left icon rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateLeftAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotateLeftAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Right icon rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateRightAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotateRightAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStartPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('PlayerSetup', { gameMode: 'friends' });
    });
  };

  const rotateLeft = rotateLeftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const rotateRight = rotateRightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '-15deg'],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#1a237e] justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1 w-full"
      >
        {/* Decorative background circles */}
        <View className="absolute inset-0 overflow-hidden">
          <View className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/5" />
          <View className="absolute top-40 -right-10 w-32 h-32 rounded-full bg-white/5" />
          <View className="absolute bottom-20 -left-10 w-36 h-36 rounded-full bg-white/5" />
        </View>

        <View className="flex-1 items-center justify-center p-5">
          {/* Language selector */}
          <View className="absolute top-12 right-8">
            <TouchableOpacity
              className="flex-row items-center bg-white/10 px-4 py-2.5 rounded-full border border-white/20"
              onPress={() => setIsLanguageMenuOpen(true)}
            >
              <Text className="text-xl mr-2">
                {languages.find(l => l.code === language)?.flag}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>

            <Modal
              visible={isLanguageMenuOpen}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setIsLanguageMenuOpen(false)}
            >
              <TouchableOpacity
                className="flex-1 bg-black/50"
                activeOpacity={1}
                onPress={() => setIsLanguageMenuOpen(false)}
              >
                <View className="absolute top-[100] right-8 bg-white rounded-xl overflow-hidden shadow-lg">
                  {languages.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      className={`px-6 py-3 flex-row items-center ${
                        language === lang.code ? 'bg-purple-50' : ''
                      }`}
                      onPress={() => handleLanguageSelect(lang.code)}
                    >
                      <Text className="text-xl mr-3">{lang.flag}</Text>
                      <Text className={`text-base ${
                        language === lang.code ? 'text-purple-900 font-medium' : 'text-gray-700'
                      }`}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          {/* Game logo/icons */}
          <Animated.View 
            className="mb-8 items-center"
            style={{ transform: [{ translateY: bounce }] }}
          >
            <Animated.View 
              className="bg-white/10 p-8 rounded-full border-4 border-white/20"
              style={{ transform: [{ scale: pulseAnim }] }}
            >
              <View className="flex-row items-center space-x-4">
                <Animated.View style={{ transform: [{ rotate: rotateLeft }] }}>
                  <View className="bg-white/20 p-3 rounded-full">
                    <MaterialCommunityIcons 
                      name="cards" 
                      size={48} 
                      color="#fff"
                    />
                  </View>
                </Animated.View>
                <Animated.View style={{ transform: [{ rotate: rotateRight }] }}>
                  <View className="bg-white/20 p-3 rounded-full">
                    <MaterialCommunityIcons 
                      name="party-popper" 
                      size={48} 
                      color="#fff"
                    />
                  </View>
                </Animated.View>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Title and subtitle */}
          <View className="items-center mb-12">
            <Text className="text-5xl text-white font-bold mb-4 text-center">
              {strings?.welcome?.title || 'Truth or Dare'}
            </Text>
            <Text className="text-lg text-white/80 text-center max-w-[80%] font-medium">
              Get ready for an exciting adventure!
            </Text>
          </View>

          {/* Main buttons */}
          <View className="w-full space-y-4">
            {/* Start game button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity 
                className="bg-white px-12 py-5 rounded-2xl shadow-lg"
                activeOpacity={0.9}
                onPress={handleStartPress}
              >
                <View className="flex-row items-center justify-center">
                  <FontAwesome5 name="dice" size={24} color="#4a148c" className="mr-3" />
                  <Text className="text-xl text-purple-900 font-bold ml-2">
                    {strings?.welcome?.startGame || 'Start Game'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
} 