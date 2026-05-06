import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { getLegalEmail } from '../../services/emailSupportService';

const TermsConditionsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  
  return (
    <ScreenWrapper variant="default">
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: April 2026</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing and using HomeEase, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Service Description</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            HomeEase connects customers with professional home service providers. We act as an intermediary and do not directly provide services. Pricing is distance-based (Rs. 50 per km travel cost) plus negotiated service charges.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Customer Responsibilities</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>As a customer, you agree to:</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Provide an accurate and precise location when requesting a service</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Treat service providers with respect and professionalism</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Rate and review providers honestly and fairly</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Not submit false, misleading, or malicious complaints</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Not misuse the platform to harass or harm providers</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Pay the agreed amount (travel cost + negotiated service fee) upon completion</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Not attempt to bypass the platform's payment system</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Service Provider Responsibilities</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>As a service provider, you agree to:</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Behave professionally, politely, and respectfully toward all customers</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Never use abusive, threatening, or disrespectful language or behavior</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Provide honest, quality service as described</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Honor the pricing agreed upon after negotiation</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Arrive on time and communicate delays promptly</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Accept that your ratings directly affect your visibility and job assignments</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Understand that consistently negative reviews may result in account suspension or permanent ban</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Pricing & Distance-Based Charges</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Travel cost is calculated at Rs. 50 per kilometer from the provider's location to the customer's location. This is shown to the customer before confirming a booking. Service charges are negotiated directly between customer and provider through the in-app chat before work begins.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Rating & Review System</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Ratings and reviews directly affect provider visibility on the platform:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Providers with higher ratings receive more service requests</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Providers with poor ratings receive fewer requests</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Providers with consistently negative reviews may be automatically suspended</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Customers must leave honest reviews — false reviews violate these terms</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Provider Conduct & Account Suspension</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Any provider found to be abusive, dishonest, or unprofessional will face:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Warning and reduced visibility after first verified complaint</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Temporary suspension after repeated complaints</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Permanent account ban for severe or repeated misconduct</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. User Accounts</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You are responsible for maintaining the confidentiality of your account and all activities that occur under it. Provide accurate information and update it as needed.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Cancellation and Refunds</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Cancellation policies vary by service provider. Refunds are processed within 7-10 business days subject to the provider's cancellation policy.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Liability Limitations</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            HomeEase is not liable for damages arising from services provided by third-party providers. Our total liability is limited to the amount paid for the specific service.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Dispute Resolution</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Disputes will be resolved through arbitration in accordance with the laws of Pakistan. Both parties agree to resolve disputes individually.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>12. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>13. Contact Information</Text>
          <Text style={[styles.contactInfo, { color: colors.primary }]}>Email: {getLegalEmail()}</Text>
          <Text style={[styles.contactInfo, { color: colors.primary }]}>Phone: +92 300 1234567</Text>
          <Text style={[styles.contactInfo, { color: colors.primary }]}>Address: Islamabad, Pakistan</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
});

export default TermsConditionsScreen;
