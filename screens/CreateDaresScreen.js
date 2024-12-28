import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from '../translations/TranslationContext';

export default function CreateDaresScreen({ navigation }) {
  const { strings } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [newDare, setNewDare] = useState('');
  const [dareType, setDareType] = useState('truth');
  const [customDares, setCustomDares] = useState({ truth: [], dare: [] });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (strings && strings.createDares) {
      setIsLoading(false);
    }
  }, [strings]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

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

  const handleAddDare = async () => {
    if (newDare.trim() === '') {
      Alert.alert(
        strings?.createDares?.error || 'Error',
        strings?.createDares?.emptyDare || 'Please enter a dare first!'
      );
      return;
    }

    const updatedDares = {
      ...customDares,
      [dareType]: [...customDares[dareType], newDare.trim()]
    };

    try {
      await SecureStore.setItemAsync('customDares', JSON.stringify(updatedDares));
      setCustomDares(updatedDares);
      setNewDare('');
      Alert.alert(
        strings?.createDares?.success || 'Success',
        strings?.createDares?.dareAdded || 'Your dare has been added!'
      );
    } catch (error) {
      Alert.alert(
        strings?.createDares?.error || 'Error',
        strings?.createDares?.saveFailed || 'Failed to save dare. Please try again.'
      );
    }
  };

  const handleDeleteDare = async (type, index) => {
    Alert.alert(
      strings?.createDares?.confirmDelete || 'Confirm Delete',
      strings?.createDares?.deleteMessage || 'Are you sure you want to delete this item?',
      [
        {
          text: strings?.common?.cancel || 'Cancel',
          style: 'cancel'
        },
        {
          text: strings?.common?.delete || 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedDares = {
              ...customDares,
              [type]: customDares[type].filter((_, i) => i !== index)
            };

            try {
              await SecureStore.setItemAsync('customDares', JSON.stringify(updatedDares));
              setCustomDares(updatedDares);
            } catch (error) {
              Alert.alert(
                strings?.createDares?.error || 'Error',
                strings?.createDares?.deleteFailed || 'Failed to delete dare. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const createFadeInAnimation = (index) => {
    return Animated.sequence([
      Animated.delay(index * 100),
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#1a237e] justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1a237e] pt-[${Platform.OS === 'android' ? StatusBar.currentHeight : 0}px]">
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1"
      >
        <View className="flex-1 p-5">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/15 justify-center items-center mr-4"
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl text-white font-bold mb-1">
                {strings?.createDares?.title || 'Create Your Own'}
              </Text>
              <Text className="text-base text-white/80">
                {strings?.createDares?.subtitle || 'Add custom truths and dares'}
              </Text>
            </View>
          </View>

          {/* Type Selector */}
          <View className="flex-row justify-between mb-6">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-4 rounded-xl mx-1 ${
                dareType === 'truth' ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={() => setDareType('truth')}
            >
              <Ionicons 
                name="help-circle-outline" 
                size={24} 
                color="#fff" 
                style={{ marginRight: 8 }}
              />
              <Text className="text-white text-base font-bold">
                {strings?.gameSetup?.truth || 'TRUTH'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-4 rounded-xl mx-1 ${
                dareType === 'dare' ? 'bg-white/20' : 'bg-white/10'
              }`}
              onPress={() => setDareType('dare')}
            >
              <MaterialIcons 
                name="local-fire-department" 
                size={24} 
                color="#fff" 
                style={{ marginRight: 8 }}
              />
              <Text className="text-white text-base font-bold">
                {strings?.gameSetup?.dare || 'DARE'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View className="mb-6">
            <TextInput
              className="bg-white/10 rounded-xl p-4 text-white text-base min-h-[100px] mb-3"
              placeholder={dareType === 'truth' ? 
                (strings?.createDares?.enterTruth || 'Enter a truth question...') : 
                (strings?.createDares?.enterDare || 'Enter a dare challenge...')
              }
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newDare}
              onChangeText={setNewDare}
              multiline
              maxLength={200}
              style={{ textAlignVertical: 'top' }}
            />
            <TouchableOpacity
              className="bg-[#4CAF50] p-4 rounded-xl items-center flex-row justify-center"
              onPress={handleAddDare}
            >
              <MaterialIcons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-base">
                {strings?.createDares?.save || 'ADD NEW'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* List Section */}
          <Animated.View 
            className="flex-1"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-xl text-white font-bold mb-4">
              {dareType === 'truth' ? 
                (strings?.createDares?.truthTab || 'Your Truth Questions') : 
                (strings?.createDares?.dareTab || 'Your Dare Challenges')
              }
            </Text>
            <ScrollView className="flex-1">
              {customDares[dareType].map((dare, index) => (
                <Animated.View 
                  key={index}
                  style={{
                    opacity: new Animated.Value(1),
                    transform: [{ translateY: 0 }]
                  }}
                  className="bg-white/10 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                      <Text className="text-white font-bold">{index + 1}</Text>
                    </View>
                    <Text className="flex-1 text-white text-base">{dare}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteDare(dareType, index)}
                      className="ml-3 p-2"
                    >
                      <AntDesign name="delete" size={20} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
              {customDares[dareType].length === 0 && (
                <View className="items-center justify-center py-8">
                  <MaterialIcons name="playlist-add" size={48} color="rgba(255, 255, 255, 0.3)" />
                  <Text className="text-white/60 text-base text-center mt-4">
                    {strings?.createDares?.empty || 
                      `No custom ${dareType}s added yet.\nStart adding some!`}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
          
          {!isKeyboardVisible && (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              className="rounded-xl p-4 mt-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="info-outline" size={24} color="#E91E63" className="mr-3" />
                <Text className="flex-1 text-white text-sm">
                  {strings?.createDares?.info || 
                    'Your custom questions will appear in all difficulty levels'}
                </Text>
              </View>
            </LinearGradient>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 