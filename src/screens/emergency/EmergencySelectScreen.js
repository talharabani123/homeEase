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
              <Text style={[
                styles.typeBtnText,
                { color: tab === TAB.STANDARD ? '#fff' : colors.textSecondary },
              ]}>
                ⚡ Standard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { backgroundColor: tab === TAB.CUSTOM ? colors.primary : colors.card,
                  borderColor: tab === TAB.CUSTOM ? colors.primary : colors.border },
              ]}
              onPress={() => { setTab(TAB.CUSTOM); setSelectedService(null); }}
            >
              <Text style={[
                styles.typeBtnText,
                { color: tab === TAB.CUSTOM ? '#fff' : colors.textSecondary },
              ]}>
                📝 Non-Standard
              </Text>
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
  typeBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  typeBtnText: { fontSize: 14, fontWeight: '700' },
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
