import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { SERVICE_CATEGORIES, saveDraft, loadDraft } from '../../services/providerRegistrationService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const ServiceSelectionScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { resumeDraft } = route.params || {};
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeDraft) {
      loadSavedDraft();
    }
  }, []);

  const loadSavedDraft = async () => {
    setLoading(true);
    const result = await loadDraft();
    setLoading(false);
    
    if (result.success && result.data.selectedServices) {
      setSelectedServices(result.data.selectedServices);
    }
  };

  const toggleService = (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, {
        ...service,
        proofDocuments: []
      }]);
    }
  };

  const handleContinue = async () => {
    if (selectedServices.length === 0) {
      alert.error('Select Services', 'Please select at least one service to continue');
      return;
    }

    setLoading(true);
    
    // Save draft to Firestore
    const saveResult = await saveDraft({
      currentStep: 1,
      selectedServices
    });

    setLoading(false);

    if (saveResult.success) {
      navigation.navigate('PersonalInfo', { selectedServices });
    } else {
      alert.error('Error', 'Failed to save progress. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select Services</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '12.5%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 1 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="9" fill={colors.primary} />
            <Path d="M10 6 L10 10 M10 14 L10 14.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Select one or multiple services you want to offer
          </Text>
        </View>

        {/* Selected Count */}
        {selectedServices.length > 0 && (
          <View style={[styles.selectedBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.selectedText, { color: colors.text }]}>
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* Service Grid */}
        <View style={styles.servicesGrid}>
          {SERVICE_CATEGORIES.map((service) => {
            if (!service || !service.icon) return null;
            const isSelected = selectedServices.some(s => s.id === service.id);
            
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => toggleService(service)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Svg width="24" height="24" viewBox="0 0 24 24">
                      <Circle cx="12" cy="12" r="11" fill={colors.primary} />
                      <Path d="M8 12 L11 15 L16 9" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                    </Svg>
                  </View>
                )}
                
                <View style={[styles.serviceIconContainer, isSelected && { backgroundColor: colors.primary }]}>
                  <Text style={styles.serviceIcon}>{service.icon || '📦'}</Text>
                </View>
                
                <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={2}>
                  {service.name}
                </Text>
                
                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {service.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Help Text */}
        <View style={[styles.helpSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>💡 Tip</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            You can select multiple services if you have skills in different areas. You'll need to provide proof for each service separately.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: selectedServices.length > 0 ? colors.primary : colors.disabled }
          ]}
          onPress={handleContinue}
          disabled={selectedServices.length === 0 || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Saving...' : `Continue (${selectedServices.length} selected)`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={alert.hide}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  selectedBanner: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  serviceCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
    minHeight: 160,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    minHeight: 36,
  },
  serviceDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  helpSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ServiceSelectionScreen;
