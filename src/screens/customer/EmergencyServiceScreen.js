import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

const EmergencyServiceScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [selectedService, setSelectedService] = useState(null);

  const emergencyServices = [
    {
      id: 'plumbing',
      name: 'Emergency Plumbing',
      icon: '🔧',
      description: 'Burst pipes, major leaks, water damage',
      responseTime: '15-20 min',
      available: true,
    },
    {
      id: 'electrical',
      name: 'Emergency Electrical',
      icon: '⚡',
      description: 'Power outage, short circuit, electrical hazards',
      responseTime: '15-20 min',
      available: true,
    },
    {
      id: 'locksmith',
      name: 'Emergency Locksmith',
      icon: '🔑',
      description: 'Locked out, broken locks, key replacement',
      responseTime: '20-25 min',
      available: true,
    },
    {
      id: 'hvac',
      name: 'Emergency HVAC',
      icon: '❄️',
      description: 'AC/Heating failure, gas leaks',
      responseTime: '25-30 min',
      available: true,
    },
  ];

  const handleRequestEmergency = () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select an emergency service type');
      return;
    }

    const service = emergencyServices.find(s => s.id === selectedService);
    
    Alert.alert(
      'Confirm Emergency Request',
      `Request ${service.name}?\n\nEstimated arrival: ${service.responseTime}\n\nNote: Emergency services have priority pricing.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            // TODO: Create emergency service request
            navigation.navigate('ProviderMatching', {
              requestData: {
                serviceType: service.id,
                serviceName: service.name,
                isEmergency: true,
                priority: 'high',
              }
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#FF4444' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🚨 Emergency Service</Text>
          <Text style={styles.headerSubtitle}>24/7 Priority Response</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill="#FFA500" />
            <Path d="M12 6v6M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Emergency Services Only</Text>
            <Text style={styles.warningSubtitle}>
              For urgent situations requiring immediate attention
            </Text>
          </View>
        </View>

        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Emergency Type</Text>
          
          {emergencyServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                { 
                  backgroundColor: colors.card, 
                  borderColor: selectedService === service.id ? '#FF4444' : colors.cardBorder,
                  borderWidth: selectedService === service.id ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                    {service.description}
                  </Text>
                </View>
                {selectedService === service.id && (
                  <View style={styles.checkmark}>
                    <Svg width="24" height="24" viewBox="0 0 24 24">
                      <Circle cx="12" cy="12" r="10" fill="#FF4444" />
                      <Path d="M8 12 L11 15 L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  </View>
                )}
              </View>
              
              <View style={styles.serviceFooter}>
                <View style={styles.responseTime}>
                  <Svg width="16" height="16" viewBox="0 0 16 16">
                    <Circle cx="8" cy="8" r="7" stroke={colors.textSecondary} strokeWidth="1.5" fill="none" />
                    <Path d="M8 4v4l3 2" stroke={colors.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
                  </Svg>
                  <Text style={[styles.responseTimeText, { color: colors.textSecondary }]}>
                    {service.responseTime}
                  </Text>
                </View>
                <View style={[styles.availableBadge, { backgroundColor: service.available ? '#E8F5E9' : '#FFEBEE' }]}>
                  <Text style={[styles.availableText, { color: service.available ? '#4CAF50' : '#F44336' }]}>
                    {service.available ? '● Available' : '● Unavailable'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Important Information */}
        <View style={[styles.infoBox, { backgroundColor: colors.backgroundTertiary }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Important Information</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Emergency services have priority pricing{'\n'}
            • Providers will arrive within estimated time{'\n'}
            • 24/7 availability for urgent situations{'\n'}
            • Direct communication with provider{'\n'}
            • Payment after service completion
          </Text>
        </View>
      </ScrollView>

      {/* Request Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.requestButton,
            !selectedService && styles.requestButtonDisabled
          ]}
          onPress={handleRequestEmergency}
          disabled={!selectedService}
        >
          <Text style={styles.requestButtonText}>
            🚨 Request Emergency Service
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningSubtitle: {
    fontSize: 13,
    color: '#EF6C00',
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  serviceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseTimeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  availableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  requestButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonDisabled: {
    backgroundColor: '#D1D1D1',
    shadowOpacity: 0,
    elevation: 0,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EmergencyServiceScreen;
