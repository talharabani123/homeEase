import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResetOnboardingScreen = ({ navigation }) => {
  const [status, setStatus] = useState('');

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@homeease_onboarding_complete');
      const allKeys = await AsyncStorage.getAllKeys();
      setStatus(`Onboarding: ${value ? 'Complete ✅' : 'Not Complete ❌'}\n\nAll Keys:\n${allKeys.join('\n')}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('@homeease_onboarding_complete');
      Alert.alert(
        'Success!',
        'Onboarding flag cleared. Close and restart the app to see the full flow:\n\n1. Splash Screen\n2. Onboarding 1-3\n3. Role Selection',
        [{ text: 'OK' }]
      );
      checkOnboardingStatus();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data?',
      'This will clear ALL app data including user accounts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                'Success!',
                'All app data cleared. Restart the app.',
                [{ text: 'OK' }]
              );
              checkOnboardingStatus();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Onboarding</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <TouchableOpacity style={styles.button} onPress={checkOnboardingStatus}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.buttonText}>Check Status</Text>
          </TouchableOpacity>
          {status ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reset Options</Text>
          
          <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={resetOnboarding}>
            <Ionicons name="refresh" size={24} color="#FF9800" />
            <Text style={styles.buttonText}>Reset Onboarding Only</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllData}>
            <Ionicons name="trash" size={24} color="#F44336" />
            <Text style={styles.buttonText}>Clear All App Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            After resetting, close the app completely and restart it to see the changes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dangerButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ResetOnboardingScreen;
