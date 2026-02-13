import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const ProviderMatchingScreen = ({ navigation, route }) => {
  const { requestData } = route.params || {};
  const [matchingStatus, setMatchingStatus] = useState('searching'); // searching, found, failed

  useEffect(() => {
    // Simulate matching process
    const timer = setTimeout(() => {
      setMatchingStatus('found');
      // Navigate to provider list or details
      setTimeout(() => {
        navigation.navigate('CustomerDashboard');
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.content}>
        {/* Animated Icon */}
        <View style={styles.iconContainer}>
          {matchingStatus === 'searching' && (
            <>
              <Svg width="120" height="120" viewBox="0 0 120 120">
                <Circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={COLORS.primaryGreen}
                  strokeWidth="4"
                  fill="none"
                  opacity="0.3"
                />
                <Circle
                  cx="60"
                  cy="60"
                  r="40"
                  stroke={COLORS.primaryGreen}
                  strokeWidth="4"
                  fill="none"
                  opacity="0.5"
                />
                <Circle
                  cx="60"
                  cy="60"
                  r="30"
                  fill={COLORS.primaryGreen}
                  opacity="0.2"
                />
              </Svg>
              <ActivityIndicator
                size="large"
                color={COLORS.primaryGreen}
                style={styles.spinner}
              />
            </>
          )}
          
          {matchingStatus === 'found' && (
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="50" fill={COLORS.primaryGreen} opacity="0.1" />
              <Circle cx="60" cy="60" r="40" fill={COLORS.primaryGreen} opacity="0.2" />
              <Circle cx="60" cy="60" r="30" fill={COLORS.primaryGreen} />
              <Path
                d="M45 60l10 10 20-20"
                stroke="#FFF"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>

        {/* Status Text */}
        <Text style={styles.title}>
          {matchingStatus === 'searching' && 'Finding Providers...'}
          {matchingStatus === 'found' && 'Providers Found!'}
        </Text>
        
        <Text style={styles.subtitle}>
          {matchingStatus === 'searching' && 'We\'re searching for available service providers in your area'}
          {matchingStatus === 'found' && 'Redirecting you to available providers'}
        </Text>

        {/* Request Details */}
        {requestData && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{requestData.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Urgency:</Text>
              <Text style={[
                styles.detailValue,
                requestData.urgency === 'urgent' && styles.urgentText
              ]}>
                {requestData.urgency === 'urgent' ? 'Urgent' : 'Normal'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {requestData.location?.address}
              </Text>
            </View>
          </View>
        )}

        {/* Info Text */}
        <Text style={styles.infoText}>
          {matchingStatus === 'searching' && 'This usually takes a few seconds...'}
          {matchingStatus === 'found' && 'You\'ll receive quotes from providers shortly'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    position: 'absolute',
  },
  title: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F0F9F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textBlack,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  urgentText: {
    color: '#FF4444',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
});

export default ProviderMatchingScreen;
