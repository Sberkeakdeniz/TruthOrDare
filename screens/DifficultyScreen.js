import React, { useContext } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from '../translations/TranslationContext';
import { PremiumContext } from '../App';
import { presentPaywallIfNeeded } from '../utils/purchases';

const DIFFICULTIES = [
  {
    id: 'soft',
    title: 'Soft',
    icon: 'sentiment-satisfied',
    iconFamily: 'MaterialIcons',
    colors: ['#4CAF50', '#388E3C'],
    description: 'Keep it light and fun',
    isPremium: false
  },
  {
    id: 'hot',
    title: 'Hot',
    icon: 'whatshot',
    iconFamily: 'MaterialIcons',
    colors: ['#FF9800', '#F57C00'],
    description: 'Spice things up a bit',
    isPremium: true
  },
  {
    id: 'hard',
    title: 'Hard',
    icon: 'grin-hearts',
    iconFamily: 'FontAwesome5',
    colors: ['#F44336', '#D32F2F'],
    description: 'Take it to the next level',
    isPremium: true
  },
  {
    id: 'extreme',
    title: 'Extreme',
    icon: 'grin-tongue-wink',
    iconFamily: 'FontAwesome5',
    colors: ['#9C27B0', '#7B1FA2'],
    description: 'No limits, pure fun',
    isPremium: true
  }
];

export default function DifficultyScreen({ navigation, route }) {
  const { players, gameMode } = route.params;
  const { strings } = useTranslation();
  const { isPremium, setIsPremium } = useContext(PremiumContext);

  const handleSelectDifficulty = async (difficulty) => {
    if (difficulty.isPremium && !isPremium) {
      try {
        const paywallResult = await presentPaywallIfNeeded();
        if (paywallResult) {
          // Wait a moment for the paywall to close
          setTimeout(() => {
            setIsPremium(true);
            navigation.navigate('Play', { players, gameMode, difficulty: difficulty.id });
          }, 500);
        }
      } catch (error) {
        console.error('Error handling purchase:', error);
      }
    } else {
      navigation.navigate('Play', { players, gameMode, difficulty: difficulty.id });
    }
  };

  const handleCreateDares = async () => {
    if (!isPremium) {
      try {
        const paywallResult = await presentPaywallIfNeeded();
        if (paywallResult) {
          // Wait a moment for the paywall to close
          setTimeout(() => {
            setIsPremium(true);
            navigation.navigate('CreateDares');
          }, 500);
        }
      } catch (error) {
        console.error('Error handling purchase:', error);
      }
    } else {
      navigation.navigate('CreateDares');
    }
  };

  const getDifficultyStyle = (difficulty) => {
    if (!difficulty.isPremium || isPremium) {
      return "opacity-100";
    }
    return "opacity-70";
  };

  return (
    <SafeAreaView className={`flex-1 bg-[#1a237e] pt-[${Platform.OS === 'android' ? StatusBar.currentHeight : 0}px]`}>
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
                {strings?.difficulty?.selectDifficulty || 'Choose Difficulty'}
              </Text>
              <Text className="text-base text-white/80">
                {strings?.difficulty?.warning || 'Select how daring you want to be'}
              </Text>
            </View>
          </View>

          <View className="flex-1 justify-center space-y-4">
            {DIFFICULTIES.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                className={`h-[11%] rounded-2xl overflow-hidden shadow-lg ${getDifficultyStyle(difficulty)}`}
                onPress={() => handleSelectDifficulty(difficulty)}
              >
                <LinearGradient
                  colors={difficulty.colors}
                  className="flex-1 p-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="absolute inset-0 bg-white/10 rounded-2xl" />
                  <View className="flex-1 flex-row items-center z-10">
                    <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center mr-4">
                      {difficulty.iconFamily === 'MaterialIcons' ? (
                        <MaterialIcons name={difficulty.icon} size={32} color="#fff" />
                      ) : (
                        <FontAwesome5 name={difficulty.icon} size={32} color="#fff" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-white">
                        {strings?.difficulties?.[difficulty.id] || difficulty.title}
                      </Text>
                      <Text className="text-sm text-white/80">{difficulty.description}</Text>
                    </View>
                    <View className="flex-row items-center">
                      {difficulty.isPremium && !isPremium && (
                        <MaterialIcons name="lock" size={20} color="#fff" className="mr-2" />
                      )}
                      <AntDesign name="arrowright" size={24} color="#fff" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className={`mt-4 bg-white/10 rounded-2xl p-4 border border-white/20 ${!isPremium ? 'opacity-70' : 'opacity-100'}`}
            onPress={handleCreateDares}
          >
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="add-circle-outline" size={24} color="#fff" className="mr-2" />
              {!isPremium && <MaterialIcons name="lock" size={20} color="#fff" className="mr-2" />}
              <Text className="text-white text-lg font-semibold ml-2">
                {strings?.createDares?.title || 'Create Custom Dares'}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="mt-4">
            <Text className="text-white/60 text-center text-sm">
              {strings?.createDares?.info || 'Custom dares will appear in all difficulty levels'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 