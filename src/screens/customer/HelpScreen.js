import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import ScreenWrapper from '../../components/ScreenWrapper';
import { openSupportEmail, getSupportEmail } from '../../services/emailSupportService';

const HelpScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleEmailSupport = async () => {
    await openSupportEmail('Help Request', 'Hello, I need help with...');
  };

  const faqs = [
    {
      id: '1',
      question: 'How do I book a service?',
      answer: 'To book a service, go to the Home screen, select the service you need, fill in the details, and submit your request. Service providers will send you offers, and you can choose the best one.',
    },
    {
      id: '2',
      question: 'How do I cancel a booking?',
      answer: 'You can cancel a booking from the History screen. Tap on the booking you want to cancel and select "Cancel Booking". Please note that cancellation policies may apply.',
    },
    {
      id: '3',
      question: 'How do I change my payment method?',
      answer: 'Go to Menu → Payment Methods. You can add, remove, or set a default payment method from there.',
    },
    {
      id: '4',
      question: 'How do I rate a service provider?',
      answer: 'After a service is completed, you\'ll receive a notification to rate the provider. You can also rate from the History screen by tapping on the completed service.',
    },
    {
      id: '5',
      question: 'What if I\'m not satisfied with the service?',
      answer: 'If you\'re not satisfied, please contact our support team immediately. Go to Menu → Support and submit your complaint. We take all feedback seriously.',
    },
    {
      id: '6',
      question: 'How do I track my service provider?',
      answer: 'Once a provider accepts your request, you\'ll see a "Track" button. Tap it to see the provider\'s real-time location and estimated arrival time.',
    },
    {
      id: '7',
      question: 'Can I chat with the service provider?',
      answer: 'Yes! Once a provider accepts your request, you can chat with them directly through the in-app messaging feature.',
    },
    {
      id: '8',
      question: 'How do refunds work?',
      answer: 'Refunds are processed within 5-7 business days. The amount will be credited back to your original payment method.',
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                  fill={colors.primary}
                />
              </Svg>
            </View>
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>Contact Support</Text>
            <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>Get help from our team</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleEmailSupport}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill={colors.primary}
                />
              </Svg>
            </View>
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>Email Support</Text>
            <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>Send us an email</Text>
          </TouchableOpacity>
        </View>

        {/* Support Email Info */}
        <View style={styles.emailInfoSection}>
          <View style={[styles.emailInfoCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill={colors.primary}
              />
            </Svg>
            <Text style={[styles.emailInfoText, { color: colors.text }]}>
              For any issues or queries, contact us at <Text style={[styles.emailAddress, { color: colors.primary }]}>{getSupportEmail()}</Text>
            </Text>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          
          {faqs.map((faq) => (
            <View key={faq.id} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFaq(faq.id)}
              >
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  style={{
                    transform: [{ rotate: expandedFaq === faq.id ? '180deg' : '0deg' }],
                  }}
                >
                  <Path d="M5 7 L10 12 L15 7" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
                </Svg>
              </TouchableOpacity>
              
              {expandedFaq === faq.id && (
                <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                  <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Still Need Help */}
        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Still need help?</Text>
          <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>Our support team is here for you</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.emailButton, { backgroundColor: colors.primary }]}
              onPress={handleEmailSupport}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
                <Path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill={COLORS.white}
                />
              </Svg>
              <Text style={styles.contactButtonText}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  quickActionsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  emailInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emailInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  emailInfoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  emailAddress: {
    fontWeight: '600',
  },
  faqSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  faqCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    padding: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emailButton: {
    // backgroundColor set dynamically
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default HelpScreen;
