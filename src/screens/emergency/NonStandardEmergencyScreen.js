import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar, SafeAreaView, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { createNonStandardEmergencyRequest } from '../../services/emergencyService';

const NonStandardEmergencyScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { location, address } = route.params;
  
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (mediaFiles.length >= 3) {
      Alert.alert('Limit Reached', 'You can upload maximum 3 images');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMediaFiles([...mediaFiles, result.assets[0]]);
    }
  };

  const takePhoto = async () => {
    if (mediaFiles.length >= 3) {
      Alert.alert('Limit Reached', 'You can upload maximum 3 images');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMediaFiles([...mediaFiles, result.assets[0]]);
    }
  };

  const removeMedia = (index) => {
    const newMedia = [...mediaFiles];
    newMedia.splice(index, 1);
    setMediaFiles(newMedia);
  };

  const handleSubmit = async () => {
    if (!description || description.trim().length < 10) {
      Alert.alert('Description Required', 'Please describe your problem (minimum 10 characters)');
      return;
    }

    setLoading(true);

    try {
      const mediaUrls = mediaFiles.map(file => file.uri);
      
      const result = await createNonStandardEmergencyRequest(
        { ...location, address },
        description,
        mediaUrls
      );

      setLoading(false);

      if (result.success) {
        navigation.navigate('EmergencySearching', {
          request: result.data,
          category: 'non_standard'
        });
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create emergency request');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="#F59E0B" />

      {/* Header */}
      <View style={styles.emergencyHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.emergencyTitle}>Non-Standard Emergency</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Display */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M10 2C6.5 2 4 4.5 4 8C4 12 10 18 10 18C10 18 16 12 16 8C16 4.5 13.5 2 10 2ZM10 10A2 2 0 1 1 10 6A2 2 0 1 1 10 10Z" fill="#F59E0B" />
          </Svg>
          <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
            {address}
          </Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 18C11.4 18 11 17.6 11 17C11 16.4 11.4 16 12 16C12.6 16 13 16.4 13 17C13 17.6 12.6 18 12 18ZM13 13H11V7H13V13Z" fill="#92400E" />
          </Svg>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Describe your problem and upload photos. Multiple providers will send you custom offers. Choose the best one!
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Describe Your Problem <Text style={styles.required}>*</Text>
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Be specific about the issue, location in house, and urgency
          </Text>
          
          <TextInput
            style={[styles.descriptionInput, { 
              backgroundColor: colors.inputBackground, 
              borderColor: colors.inputBorder,
              color: colors.text 
            }]}
            placeholder="E.g., Water coming from ceiling in bedroom, not sure if it's from AC or pipe. Need urgent help..."
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {description.length}/500 characters (minimum 10)
          </Text>
        </View>

        {/* Media Upload Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Add Photos (Optional)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Photos help providers understand the problem better (max 3)
          </Text>

          {/* Upload Buttons */}
          <View style={styles.uploadButtons}>
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={takePhoto}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 15.2C13.77 15.2 15.2 13.77 15.2 12C15.2 10.23 13.77 8.8 12 8.8C10.23 8.8 8.8 10.23 8.8 12C8.8 13.77 10.23 15.2 12 15.2ZM9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" fill={colors.primary} />
              </Svg>
              <Text style={[styles.uploadButtonText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={pickImage}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill={colors.primary} />
              </Svg>
              <Text style={[styles.uploadButtonText, { color: colors.text }]}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <View style={styles.mediaPreview}>
              {mediaFiles.map((file, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: file.uri }} style={styles.mediaImage} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeMedia(index)}
                  >
                    <Svg width="20" height="20" viewBox="0 0 20 20">
                      <Path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM13 12L12 13L10 11L8 13L7 12L9 10L7 8L8 7L10 9L12 7L13 8L11 10L13 12Z" fill="#DC2626" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Pricing Info */}
        <View style={[styles.pricingCard, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
          <Text style={styles.pricingTitle}>💰 How Pricing Works</Text>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingDot}>•</Text>
            <Text style={styles.pricingText}>Multiple providers will send you custom offers</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingDot}>•</Text>
            <Text style={styles.pricingText}>Compare prices, ratings, and ETAs</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingDot}>•</Text>
            <Text style={styles.pricingText}>Choose the best offer that fits your budget</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingDot}>•</Text>
            <Text style={styles.pricingText}>No obligation until you accept an offer</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Broadcasting...' : 'Broadcast to Providers'}
          </Text>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM8 15V5L14 10L8 15Z" fill="#FFFFFF" />
          </Svg>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  required: {
    color: '#DC2626',
  },
  descriptionInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  mediaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  pricingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
  },
  pricingItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pricingDot: {
    fontSize: 16,
    color: '#92400E',
    marginRight: 8,
  },
  pricingText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default NonStandardEmergencyScreen;
