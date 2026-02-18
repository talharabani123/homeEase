import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar, SafeAreaView, Alert, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
  </Svg>
);

const CameraIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const ImageIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Path d="M4 4l8 8M12 4l-8 8" stroke="#FFF" strokeWidth="2" />
  </Svg>
);

const ServiceRequestScreen = ({ navigation, route }) => {
  const { category } = route.params || { category: { name: 'Service', color: COLORS.primaryGreen } };
  
  const [problemDescription, setProblemDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [urgency, setUrgency] = useState('normal'); // 'normal' or 'urgent'
  const [location, setLocation] = useState({
    address: 'F-7, Islamabad, Pakistan',
    coordinates: { latitude: 33.7294, longitude: 73.0931 },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // TODO: Auto-fetch GPS location
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = () => {
    // TODO: Implement expo-location
    console.log('Fetching current location...');
    // Mock location for now
  };

  const handleImagePicker = (source) => {
    // TODO: Implement expo-image-picker
    Alert.alert(
      'Image Upload',
      `Image picker will be implemented with expo-image-picker\nSource: ${source}`,
      [{ text: 'OK' }]
    );
    
    // Mock image upload
    const mockImage = {
      id: Date.now(),
      uri: 'https://via.placeholder.com/150',
      source: source,
    };
    setUploadedImages([...uploadedImages, mockImage]);
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

  const handleLocationChange = () => {
    // TODO: Open map picker
    Alert.alert(
      'Location Picker',
      'Map location picker will be implemented',
      [{ text: 'OK' }]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!problemDescription.trim()) {
      newErrors.problemDescription = 'Please describe your problem';
    } else if (problemDescription.trim().length < 10) {
      newErrors.problemDescription = 'Description must be at least 10 characters';
    }
    
    if (!location.address) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const requestData = {
        category: category.name,
        problemDescription,
        images: uploadedImages,
        urgency,
        location,
        timestamp: new Date().toISOString(),
      };
      
      console.log('Service Request:', requestData);
      
      // TODO: Create service request API call
      // Navigate to matching screen
      navigation.navigate('ProviderMatching', { requestData });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request {category.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          <Text style={[styles.categoryText, { color: category.color }]}>
            {category.name} Service
          </Text>
        </View>

        {/* Problem Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe Your Problem</Text>
          <Text style={styles.sectionSubtitle}>
            Please provide details about the issue you're facing
          </Text>
          <TextInput
            style={[styles.textArea, errors.problemDescription && styles.inputError]}
            placeholder="Example: My kitchen sink is leaking and water is dripping from the pipe under the sink..."
            placeholderTextColor={COLORS.textGrey}
            value={problemDescription}
            onChangeText={(text) => {
              setProblemDescription(text);
              if (errors.problemDescription) setErrors({ ...errors, problemDescription: null });
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {errors.problemDescription && (
            <Text style={styles.errorText}>{errors.problemDescription}</Text>
          )}
          <Text style={styles.characterCount}>
            {problemDescription.length} characters
          </Text>
        </View>

        {/* Upload Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Images (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Add photos to help providers understand the problem better
          </Text>

          {/* Image Grid */}
          {uploadedImages.length > 0 && (
            <View style={styles.imageGrid}>
              {uploadedImages.map((image) => (
                <View key={image.id} style={styles.imageContainer}>
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageText}>📷</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(image.id)}
                  >
                    <CloseIcon />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Upload Buttons */}
          <View style={styles.uploadButtonsContainer}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePicker('camera')}
            >
              <CameraIcon />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePicker('gallery')}
            >
              <ImageIcon />
              <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            You can upload up to 5 images (Max 5MB each)
          </Text>
        </View>

        {/* Urgency Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Urgency</Text>
          <Text style={styles.sectionSubtitle}>
            How urgent is this service request?
          </Text>

          <View style={styles.urgencyContainer}>
            <TouchableOpacity
              style={[
                styles.urgencyButton,
                urgency === 'normal' && styles.urgencyButtonActive,
              ]}
              onPress={() => setUrgency('normal')}
            >
              <View style={styles.urgencyIconContainer}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke={urgency === 'normal' ? COLORS.primaryGreen : COLORS.textGrey}
                    strokeWidth="2"
                    fill="none"
                  />
                  <Path
                    d="M12 6v6l4 4"
                    stroke={urgency === 'normal' ? COLORS.primaryGreen : COLORS.textGrey}
                    strokeWidth="2"
                    fill="none"
                  />
                </Svg>
              </View>
              <View style={styles.urgencyTextContainer}>
                <Text
                  style={[
                    styles.urgencyTitle,
                    urgency === 'normal' && styles.urgencyTitleActive,
                  ]}
                >
                  Normal
                </Text>
                <Text style={styles.urgencyDescription}>
                  Within 24 hours
                </Text>
              </View>
              {urgency === 'normal' && (
                <View style={styles.checkmark}>
                  <Svg width="20" height="20" viewBox="0 0 20 20">
                    <Circle cx="10" cy="10" r="10" fill={COLORS.primaryGreen} />
                    <Path d="M6 10l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.urgencyButton,
                urgency === 'urgent' && styles.urgencyButtonActiveUrgent,
              ]}
              onPress={() => setUrgency('urgent')}
            >
              <View style={styles.urgencyIconContainer}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                    fill={urgency === 'urgent' ? '#FF4444' : COLORS.textGrey}
                  />
                  <Text
                    x="12"
                    y="16"
                    fontSize="12"
                    fill="#FFF"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    !
                  </Text>
                </Svg>
              </View>
              <View style={styles.urgencyTextContainer}>
                <Text
                  style={[
                    styles.urgencyTitle,
                    urgency === 'urgent' && styles.urgencyTitleActiveUrgent,
                  ]}
                >
                  Urgent
                </Text>
                <Text style={styles.urgencyDescription}>
                  ASAP (Extra charges apply)
                </Text>
              </View>
              {urgency === 'urgent' && (
                <View style={styles.checkmark}>
                  <Svg width="20" height="20" viewBox="0 0 20 20">
                    <Circle cx="10" cy="10" r="10" fill="#FF4444" />
                    <Path d="M6 10l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          <Text style={styles.sectionSubtitle}>
            Where do you need the service?
          </Text>

          <TouchableOpacity
            style={[styles.locationCard, errors.location && styles.inputError]}
            onPress={handleLocationChange}
          >
            <View style={styles.locationIconContainer}>
              <LocationIcon />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <Text style={styles.locationAddress}>{location.address}</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 10l3 3 3-3" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          {errors.location && (
            <Text style={styles.errorText}>{errors.location}</Text>
          )}

          {/* Map Preview Placeholder */}
          <View style={styles.mapPreview}>
            <Text style={styles.mapPreviewText}>📍 Map Preview</Text>
            <Text style={styles.mapPreviewSubtext}>
              Tap location card to change on map
            </Text>
          </View>
        </View>

        {/* Price Estimate Info */}
        <View style={styles.infoCard}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" stroke={COLORS.primaryGreen} strokeWidth="2" fill="none" />
            <Text x="12" y="16" fontSize="14" fill={COLORS.primaryGreen} textAnchor="middle" fontWeight="bold">
              i
            </Text>
          </Svg>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Price Estimate</Text>
            <Text style={styles.infoText}>
              You'll receive price quotes from available providers after submitting this request
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Request Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // Category Badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginBottom: 16,
    lineHeight: 20,
  },

  // Text Area
  textArea: {
    height: 140,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 15,
    color: COLORS.textBlack,
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 6,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'right',
    marginTop: 6,
  },

  // Images
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  imageText: {
    fontSize: 32,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Upload Buttons
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    borderStyle: 'dashed',
    backgroundColor: '#F0F9F5',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textGrey,
  },

  // Urgency
  urgencyContainer: {
    gap: 12,
  },
  urgencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.white,
  },
  urgencyButtonActive: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0F9F5',
  },
  urgencyButtonActiveUrgent: {
    borderColor: '#FF4444',
    backgroundColor: '#FFE5E5',
  },
  urgencyIconContainer: {
    marginRight: 12,
  },
  urgencyTextContainer: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 2,
  },
  urgencyTitleActive: {
    color: COLORS.primaryGreen,
  },
  urgencyTitleActiveUrgent: {
    color: '#FF4444',
  },
  urgencyDescription: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  checkmark: {
    marginLeft: 8,
  },

  // Location
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
  },

  // Map Preview
  mapPreview: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mapPreviewText: {
    fontSize: 24,
    marginBottom: 8,
  },
  mapPreviewSubtext: {
    fontSize: 13,
    color: COLORS.textGrey,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F9F5',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textGrey,
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default ServiceRequestScreen;
