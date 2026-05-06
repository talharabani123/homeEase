import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { STANDARD_EMERGENCY_TYPES } from '../../services/emergencyService';

const TAB = { STANDARD: 'standard', CUSTOM: 'custom' };

const EmergencySelectScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState(TAB.STANDARD);
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (tab === TAB.STANDARD) {
      if (!selectedService) { Alert.alert('Select Service', 'Please select an emergency service type.'); return; }
      navigation.navigate('EmergencyLocation', { type: TAB.STANDARD, service: selectedService, description: '' });
    } else {
      if (!description.trim() || description.trim().length < 10) {
        Alert.alert('Describe Issue', 'Please describe your emergency (minimum 10 characters).'); return;
      }
      navigation.navigate('EmergencyLocation', { type: TAB.CUSTOM, service: null, description: description.trim() });
    }
  };

  const canProceed = tab === TAB.STANDARD ? !!selectedService : description.trim().length >= 10;

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </Svg>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Service</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Select type and service</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Standard / Non-Standard buttons */}
          <View style={styles.typeBtnRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { backgroundColor: tab === TAB.STANDARD ? colors.primary : colors.card,
                  borderColor: tab === TAB.STANDARD ? colors.primary : colors.border },
              ]}
              onPress={() => { setTab(TAB.STANDARD); setSelectedService(null); }}
            >
              <View style={styles.typeBtnContent}>
                <View style={styles.typeBtnImageContainer}>
                  <Svg width="40" height="40" viewBox="0 0 100 100">
                    {/* Toolbox */}
                    <Path d="M20 30 L80 30 L80 70 L20 70 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
                    <Path d="M15 25 L85 25 L85 35 L15 35 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1"/>
                    {/* Tools */}
                    <Path d="M30 40 L35 45 L30 50 L25 45 Z" fill="#9CA3AF"/>
                    <Path d="M45 35 L50 35 L50 55 L45 55 Z" fill="#6B7280"/>
                    <Path d="M60 38 L70 38 L70 42 L60 42 Z" fill="#EF4444"/>
                    <Path d="M65 42 L65 52 L61 52 L61 42 Z" fill="#DC2626"/>
                  </Svg>
                </View>
                <Text style={[
                  styles.typeBtnText,
                  { color: tab === TAB.STANDARD ? '#fff' : '#374151' },
                ]}>
                  Standard Emergency
                </Text>
                <Text style={[
                  styles.typeBtnSubtext,
                  { color: tab === TAB.STANDARD ? 'rgba(255,255,255,0.8)' : '#6B7280' },
                ]}>
                  Quick fixes & repairs
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { backgroundColor: tab === TAB.CUSTOM ? colors.primary : colors.card,
                  borderColor: tab === TAB.CUSTOM ? colors.primary : colors.border },
              ]}
              onPress={() => { setTab(TAB.CUSTOM); setSelectedService(null); }}
            >
              <View style={styles.typeBtnContent}>
                <View style={styles.typeBtnImageContainer}>
                  <Svg width="40" height="40" viewBox="0 0 100 100">
                    {/* House structure */}
                    <Path d="M20 45 L50 20 L80 45 L80 75 L20 75 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
                    <Path d="M15 45 L50 15 L85 45 L80 45 L50 20 L20 45 Z" fill="#6B7280"/>
                    {/* Brick pattern */}
                    <Path d="M20 50 L35 50 L35 55 L20 55 Z" fill="#DC2626"/>
                    <Path d="M25 55 L40 55 L40 60 L25 60 Z" fill="#B91C1C"/>
                    <Path d="M20 60 L35 60 L35 65 L20 65 Z" fill="#DC2626"/>
                    {/* Tools */}
                    <Path d="M45 35 L55 35 L55 45 L45 45 Z" fill="#F59E0B"/>
                    <Path d="M60 40 L70 30 L72 32 L62 42 Z" fill="#6B7280"/>
                    <Path d="M65 50 L75 50 L75 55 L65 55 Z" fill="#EF4444"/>
                    {/* Hard hat */}
                    <Path d="M40 25 L60 25 L62 30 L38 30 Z" fill="#F59E0B"/>
                  </Svg>
                </View>
                <Text style={[
                  styles.typeBtnText,
                  { color: tab === TAB.CUSTOM ? '#fff' : '#374151' },
                ]}>
                  Non-Standard
                </Text>
                <Text style={[
                  styles.typeBtnSubtext,
                  { color: tab === TAB.CUSTOM ? 'rgba(255,255,255,0.8)' : '#6B7280' },
                ]}>
                  Complex projects
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* STANDARD TAB */}
        {tab === TAB.STANDARD && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Emergency Type</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Instant dispatch to nearest verified provider
            </Text>

            <View style={styles.grid}>
              {STANDARD_EMERGENCY_TYPES.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <TouchableOpacity
                    key={svc.id}
                    style={[
                      styles.serviceCard,
                      { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
                      isSelected && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => setSelectedService(svc)}
                    activeOpacity={0.75}
                  >
                    {svc.critical && (
                      <View style={[styles.criticalBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.criticalText}>URGENT</Text>
                      </View>
                    )}
                    <Text style={styles.svcIcon}>{svc.icon}</Text>
                    <Text style={[styles.svcName, { color: colors.text }]} numberOfLines={2}>{svc.name}</Text>
                    <Text style={[styles.svcPrice, { color: colors.primary }]}>Rs. {svc.basePrice}+</Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Svg width="16" height="16" viewBox="0 0 20 20">
                          <Circle cx="10" cy="10" r="10" fill={colors.primary}/>
                          <Path d="M5 10l3 3 7-7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </Svg>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedService && (
              <View style={[styles.selectedDetail, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={[styles.selectedDetailTitle, { color: colors.text }]}>
                  {selectedService.icon} {selectedService.name}
                </Text>
                <Text style={[styles.selectedDetailExamples, { color: colors.textSecondary }]}>
                  Examples: {selectedService.examples.slice(0, 3).join(' • ')}
                </Text>
                <Text style={[styles.selectedDetailPrice, { color: colors.primary }]}>
                  Emergency rate: Rs. {Math.round(selectedService.basePrice * selectedService.surgeMultiplier)}+
                </Text>
              </View>
            )}
          </View>
        )}

        {/* CUSTOM TAB */}
        {tab === TAB.CUSTOM && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Describe Your Emergency</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Multiple providers will send you competitive offers
            </Text>

            <TextInput
              style={[styles.textArea, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              }]}
              placeholder="Describe your emergency issue… e.g. Water leaking from ceiling + electrical sparks in bedroom."
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>
              {description.length}/500 {description.length < 10 ? `(${10 - description.length} more needed)` : '✓'}
            </Text>

            <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.howTitle, { color: colors.text }]}>📋 How Custom Works</Text>
              {[
                '1. Describe your problem in detail',
                '2. Providers review and send price offers',
                '3. You compare offers and pick the best',
                '4. Provider navigates to your location',
              ].map((t, i) => (
                <Text key={i} style={[styles.howItem, { color: colors.textSecondary }]}>{t}</Text>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: canProceed ? colors.primary : colors.border }]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={[styles.nextBtnText, { color: canProceed ? '#fff' : colors.textSecondary }]}>
            Next: Set Location →
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  typeBtnRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  typeBtn: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 16, alignItems: 'center', borderWidth: 2, minHeight: 120 },
  typeBtnContent: { alignItems: 'center', justifyContent: 'center' },
  typeBtnImageContainer: { marginBottom: 8 },
  typeBtnText: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  typeBtnSubtext: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  scroll: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 20, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: {
    width: '47%', padding: 14, borderRadius: 14, borderWidth: 2,
    position: 'relative', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  criticalBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  criticalText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  svcIcon: { fontSize: 32, marginBottom: 8 },
  svcName: { fontSize: 13, fontWeight: '700', marginBottom: 4, minHeight: 34 },
  svcPrice: { fontSize: 12, fontWeight: '700' },
  checkBadge: { position: 'absolute', top: 8, left: 8 },
  selectedDetail: { marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1 },
  selectedDetailTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  selectedDetailExamples: { fontSize: 12, marginBottom: 4 },
  selectedDetailPrice: { fontSize: 13, fontWeight: '700' },
  textArea: { borderRadius: 14, padding: 14, fontSize: 14, borderWidth: 1.5, minHeight: 140, lineHeight: 22 },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 6, marginBottom: 16 },
  howCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  howTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  howItem: { fontSize: 13, lineHeight: 22 },
  footer: { padding: 16, borderTopWidth: 1 },
  nextBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '800' },
});

export default EmergencySelectScreen;
