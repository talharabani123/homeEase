import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

const SupportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');

  const issueTypes = [
    'Payment Issue',
    'Service Quality',
    'Provider Behavior',
    'App Technical Issue',
    'Booking Problem',
    'Other',
  ];

  const handleSubmit = () => {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

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
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
              <Text style={[styles.contactValue, { color: colors.text }]}>support@homeease.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"
                  fill={colors.primary}
                />
              </Svg>
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Phone Support</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>+92 300 1234567</Text>
            </View>
          </TouchableOpacity>
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
            <Text style={styles.submitButtonText}>Submit Request</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Help</Text>
          
          <TouchableOpacity style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I cancel a booking?</Text>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I change payment method?</Text>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I rate a service provider?</Text>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  faqSection: {
    padding: 20,
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SupportScreen;
