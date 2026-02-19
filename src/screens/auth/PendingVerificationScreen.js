import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const PendingVerificationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Svg width="200" height="200" viewBox="0 0 200 200">
          {/* Clock Circle */}
          <Circle cx="100" cy="100" r="80" fill={COLORS.primaryGreen} opacity="0.1" />
          <Circle cx="100" cy="100" r="60" fill={COLORS.primaryGreen} opacity="0.2" />
          
          {/* Clock Icon */}
          <Circle cx="100" cy="100" r="40" fill={COLORS.primaryGreen} />
          <Path d="M100 70 L100 100 L120 110" stroke={COLORS.white} strokeWidth="4" strokeLinecap="round" />
          
          {/* Checkmark Badge */}
          <Circle cx="140" cy="140" r="25" fill="#FFA726" />
          <Path d="M130 140 L137 147 L150 133" stroke={COLORS.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Account Under Review</Text>
        <Text style={styles.subtitle}>
          Your service provider account is currently being verified by our team.
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>Our team will verify your CNIC and documents</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>Verification typically takes 24-48 hours</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>You'll receive a notification once approved</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>After approval, you can start accepting jobs</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Status: Pending Verification</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // TODO: Implement refresh/check status
            console.log('Check verification status');
          }}
        >
          <Text style={styles.primaryButtonText}>Check Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoBox: {
    backgroundColor: '#F0F9F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: COLORS.primaryGreen,
    marginRight: 12,
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textBlack,
    lineHeight: 20,
  },
  statusBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFA726',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  secondaryButton: {
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
});

export default PendingVerificationScreen;
