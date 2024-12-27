import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a237e', '#4a148c', '#311b92']}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AntDesign name="questioncircleo" size={40} color="#fff" style={styles.icon} />
            <AntDesign name="exclamationcircleo" size={40} color="#fff" style={[styles.icon, styles.secondIcon]} />
          </View>
          <Text style={styles.title}>Truth or Dare</Text>
          <Text style={styles.subtitle}>Get ready for an exciting adventure!</Text>
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GameMode')}
          >
            <Text style={styles.buttonText}>Start Playing</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 8,
    transform: [{rotate: '-15deg'}],
  },
  secondIcon: {
    transform: [{rotate: '15deg'}],
  },
  title: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: width * 0.8,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 18,
    color: '#4a148c',
    fontWeight: 'bold',
  },
}); 