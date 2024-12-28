import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        className="flex-1 w-full"
      >
        <View className="flex-1 items-center justify-center p-5">
          <View className="flex-row mb-5 items-center">
            <AntDesign 
              name="questioncircleo" 
              size={40} 
              color="#fff" 
              className="mx-2 rotate-[-15deg]" 
            />
            <AntDesign 
              name="exclamationcircleo" 
              size={40} 
              color="#fff" 
              className="mx-2 rotate-[15deg]" 
            />
          </View>
          <Text className="text-4xl text-white font-bold mb-2.5 text-center">
            Truth or Dare
          </Text>
          <Text className="text-lg text-gray-200 text-center mb-10 max-w-[80%]">
            Get ready for an exciting adventure!
          </Text>
          <TouchableOpacity 
            className="bg-white px-10 py-4 rounded-full shadow-lg"
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GameMode')}
          >
            <Text className="text-lg text-purple-900 font-bold">
              Start Playing
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
} 