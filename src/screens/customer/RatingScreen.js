import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';
import { submitRating } from '../../services/ratingService';
import { getUserData } from '../../services/userStorageService';

// Icons
const BackIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" fill="none" />
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
  const { colors } = useTheme();
  const { provider, jobData, paymentMethod, amount, jobId } = route.params || {};
  
  const providerData = provider || {
    id: 'provider_1',
    name: 'Ahmed Khan',
    serviceType: 'Plumber',
  };

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reportIssue, setReportIssue] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting');
      return;
    }

    if (reportIssue && !issueDescription.trim()) {
      Alert.alert('Issue Description Required', 'Please describe the issue you want to report');
      return;
    }

    if (review.length > 500) {
      Alert.alert('Review Too Long', 'Please keep your review under 500 characters');
      return;
    }

    setSubmitting(true);

    try {
      // Get current user data
      const userResult = await getUserData();
      const userData = userResult.success ? userResult.data : null;

      // Submit rating
      const result = await submitRating({
        providerId: providerData.id,
        providerName: providerData.name,
        serviceType: providerData.serviceType,
        rating,
        review: review.trim(),
        reportIssue,
        issueDescription: issueDescription.trim(),
        jobId: jobId || `job_${Date.now()}`,
        customerId: userData?.id || 'customer_1',
        customerName: userData?.fullName || 'Customer',
        amount: amount || 0,
        paymentMethod: paymentMethod || 'cash',
      });

      if (result.success) {
        Alert.alert(
          'Thank You! ⭐',
          'Your feedback has been submitted successfully and helps improve our service quality.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('CustomerDashboard'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit rating. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rate Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Provider Info */}
        <View style={[styles.providerCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitial}>
              {providerData.name.charAt(0)}
            </Text>
          </View>
          <Text style={[styles.providerName, { color: colors.text }]}>{providerData.name}</Text>
          <Text style={[styles.providerService, { color: colors.textSecondary }]}>{providerData.serviceType}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How was your experience?</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>

          <Text style={[styles.ratingText, { color: colors.primary }]}>{getRatingText()}</Text>
        </View>

        {/* Review Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Write a Review (Optional)</Text>
          
          <View style={styles.textAreaContainer}>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Share your experience with this service provider..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={6}
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>{review.length}/500</Text>
          </View>
        </View>

        {/* Report Issue Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setReportIssue(!reportIssue)}
          >
            <View style={[styles.checkbox, { borderColor: colors.primary }]}>
              {reportIssue && (
                <View style={[styles.checkboxChecked, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Report an issue with this service</Text>
          </TouchableOpacity>

          {reportIssue && (
            <View style={styles.issueContainer}>
              <TextInput
                style={[styles.issueInput, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border, color: colors.text }]}
                placeholder="Describe the issue..."
                placeholderTextColor={colors.placeholder}
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
          <View style={[styles.paymentSummary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Payment Method:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'wallet' ? 'Wallet' : 'Card'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Amount Paid:</Text>
              <Text style={[styles.summaryValueAmount, { color: colors.primary }]}>Rs {amount}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, (rating === 0 || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('CustomerDashboard')}
          disabled={submitting}
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  providerService: {
    fontSize: 15,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
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
    textAlign: 'center',
  },

  // Text Area
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
  },
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 12,
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
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  checkboxLabel: {
    fontSize: 15,
    flex: 1,
  },

  // Issue Container
  issueContainer: {
    marginTop: 8,
  },
  issueInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
  },

  // Payment Summary
  paymentSummary: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryValueAmount: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Bottom Container
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
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
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default RatingScreen;
