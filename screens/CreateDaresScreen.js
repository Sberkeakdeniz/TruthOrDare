import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function CreateDaresScreen({ navigation }) {
  const [newDare, setNewDare] = useState('');
  const [dareType, setDareType] = useState('truth'); // 'truth' or 'dare'
  const [customDares, setCustomDares] = useState({ truth: [], dare: [] });

  useEffect(() => {
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

    loadCustomDares();
  }, []);

  const handleAddDare = async () => {
    if (newDare.trim() === '') {
      Alert.alert('Error', 'Please enter a dare first!');
      return;
    }

    const updatedDares = {
      ...customDares,
      [dareType]: [...customDares[dareType], newDare.trim()]
    };

    setCustomDares(updatedDares);
    setNewDare('');

    try {
      await SecureStore.setItemAsync('customDares', JSON.stringify(updatedDares));
      Alert.alert('Success', 'Your dare has been added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save dare. Please try again.');
    }
  };

  const handleDeleteDare = async (type, index) => {
    const updatedDares = {
      ...customDares,
      [type]: customDares[type].filter((_, i) => i !== index)
    };

    setCustomDares(updatedDares);

    try {
      await SecureStore.setItemAsync('customDares', JSON.stringify(updatedDares));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete dare. Please try again.');
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
              <Text className="text-3xl text-white font-bold mb-1">Create Your Own</Text>
              <Text className="text-base text-white/80">Add custom truths and dares</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-5">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-3 rounded-xl mx-1 ${
                dareType === 'truth' ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={() => setDareType('truth')}
            >
              <MaterialIcons name="question-answer" size={24} color="#fff" className="mr-2" />
              <Text className="text-white text-base font-bold">TRUTH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-3 rounded-xl mx-1 ${
                dareType === 'dare' ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={() => setDareType('dare')}
            >
              <MaterialIcons name="local-fire-department" size={24} color="#fff" className="mr-2" />
              <Text className="text-white text-base font-bold">DARE</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <TextInput
              className="bg-white/10 rounded-xl p-4 text-white text-base min-h-[100px] mb-2.5"
              placeholder={`Enter your ${dareType}...`}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newDare}
              onChangeText={setNewDare}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              className="bg-[#4CAF50] p-4 rounded-xl items-center"
              onPress={handleAddDare}
            >
              <Text className="text-white font-bold text-base">ADD</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <Text className="text-xl text-white font-bold mb-4">
              {dareType === 'truth' ? 'Your Truths' : 'Your Dares'}
            </Text>
            {customDares[dareType].map((dare, index) => (
              <View key={index} className="bg-white/10 rounded-xl p-4 mb-3 flex-row items-center">
                <Text className="flex-1 text-white text-base">{dare}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteDare(dareType, index)}
                  className="ml-3"
                >
                  <AntDesign name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            className="rounded-xl p-4 mt-4"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="info-outline" size={24} color="#E91E63" className="mr-3" />
              <Text className="flex-1 text-white text-sm">
                Your questions will appear randomly in{' '}
                <Text className="text-[#E91E63]">Hot</Text>,{' '}
                <Text className="text-[#E91E63]">Hard</Text>, and{' '}
                <Text className="text-[#E91E63]">Extreme</Text> levels
              </Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 