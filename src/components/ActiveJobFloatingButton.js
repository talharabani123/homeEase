import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import navigationService from '../services/navigationService';

const ActiveJobFloatingButton = ({ job, onPress, onNavigate, onUpdateStatus }) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
  }, []);

  if (!job) return null;

  const handleCall = () => {
    if (job.customerPhone) {
      Linking.openURL(`tel:${job.customerPhone}`);
    }
  };

  const handleNavigate = () => {
    if (job.location) {
      navigationService.openGoogleMaps(job.location.latitude, job.location.longitude);
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'accepted':
        return '#3B82F6';
      case 'on_the_way':
        return '#F59E0B';
      case 'arrived':
        return '#8B5CF6';
      case 'in_progress':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'accepted':
        return 'Accepted';
      case 'on_the_way':
        return 'On the Way';
      case 'arrived':
        return 'Arrived';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Active';
    }
  };

  const getNextStatus = () => {
    switch (job.status) {
      case 'accepted':
        return { status: 'on_the_way', label: 'On the Way' };
      case 'on_the_way':
        return { status: 'arrived', label: 'Arrived' };
      case 'arrived':
        return { status: 'in_progress', label: 'Start Work' };
      case 'in_progress':
        return { status: 'completed', label: 'Complete' };
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <View style={styles.container}>
      {expanded && (
        <View style={[styles.expandedMenu, { backgroundColor: colors.card }]}>
          {/* Navigate Button */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.primary }]}
            onPress={handleNavigate}
          >
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path
                d="M10 2C6.69 2 4 4.69 4 8c0 3.75 6 10 6 10s6-6.25 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                fill="#FFFFFF"
              />
            </Svg>
            <Text style={styles.menuButtonText}>Navigate</Text>
          </TouchableOpacity>

          {/* Call Button */}
          {job.customerPhone && (
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: '#10B981' }]}
              onPress={handleCall}
            >
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                  fill="#FFFFFF"
                />
              </Svg>
              <Text style={styles.menuButtonText}>Call</Text>
            </TouchableOpacity>
          )}

          {/* Update Status Button */}
          {nextStatus && (
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: getStatusColor() }]}
              onPress={() => onUpdateStatus(nextStatus.status)}
            >
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  fill="#FFFFFF"
                />
              </Svg>
              <Text style={styles.menuButtonText}>{nextStatus.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Floating Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: getStatusColor() }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {expanded ? (
            <Svg width="28" height="28" viewBox="0 0 24 24">
              <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#FFFFFF" />
            </Svg>
          ) : (
            <Svg width="28" height="28" viewBox="0 0 24 24">
              <Path
                d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"
                fill="#FFFFFF"
              />
            </Svg>
          )}
        </Animated.View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
        </View>
      </TouchableOpacity>

      {/* Job Info Card */}
      {!expanded && (
        <TouchableOpacity
          style={[styles.infoCard, { backgroundColor: colors.card }]}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <View style={styles.infoHeader}>
            <Text style={[styles.infoTitle, { color: colors.text }]} numberOfLines={1}>
              {job.serviceName}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          </View>
          <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {job.customerName} • {job.distanceFromProvider} km
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  expandedMenu: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    gap: 8,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  menuButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  floatingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    right: 80,
    width: 200,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  infoSubtitle: {
    fontSize: 12,
  },
});

export default ActiveJobFloatingButton;
