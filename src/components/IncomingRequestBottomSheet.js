import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { calculateTravelFee } from '../services/marketplaceService';

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.65;

const IncomingRequestBottomSheet = ({ visible, request, onAccept, onReject, onViewDetails }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!request) return null;

  const travelFee = calculateTravelFee(request.distanceFromProvider);
  const estimatedTotal = (request.basePrice || 500) + travelFee;

  const handleCall = () => {
    if (request.customerPhone) {
      Linking.openURL(`tel:${request.customerPhone}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onReject}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.pulseContainer, { backgroundColor: colors.primary + '20' }]}>
                <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>New Request!</Text>
            </View>
            <TouchableOpacity onPress={onReject} style={styles.closeButton}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill={colors.textSecondary}
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Service Info */}
          <View style={styles.serviceSection}>
            <View style={[styles.serviceIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.serviceEmoji}>🔧</Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: colors.text }]}>{request.serviceName}</Text>
              <Text style={[styles.customerName, { color: colors.textSecondary }]}>
                {request.customerName}
              </Text>
            </View>
            {request.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>⚡ URGENT</Text>
              </View>
            )}
          </View>

          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path
                  d="M10 2C6.69 2 4 4.69 4 8c0 3.75 6 10 6 10s6-6.25 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                  fill={colors.primary}
                />
              </Svg>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Distance</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{request.distanceFromProvider} km</Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path
                  d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm.5-9H9v5l4.25 2.52.75-1.23-3.5-2.08V7z"
                  fill={colors.primary}
                />
              </Svg>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Est. Time</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {Math.ceil(request.distanceFromProvider * 2)} min
              </Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path
                  d="M17 4H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 10H3V6h14v8zm-8-2h6v-4h-6v4z"
                  fill={colors.primary}
                />
              </Svg>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Earnings</Text>
              <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '700' }]}>
                Rs. {estimatedTotal}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: colors.text }]} numberOfLines={2}>
              {request.description}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.locationSection}>
            <Svg width="16" height="16" viewBox="0 0 16 16">
              <Path
                d="M8 2C5.79 2 4 3.79 4 6c0 2.5 4 8 4 8s4-5.5 4-8c0-2.21-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5S7.17 4.5 8 4.5s1.5.67 1.5 1.5S8.83 7.5 8 7.5z"
                fill={colors.primary}
              />
            </Svg>
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {request.address}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={onViewDetails}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>View Details</Text>
            </TouchableOpacity>

            {request.customerPhone && (
              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: colors.primaryLight }]}
                onPress={handleCall}
              >
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path
                    d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                    fill={colors.primary}
                  />
                </Svg>
              </TouchableOpacity>
            )}
          </View>

          {/* Accept Button */}
          <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.primary }]} onPress={onAccept}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#FFFFFF" />
            </Svg>
            <Text style={styles.acceptButtonText}>Accept & Navigate</Text>
          </TouchableOpacity>

          {/* Reject Button */}
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Text style={[styles.rejectButtonText, { color: colors.textSecondary }]}>Not Available</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulseContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
  },
  urgentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default IncomingRequestBottomSheet;
