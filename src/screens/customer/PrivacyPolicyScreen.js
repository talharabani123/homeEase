import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { getPrivacyEmail } from '../../services/emailSupportService';

const PrivacyPolicyScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: February 17, 2026</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We collect information you provide directly to us, including your name, email address, phone number, location data, and payment information when you use our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Provide, maintain, and improve our services</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Process transactions and send related information</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Send you technical notices and support messages</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Respond to your comments and questions</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Monitor and analyze trends and usage</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Information Sharing</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may share your information with:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Service providers who perform services on our behalf</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Professional service providers you book through our platform</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Law enforcement when required by law</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Security</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no internet transmission is completely secure.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Rights</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Access your personal information</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Correct inaccurate information</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Request deletion of your information</Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>• Opt-out of marketing communications</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Location Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We collect location data to connect you with nearby service providers. You can disable location services in your device settings, but this may limit app functionality.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Cookies and Tracking</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve user experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Our service is not intended for children under 18. We do not knowingly collect personal information from children under 18.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Changes to Privacy Policy</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have questions about this privacy policy, please contact us at:
          </Text>
          <Text style={[styles.contactInfo, { color: colors.primary }]}>Email: {getPrivacyEmail()}</Text>
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

export default PrivacyPolicyScreen;
