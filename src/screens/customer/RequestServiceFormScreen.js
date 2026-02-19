import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
// import { createInstantRequest } from '../../services/realTimeServiceSystem';
// import auth from '@react-native-firebase/auth';

const RequestServiceFormScreen = ({ navigation, route }) => {
  const { service } = route.params;
  
  const [formData, setFormData] = useState({
    address: '',
    description: '',
    latitude: 24.8607, // Mock location - Karachi
    longitude: 67.0011,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Location/Address is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Problem description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Mock implementation for Expo Go
      // In production, uncomment the Firebase code below
      
      /*
      const currentUser = auth().currentUser;
      
      const requestData = {
        serviceType: service.id,
        description: formData.description.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address.trim(),
        customerName: currentUser?.displayName || '',
        customerPhone: currentUser?.phoneNumber || '',
      };

      const result = await createInstantRequest(requestData);

      if (result.success) {
        // Navigate to offers screen to see provider bids
        navigation.navigate('OfferList', { 
          requestId: result.requestId,
          serviceType: service.name
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to submit request');
      }
      */

      // Mock success for Expo Go - Navigate to offers screen
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('OfferList', { 
          requestId: 'mock_request_123',
          serviceType: service.name,
          serviceIcon: service.icon
        });
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Submit error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={COLORS.textBlack} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <View style={styles.serviceIcon}>
            <Text style={styles.serviceEmoji}>{service.icon}</Text>
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>Starting from {service.priceRange}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Location Badge */}
          <View style={styles.locationBadge}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M10 2 C6.5 2 4 4.5 4 8 C4 12 10 18 10 18 C10 18 16 12 16 8 C16 4.5 13.5 2 10 2 Z M10 10 A2 2 0 1 1 10 6 A2 2 0 1 1 10 10 Z" fill={COLORS.primaryGreen} />
            </Svg>
            <Text style={styles.locationText}>Using your current location</Text>
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Location / Address *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Enter your address or landmark"
              placeholderTextColor={COLORS.textGrey}
              value={formData.address}
              onChangeText={(value) => {
                setFormData({ ...formData, address: value });
                if (errors.address) setErrors({ ...errors, address: null });
              }}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            <Text style={styles.helperText}>Provider will come to this location</Text>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>What's the problem? *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe the issue you're facing..."
              placeholderTextColor={COLORS.textGrey}
              value={formData.description}
              onChangeText={(value) => {
                setFormData({ ...formData, description: value });
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            <Text style={styles.helperText}>Be specific to get better offers</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.white} />
                <Text style={styles.loadingText}>Finding nearby providers...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Find Providers & Get Offers</Text>
            )}
          </TouchableOpacity>

          {/* How It Works */}
          <View style={styles.howItWorksCard}>
            <Text style={styles.howItWorksTitle}>🚀 How It Works</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Submit your request instantly</Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Nearby providers send price offers</Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Compare & choose the best offer</Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>Provider arrives at your location</Text>
              </View>
            </View>
          </View>

          <Text style={styles.noteText}>
            No scheduling needed! Get instant service from nearby professionals.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  scrollView: {
    flex: 1,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F9F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textBlack,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginTop: 4,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9F9F9',
  },
  dateTimeText: {
    fontSize: 15,
    color: COLORS.textBlack,
    marginLeft: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.primaryGreen,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 12,
  },
  howItWorksCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  howItWorksTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 12,
  },
  stepsList: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  stepText: {
    fontSize: 13,
    color: COLORS.textBlack,
    flex: 1,
  },
});

export default RequestServiceFormScreen;
