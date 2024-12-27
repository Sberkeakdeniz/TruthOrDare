import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
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
              <Text style={styles.title}>Create Your Own</Text>
              <Text style={styles.subtitle}>Add custom truths and dares</Text>
            </View>
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, dareType === 'truth' && styles.selectedType]}
              onPress={() => setDareType('truth')}
            >
              <MaterialIcons name="question-answer" size={24} color="#fff" />
              <Text style={styles.typeButtonText}>TRUTH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, dareType === 'dare' && styles.selectedType]}
              onPress={() => setDareType('dare')}
            >
              <MaterialIcons name="local-fire-department" size={24} color="#fff" />
              <Text style={styles.typeButtonText}>DARE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Enter your ${dareType}...`}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newDare}
              onChangeText={setNewDare}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddDare}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listContainer}>
            <Text style={styles.sectionTitle}>
              {dareType === 'truth' ? 'Your Truths' : 'Your Dares'}
            </Text>
            {customDares[dareType].map((dare, index) => (
              <View key={index} style={styles.dareItem}>
                <Text style={styles.dareText}>{dare}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteDare(dareType, index)}
                  style={styles.deleteButton}
                >
                  <AntDesign name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.infoContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.infoContent}>
              <MaterialIcons name="info-outline" size={24} color="#E91E63" />
              <Text style={styles.infoText}>
                Your questions will appear randomly in{' '}
                <Text style={styles.infoHighlight}>Hot</Text>,{' '}
                <Text style={styles.infoHighlight}>Hard</Text>, and{' '}
                <Text style={styles.infoHighlight}>Extreme</Text> levels
              </Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

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
    marginBottom: 30,
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
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 5,
    gap: 8,
  },
  selectedType: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dareItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  dareText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  infoContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  infoHighlight: {
    color: '#E91E63',
    fontWeight: 'bold',
  },
}); 