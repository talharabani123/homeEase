import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const HelpScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={styles.quickActionIcon}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                  fill={COLORS.primaryGreen}
                />
              </Svg>
            </View>
            <Text style={styles.quickActionTitle}>Contact Support</Text>
            <Text style={styles.quickActionSubtitle}>Get help from our team</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Safety')}
          >
            <View style={styles.quickActionIcon}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                  fill={COLORS.primaryGreen}
                />
              </Svg>
            </View>
            <Text style={styles.quickActionTitle}>Safety Center</Text>
            <Text style={styles.quickActionSubtitle}>Learn about safety</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFaq(faq.id)}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  style={{
                    transform: [{ rotate: expandedFaq === faq.id ? '180deg' : '0deg' }],
                  }}
                >
                  <Path d="M5 7 L10 12 L15 7" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
                </Svg>
              </TouchableOpacity>
              
              {expandedFaq === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* App Guide */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>App Usage Guide</Text>
          
          <View style={styles.guideCard}>
            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>1</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Create Your Account</Text>
                <Text style={styles.guideStepDescription}>
                  Sign up with your phone number and complete your profile
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>2</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Choose a Service</Text>
                <Text style={styles.guideStepDescription}>
                  Browse available services and select what you need
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>3</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Get Offers</Text>
                <Text style={styles.guideStepDescription}>
                  Receive offers from multiple providers and choose the best one
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>4</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Track & Pay</Text>
                <Text style={styles.guideStepDescription}>
                  Track your provider in real-time and pay securely through the app
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Still Need Help */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>Our support team is here for you</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    color: COLORS.textBlack,
  },
  quickActionsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
  faqSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: COLORS.textBlack,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.textGrey,
    lineHeight: 20,
  },
  guideSection: {
    padding: 20,
  },
  guideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  guideStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideStepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  guideStepContent: {
    flex: 1,
  },
  guideStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  guideStepDescription: {
    fontSize: 14,
    color: COLORS.textGrey,
    lineHeight: 20,
  },
  contactSection: {
    padding: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default HelpScreen;
