import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getRequestById, startJob, completeJob, startLocationTracking } from '../../services/marketplaceService';

const ActiveJobScreenMarketplace = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [serviceFee, setServiceFee] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
    
    // Refresh every 5 seconds to get updated location
    const interval = setInterval(loadRequest, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const loadRequest = async () => {
    const result = await getRequestById(requestId);
    if (result.success) {
      setRequest(result.request);
    }
    setLoading(false);
  };

  const handleStartJob = async () => {
    Alert.alert(
      'Start Job',
      'Have you arrived at the customer location?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Start Job',
          onPress: async () => {
            const result = await startJob(requestId);
            if (result.success) {
              Alert.alert('Job Started! ✅', 'Good luck with the service!');
              loadRequest();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleCompleteJob = async () => {
    if (!serviceFee || parseInt(serviceFee) <= 0) {
      Alert.alert('Service Fee Required', 'Please enter the service fee amount');
      return;
    }

    const fee = parseInt(serviceFee);
    const total = (request.travelFee || 0) + fee;

    Alert.alert(
      'Complete Job',
      `Travel