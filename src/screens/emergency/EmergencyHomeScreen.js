import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';

const EmergencyHomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  
  const [currentLocation, setCurrentLocation] = useState('Getting location...');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    // Mock location for Expo Go
    setTimeout(() => {
      setCurrentLocation('Gulberg III, Lahore');
    }, 1000);
  };

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Services</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Banner */}
        <View style={[styles.emergencyBanner, { backgroundColor: '#FEE2E2' }]}>
          <View style={styles.emergencyIconContainer}>
            <Svg width="32" height="32" viewBox="0 0 32 32">
              <Circle cx="16" cy="16" r="14" fill="#DC2626" />
              <Path d="M16 10v8M16 22v.01" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
          </View>
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>24/7 Emergency Support</Text>
            <Text style={styles.emergencySubtitle}>Fast response • Verified providers • Real-time tracking</Text>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M10 2C6.69 2 4 4.69 4 8c0 4.38 6 10 6 10s6-5.62 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill={colors.primary}/>
          </Svg>
          <Text style={[styles.locationText, { color: colors.text }]}>{currentLocation}</Text>
        </View>

        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: colors.text }]}>Choose Emergency Type</Text>
        <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
          Select the type of emergency service you need
        </Text>

        {/* Standard Emergency Card */}
        <TouchableOpacity 
          style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('StandardEmergency')}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Svg width="48" height="48" viewBox="0 0 48 48">
              <Circle cx="24" cy="24" r="22" fill="#3B82F6" opacity="0.2"/>
              <Path d="M24 14v10l6 6M24 8c-8.84 0-16 7.16-16 16s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8z" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Standard Emergency</Text>
              <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.badgeText, { color: '#1E40AF' }]}>Fast</Text>
              </View>
            </View>
            
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Pre-defined emergency services with instant provider matching
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <Path d="M5 8l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                </Svg>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Fixed pricing</Text>
              </View>
              <View style={styles.featureItem}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <Path d="M5 8l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                </Svg>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Immediate dispatch</Text>
              </View>
              <View style={styles.featureItem}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <Path d="M5 8l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                </Svg>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Surge pricing applies</Text>
              </View>
            </View>

            <View style={styles.servicesPreview}>
              <Text style={[styles.servicesLabel, { color: colors.textSecondary }]}>Includes:</Text>
              <View style={styles.serviceIcons}>
                <Text style={styles.serviceEmoji}>🔧</Text>
                <Text style={styles.serviceEmoji}>⚡</Text>
                <Text style={styles.serviceEmoji}>❄️</Text>
                <Text style={styles.serviceEmoji}>🔥</Text>
                <Text style={styles.serviceEmoji}>🔑</Text>
                <Text style={[styles.moreText, { color: colors.textSecondary }]}>+1</Text>
              </View>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M9 6l6 6-6 6" stroke={colors.textSecondary} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Non-Standard Emergency Card */}
        <TouchableOpacity 
          style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('NonStandardEmergency')}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: '#FCE7F3' }]}>
            <Svg width="48" height="48" viewBox="0 0 48 48">
              <Circle cx="24" cy="24" r="22" fill="#EC4899" opacity="0.2"/>
              <Path d="M24 14v20M14 24h20" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round"/>
              <Circle cx="24" cy="24" r="16" stroke="#EC4899" strokeWidth="2.5" fill="none"/>
            </Svg>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Non-Standard Emergency</Text>
              <View style={[styles.badge, { backgroundColor: '#FCE7F3' }]}>
                <Text style={[styles.badgeText, { color: '#BE185D' }]}>Custom</Text>
              </View>
            </View>
            
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Describe your unique emergency and receive multiple provider offers
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <Path d="M5 8l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                </Svg>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Competitive pricing</Text>
              </View>
              <View style={styles.featureItem}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <Path d="M5 8l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                </Svg>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Multiple offers</Text>
              </View>
              <View style={styles.featureItem}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <Path d="M5 8l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                </Svg>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Choose best provider</Text>
              </View>
            </View>

            <View style={styles.customNote}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Circle cx="10" cy="10" r="9" fill="#EC4899"/>
                <Path d="M10 6v4M10 14v.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
              <Text style={[styles.customNoteText, { color: colors.textSecondary }]}>
                Perfect for unique or complex emergencies
              </Text>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M9 6l6 6-6 6" stroke={colors.textSecondary} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={colors.primary}/>
            <Path d="M12 8v4M12 16v.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
          </Svg>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              1. Select emergency type{'\n'}
              2. Provider gets dispatched{'\n'}
              3. Track in real-time{'\n'}
              4. Pay after service completion
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  emergencyIconContainer: {
    marginRight: 12,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#7F1D1D',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 8,
  },
  servicesPreview: {
    marginTop: 8,
  },
  servicesLabel: {
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '500',
  },
  serviceIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customNoteText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  arrowContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default EmergencyHomeScreen;
