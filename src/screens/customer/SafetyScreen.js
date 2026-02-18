import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Alert, Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SafetyScreen = ({ navigation }) => {
  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Contact',
      'Call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 15',
          onPress: () => Linking.openURL('tel:15'),
        },
      ]
    );
  };

  const safetyTips = [
    {
      id: '1',
      title: 'Verify Provider Identity',
      description: 'Always check the provider\'s profile, ratings, and reviews before confirming a booking.',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
    {
      id: '2',
      title: 'Share Your Location',
      description: 'Share your live location with trusted contacts when a service provider is at your location.',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
    {
      id: '3',
      title: 'In-App Communication',
      description: 'Use the in-app chat feature to communicate with providers. This helps us maintain records.',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
    {
      id: '4',
      title: 'Payment Security',
      description: 'Complete all payments through the app. Never share your payment details directly with providers.',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
    {
      id: '5',
      title: 'Report Issues Immediately',
      description: 'If you feel unsafe or notice suspicious behavior, report it immediately through the app.',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Information</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Emergency Button */}
        <View style={styles.emergencySection}>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
            <View style={styles.emergencyIcon}>
              <Svg width="32" height="32" viewBox="0 0 32 32">
                <Path
                  d="M26 20c-1.66 0-3.26-.27-4.76-.76-.47-.15-.99-.04-1.36.32l-2.93 2.93c-3.77-1.92-6.86-5-8.78-8.78l2.93-2.93c.36-.37.47-.89.32-1.36C10.93 8.26 10.66 6.66 10.66 5c0-.73-.6-1.33-1.33-1.33H5.33C4.6 3.67 4 4.27 4 5c0 12.52 10.15 22.67 22.67 22.67.73 0 1.33-.6 1.33-1.33v-4c0-.73-.6-1.34-1.33-1.34z"
                  fill={COLORS.white}
                />
              </Svg>
            </View>
            <View style={styles.emergencyTextContainer}>
              <Text style={styles.emergencyTitle}>Emergency Contact</Text>
              <Text style={styles.emergencySubtitle}>Tap to call 15</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Guidelines</Text>
          
          {safetyTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIcon}>
                {tip.icon()}
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Safety Center</Text>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Community Guidelines</Text>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Report Safety Concern</Text>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
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
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  emergencySection: {
    padding: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  tipsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.textGrey,
    lineHeight: 20,
  },
  resourcesSection: {
    padding: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textBlack,
  },
});

export default SafetyScreen;
