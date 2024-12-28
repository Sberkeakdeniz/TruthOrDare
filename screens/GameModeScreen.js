import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

export default function GameModeScreen({ navigation }) {
  const handleModeSelect = (mode) => {
    navigation.navigate('PlayerSetup', { gameMode: mode });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a237e] pt-[${Platform.OS === 'android' ? StatusBar.currentHeight : 0}px]">
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1"
      >
        <View className="flex-1 p-5">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/15 justify-center items-center mb-5"
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="mb-10">
            <Text className="text-4xl text-white font-bold mb-2">Select Mode</Text>
            <Text className="text-lg text-white/80">Choose your game style</Text>
          </View>

          <View className="flex-1 justify-center space-y-6 pb-[10%]">
            <TouchableOpacity
              className="h-[22%] rounded-3xl overflow-hidden shadow-lg"
              onPress={() => handleModeSelect('couples')}
            >
              <LinearGradient
                colors={['#FF4B91', '#A91079']}
                className="flex-1 p-6"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="absolute inset-0 bg-white/10 rounded-3xl" />
                <View className="flex-1 flex-row items-center z-10">
                  <View className="w-20 h-20 rounded-full bg-pink-200/20 justify-center items-center mr-5 border border-white/30">
                    <MaterialIcons name="favorite" size={46} color="#fff" />
                  </View>
                  <View className="flex-1 pr-2.5">
                    <Text className="text-2xl font-bold text-white mb-2">Couples Mode</Text>
                    <Text className="text-base text-white/90 leading-[22px]">
                      Perfect for date night or couples gathering
                    </Text>
                  </View>
                  <AntDesign name="right" size={28} color="#fff" className="opacity-90" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="h-[22%] rounded-3xl overflow-hidden shadow-lg"
              onPress={() => handleModeSelect('friends')}
            >
              <LinearGradient
                colors={['#00BCD4', '#3F51B5']}
                className="flex-1 p-6"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="absolute inset-0 bg-white/10 rounded-3xl" />
                <View className="flex-1 flex-row items-center z-10">
                  <View className="w-20 h-20 rounded-full bg-white/20 justify-center items-center mr-5 border border-white/30">
                    <FontAwesome5 name="user-friends" size={40} color="#fff" />
                  </View>
                  <View className="flex-1 pr-2.5">
                    <Text className="text-2xl font-bold text-white mb-2">Friends Mode</Text>
                    <Text className="text-base text-white/90 leading-[22px]">
                      Fun challenges for friend groups
                    </Text>
                  </View>
                  <AntDesign name="right" size={28} color="#fff" className="opacity-90" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 