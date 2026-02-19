import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const TermsConditionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: February 17, 2026</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using HomeEase, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
          </Text>

          <Text style={styles.sectionTitle}>2. Service Description</Text>
          <Text style={styles.paragraph}>
            HomeEase is a platform that connects customers with professional service providers for home maintenance and repair services. We act as an intermediary and do not directly provide the services.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You must create an account to use our services. You are responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account</Text>
          <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
          <Text style={styles.bulletPoint}>• Providing accurate and complete information</Text>
          <Text style={styles.bulletPoint}>• Updating your information as needed</Text>

          <Text style={styles.sectionTitle}>4. Service Bookings</Text>
          <Text style={styles.paragraph}>
            When you book a service through our platform:
          </Text>
          <Text style={styles.bulletPoint}>• You enter into a direct contract with the service provider</Text>
          <Text style={styles.bulletPoint}>• Prices are set by service providers and may vary</Text>
          <Text style={styles.bulletPoint}>• Cancellation policies apply as stated at booking</Text>
          <Text style={styles.bulletPoint}>• Payment is processed through our secure platform</Text>

          <Text style={styles.sectionTitle}>5. Payment Terms</Text>
          <Text style={styles.paragraph}>
            All payments must be made through the HomeEase platform. We accept various payment methods including credit cards, debit cards, and digital wallets. Service fees and charges will be clearly displayed before booking.
          </Text>

          <Text style={styles.sectionTitle}>6. Cancellation and Refunds</Text>
          <Text style={styles.paragraph}>
            Cancellation policies vary by service provider. Refunds are subject to the provider's cancellation policy and will be processed within 7-10 business days.
          </Text>

          <Text style={styles.sectionTitle}>7. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <Text style={styles.bulletPoint}>• Use the service for any illegal purpose</Text>
          <Text style={styles.bulletPoint}>• Harass or harm service providers or other users</Text>
          <Text style={styles.bulletPoint}>• Provide false or misleading information</Text>
          <Text style={styles.bulletPoint}>• Attempt to bypass our payment system</Text>
          <Text style={styles.bulletPoint}>• Share your account credentials with others</Text>

          <Text style={styles.sectionTitle}>8. Service Provider Responsibilities</Text>
          <Text style={styles.paragraph}>
            Service providers are independent contractors. HomeEase is not responsible for the quality, safety, or legality of services provided. However, we verify providers and monitor service quality.
          </Text>

          <Text style={styles.sectionTitle}>9. Liability Limitations</Text>
          <Text style={styles.paragraph}>
            HomeEase is not liable for any damages arising from the use of our platform or services provided by third-party providers. Our total liability is limited to the amount paid for the specific service.
          </Text>

          <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content on the HomeEase platform, including logos, text, graphics, and software, is owned by HomeEase and protected by intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>11. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            Any disputes arising from these terms will be resolved through arbitration in accordance with the laws of Pakistan. You agree to resolve disputes individually and not as part of a class action.
          </Text>

          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.sectionTitle}>13. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account at any time for violation of these terms or for any other reason at our discretion.
          </Text>

          <Text style={styles.sectionTitle}>14. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these terms, contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@homeease.com</Text>
          <Text style={styles.contactInfo}>Phone: +92 300 1234567</Text>
          <Text style={styles.contactInfo}>Address: Islamabad, Pakistan</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.textGrey,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.textBlack,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: COLORS.textBlack,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contactInfo: {
    fontSize: 15,
    color: COLORS.primaryGreen,
    lineHeight: 24,
    marginBottom: 4,
  },
});

export default TermsConditionsScreen;
