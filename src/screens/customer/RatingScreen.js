import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
  </Svg>
);

const StarIcon = ({ filled, size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      d="M24 4l6 16h16l-13 10 6 16-15-11-15 11 6-16-13-10h16z"
      fill={filled ? '#FFA726' : '#E0E0E0'}
    />
  </Svg>
);

const RatingScreen = ({ navigation, route }) => {
  const { provider, jobData, paymentMethod, amount } = route.params || {};
  
  const providerData = provider || {
    name: 'Ahmed Khan',
    serviceType: 'Plumber',
  };

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reportIssue, setReportIssue] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting');
      return;
    }

    if (reportIssue && !issueDescription.trim()) {
      Alert.alert('Issue Description Required', 'Please describe the issue you want to report');
      return;
    }

    // TODO: Submit rating and review to backend
    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('CustomerDashboard'),
        },
      ]
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <StarIcon filled={i <= rating} />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap to rate';
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
        <Text style={styles.headerTitle}>Rate Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Provider Info */}
        <View style={styles.providerCard}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitial}>
              {providerData.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.providerName}>{providerData.name}</Text>
          <Text style={styles.providerService}>{providerData.serviceType}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>

          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Review Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write a Review (Optional)</Text>
          
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Share your experience with this service provider..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{review.length}/500</Text>
          </View>
        </View>

        {/* Report Issue Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setReportIssue(!reportIssue)}
          >
            <View style={styles.checkbox}>
              {reportIssue && (
                <View style={styles.checkboxChecked} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Report an issue with this service</Text>
          </TouchableOpacity>

          {reportIssue && (
            <View style={styles.issueContainer}>
              <TextInput
                style={styles.issueInput}
                placeholder="Describe the issue..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={issueDescription}
                onChangeText={setIssueDescription}
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        {/* Payment Summary */}
        {amount && (
          <View style={styles.paymentSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method:</Text>
              <Text style={styles.summaryValue}>
                {paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'wallet' ? 'Wallet' : 'Card'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Paid:</Text>
              <Text style={styles.summaryValueAmount}>Rs {amount}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('CustomerDashboard')}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
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
    paddingTop: 24,
  },

  // Provider Card
  providerCard: {
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  providerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInitial: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.white,
  },
  providerName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  providerService: {
    fontSize: 15,
    color: COLORS.textGrey,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Stars
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    textAlign: 'center',
  },

  // Text Area
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textBlack,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: COLORS.textGrey,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: COLORS.primaryGreen,
  },
  checkboxLabel: {
    fontSize: 15,
    color: COLORS.textBlack,
    flex: 1,
  },

  // Issue Container
  issueContainer: {
    marginTop: 8,
  },
  issueInput: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textBlack,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#FFE082',
  },

  // Payment Summary
  paymentSummary: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: COLORS.textGrey,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  summaryValueAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },

  // Bottom Container
  bottomContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: COLORS.textGrey,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default RatingScreen;
