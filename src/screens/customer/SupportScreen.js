import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { openSupportEmail, getSupportEmail } from '../../services/emailSupportService';

const SupportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const issueTypes = [
    'Payment Issue',
    'Service Quality',
    'Provider Behavior',
    'App Technical Issue',
    'Booking Problem',
    'Other',
  ];

  const handleSubmit = async () => {
    if (!issueType) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    Alert.alert(
      'Support Request Submitted',
      'Our team will contact you within 24 hours',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleEmailSupport = async () => {
    try {
      await openSupportEmail('Support Request', 'Hello, I need help with...');
      setShowThankYouModal(true);
    } catch (error) {
      Alert.alert('Error', 'Could not open email app. Please try again.');
    }
  };

  return (
    <ScreenWrapper variant="default">
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Support</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Contact Cards */}
        <View style={styles.contactSection}>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handleEmailSupport}
          >
            <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill={colors.primary}
                />
              </Svg>
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email Support</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>{getSupportEmail()}</Text>
              <Text style={[styles.contactNote, { color: colors.textSecondary }]}>Tap to open email app</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          {/* Quick Contact Button */}
          <TouchableOpacity 
            style={[styles.quickContactButton, { backgroundColor: colors.primary }]}
            onPress={handleEmailSupport}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                fill={COLORS.white}
              />
            </Svg>
            <Text style={styles.quickContactText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View style={styles.supportInfoSection}>
          <View style={[styles.supportInfoCard, { backgroundColor: colors.primaryLight }]}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill={colors.primary}
              />
            </Svg>
            <View style={styles.supportInfoText}>
              <Text style={[styles.supportInfoTitle, { color: colors.text }]}>Professional Support</Text>
              <Text style={[styles.supportInfoDesc, { color: colors.textSecondary }]}>
                For any issues or queries, feel free to contact us at supporthomeease@gmail.com. We're here to help!
              </Text>
            </View>
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Submit a Request</Text>

          {/* Issue Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Issue Type *</Text>
            <View style={styles.issueTypeGrid}>
              {issueTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.issueTypeButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    issueType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setIssueType(type)}
                >
                  <Text
                    style={[
                      styles.issueTypeText,
                      { color: colors.text },
                      issueType === type && styles.issueTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Describe Your Issue *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Please provide details about your issue..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <Svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <Path
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                fill={COLORS.white}
              />
            </Svg>
            <Text style={styles.submitButtonText}>Send Email to Support</Text>
          </TouchableOpacity>
        </View>

        {/* Thank You Modal */}
        <Modal
          visible={showThankYouModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThankYouModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.thankYouModal, { backgroundColor: colors.card }]}>
              <View style={[styles.thankYouIcon, { backgroundColor: colors.primaryLight }]}>
                <Svg width="32" height="32" viewBox="0 0 24 24">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill={colors.primary}
                  />
                </Svg>
              </View>
              <Text style={[styles.thankYouTitle, { color: colors.text }]}>Thank You!</Text>
              <Text style={[styles.thankYouMessage, { color: colors.textSecondary }]}>
                Your email has been opened. Our support team will contact you within 24 hours.
              </Text>
              <Text style={[styles.thankYouGreeting, { color: colors.textSecondary }]}>
                We appreciate your patience and look forward to helping you!
              </Text>
              <TouchableOpacity
                style={[styles.thankYouButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowThankYouModal(false)}
              >
                <Text style={styles.thankYouButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactSection: {
    padding: 20,
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  quickContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  quickContactText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  supportInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  supportInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
  },
  supportInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  supportInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportInfoDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  issueTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  issueTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  issueTypeTextActive: {
    color: COLORS.white,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  thankYouModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  thankYouIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  thankYouMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  thankYouGreeting: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  thankYouButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  thankYouButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SupportScreen;
