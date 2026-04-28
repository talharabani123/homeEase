import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, SafeAreaView, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { searchProviders, generateMockOffers, cancelEmergencyRequest } from '../../services/emergencyService';

const EmergencySearchingScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { request, category } = route.params;
  
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [status, setStatus] = useState('searching');
  const [provider, setProvider] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (category === 'standard') {
      // Standard emergency - search for provider
      const cleanup = searchProviders(request.id, (result) => {
        if (result.status === 'provider_found') {
          setStatus('provider_found');
          setProvider(result.provider);
          setTimeout(() => {
            navigation.replace('EmergencyTracking', {
              request,
              provider: result.provider,
              category
            });
          }, 2000);
        } else if (result.status === 'no_provider') {
          setStatus('no_provider');
        } else {
          setTimeRemaining(result.timeRemaining);
        }
      });

      return cleanup;
    } else {
      // Non-standard emergency - collect offers
      generateMockOffers(request.id, (offers) => {
        if (offers.length > 0) {
          setStatus('offers_received');
          setTimeout(() => {
            navigation.replace('EmergencyOffers', {
              request,
              offers,
              category
            });
          }, 1000);
        }
      });
    }
  }, []);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Emergency Request',
      'Are you sure you want to cancel this emergency request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelEmergencyRequest(request.id);
            navigation.navigate('CustomerDashboard');
          }
        }
      ]
    );
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>
          {status === 'searching' ? '🔍 Searching...' :
           status === 'provider_found' ? '✅ Provider Found!' :
           status === 'offers_received' ? '📬 Offers Received!' :
           '❌ No Provider'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Animated Icon */}
        <View style={styles.animationContainer}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.pulseInner, { backgroundColor: colors.primaryLight }]} />
          </Animated.View>
          
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            {status === 'searching' ? (
              <Svg width="80" height="80" viewBox="0 0 80 80">
                <Circle cx="40" cy="40" r="35" stroke={colors.primary} strokeWidth="4" fill="none" strokeDasharray="10 5" />
                <Path d="M40 10 L40 20 M70 40 L60 40 M40 70 L40 60 M10 40 L20 40" stroke={colors.primary} strokeWidth="3" />
              </Svg>
            ) : status === 'provider_found' ? (
              <Svg width="80" height="80" viewBox="0 0 80 80">
                <Circle cx="40" cy="40" r="35" fill={colors.success} />
                <Path d="M25 40 L35 50 L55 30" stroke="#FFFFFF" strokeWidth="5" fill="none" />
              </Svg>
            ) : status === 'offers_received' ? (
              <Svg width="80" height="80" viewBox="0 0 80 80">
                <Circle cx="40" cy="40" r="35" fill={colors.primary} />
                <Path d="M20 30 L40 20 L60 30 L60 50 L40 60 L20 50 Z" stroke="#FFFFFF" strokeWidth="3" fill="none" />
              </Svg>
            ) : (
              <Svg width="80" height="80" viewBox="0 0 80 80">
                <Circle cx="40" cy="40" r="35" fill={colors.error} />
                <Path d="M30 30 L50 50 M50 30 L30 50" stroke="#FFFFFF" strokeWidth="5" />
              </Svg>
            )}
          </Animated.View>
        </View>

        {/* Status Message */}
        <View style={styles.statusContainer}>
          {status === 'searching' && (
            <>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {category === 'standard' ? 'Finding Nearest Provider' : 'Broadcasting to Providers'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {category === 'standard' 
                  ? 'Notifying verified emergency providers in your area...'
                  : 'Multiple providers are reviewing your request...'}
              </Text>
              
              {category === 'standard' && (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>{timeRemaining}</Text>
                  <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>seconds remaining</Text>
                </View>
              )}
            </>
          )}

          {status === 'provider_found' && provider && (
            <>
              <Text style={[styles.statusTitle, { color: colors.text }]}>Provider Accepted!</Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {provider.name} is on the way
              </Text>
              
              <View style={[styles.providerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerInitial}>{provider.name.charAt(0)}</Text>
                </View>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                  <View style={styles.providerMeta}>
                    <Text style={styles.providerRating}>⭐ {provider.rating}</Text>
                    <Text style={[styles.providerJobs, { color: colors.textSecondary }]}>
                      • {provider.totalJobs} jobs
                    </Text>
                  </View>
                </View>
                {provider.emergencyBadge && (
                  <View style={styles.emergencyBadge}>
                    <Text style={styles.emergencyBadgeText}>🚨</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {status === 'offers_received' && (
            <>
              <Text style={[styles.statusTitle, { color: colors.text }]}>Offers Received!</Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                Multiple providers have sent you custom offers
              </Text>
            </>
          )}

          {status === 'no_provider' && (
            <>
              <Text style={[styles.statusTitle, { color: colors.text }]}>No Provider Available</Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                All nearby providers are currently busy. Try again in a few minutes.
              </Text>
            </>
          )}
        </View>

        {/* Request Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Request Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Request ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{request.requestNumber}</Text>
          </View>
          
          {category === 'standard' && (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Service</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {request.serviceType.icon} {request.serviceType.name}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Estimated Price</Text>
                <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
                  Rs. {request.estimatedPrice}
                </Text>
              </View>
            </>
          )}
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
              {request.location.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Cancel Button */}
      {status === 'searching' && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
  },
  pulseInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  timerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#88C791',
  },
  timerLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#88C791',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  providerJobs: {
    fontSize: 13,
    marginLeft: 4,
  },
  emergencyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyBadgeText: {
    fontSize: 16,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EmergencySearchingScreen;
