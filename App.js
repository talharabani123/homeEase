import 'react-native-gesture-handler';
// import './src/config/firebase'; // Initialize Firebase - COMMENTED OUT FOR EXPO GO
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OnboardingScreen1 from './src/screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from './src/screens/onboarding/OnboardingScreen3';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CustomerLoginScreen from './src/screens/auth/CustomerLoginScreen';
import CustomerSignupScreen from './src/screens/auth/CustomerSignupScreen';
import EnhancedLoginScreen from './src/screens/auth/EnhancedLoginScreen';
import EmailAuthScreen from './src/screens/auth/EmailAuthScreen';
import EmailVerificationHandler from './src/screens/auth/EmailVerificationHandler';
import EmailOTPVerificationScreen from './src/screens/auth/EmailOTPVerificationScreen';
import ProviderLoginScreen from './src/screens/auth/ProviderLoginScreen';
import ProviderSignupScreen from './src/screens/auth/ProviderSignupScreen';
import PendingVerificationScreen from './src/screens/auth/PendingVerificationScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import CustomerTabNavigator from './src/navigation/CustomerTabNavigator';
import ProviderTabNavigator from './src/navigation/ProviderTabNavigator';
import PaymentMethodsScreen from './src/screens/customer/PaymentMethodsScreen';
import SettingsScreen from './src/screens/customer/SettingsScreen';
import AddressScreen from './src/screens/customer/AddressScreen';
import SupportScreen from './src/screens/customer/SupportScreen';
import SafetyScreen from './src/screens/customer/SafetyScreen';
import NotificationsScreen from './src/screens/customer/NotificationsScreen';
import HelpScreen from './src/screens/customer/HelpScreen';
import LanguageScreen from './src/screens/customer/LanguageScreen';
import PrivacyPolicyScreen from './src/screens/customer/PrivacyPolicyScreen';
import TermsConditionsScreen from './src/screens/customer/TermsConditionsScreen';
import ServiceRequestScreen from './src/screens/customer/ServiceRequestScreen';
import ProviderMatchingScreen from './src/screens/customer/ProviderMatchingScreen';
import ProviderDetailsScreen from './src/screens/customer/ProviderDetailsScreen';
import LiveTrackingScreen from './src/screens/customer/LiveTrackingScreen';
import PaymentScreen from './src/screens/customer/PaymentScreen';
import RatingScreen from './src/screens/customer/RatingScreen';
import WalletScreen from './src/screens/customer/WalletScreen';
import NearbyProvidersScreen from './src/screens/customer/NearbyProvidersScreen';
import LocationPickerScreen from './src/screens/customer/LocationPickerScreen';
// Service Request Screens
import ServicesListScreen from './src/screens/customer/ServicesListScreen';
import ServiceDetailScreen from './src/screens/customer/ServiceDetailScreen';
import RequestServiceFormScreen from './src/screens/customer/RequestServiceFormScreen';
import OfferListScreen from './src/screens/customer/OfferListScreen';
import ChatScreen from './src/screens/customer/ChatScreen';
import TopRatedProvidersScreen from './src/screens/customer/TopRatedProvidersScreen';
import ProfileScreen from './src/screens/customer/ProfileScreen';
import SearchScreen from './src/screens/customer/SearchScreen';
import EmergencyServiceScreen from './src/screens/customer/EmergencyServiceScreen';
// Emergency Screens
import EmergencySelectScreen from './src/screens/emergency/EmergencySelectScreen';
import EmergencyLocationScreen from './src/screens/emergency/EmergencyLocationScreen';
import EmergencyHomeScreen from './src/screens/emergency/EmergencyHomeScreen';
import StandardEmergencyScreen from './src/screens/emergency/StandardEmergencyScreen';
import NonStandardEmergencyScreen from './src/screens/emergency/NonStandardEmergencyScreen';
import EmergencySearchingScreen from './src/screens/emergency/EmergencySearchingScreen';
import EmergencyOffersScreen from './src/screens/emergency/EmergencyOffersScreen';
// EmergencyTrackingScreen loaded inline below to avoid cache issues
// Provider Registration Screens
import ProviderRegistrationIntroScreen from './src/screens/provider/ProviderRegistrationIntroScreen';
import ServiceSelectionScreen from './src/screens/provider/ServiceSelectionScreen';
// import PersonalInfoScreen from './src/screens/provider/PersonalInfoScreen';
import PersonalInfoScreen from './src/screens/provider/PersonalInfoScreenSimple';
import ProfessionalInfoScreen from './src/screens/provider/ProfessionalInfoScreen';
import CNICVerificationScreen from './src/screens/provider/CNICVerificationScreen';
import SelfieVerificationScreen from './src/screens/provider/SelfieVerificationScreen';
import ProofOfServiceScreen from './src/screens/provider/ProofOfServiceScreen';
import ProviderAgreementScreen from './src/screens/provider/ProviderAgreementScreen';
import SubmissionStatusScreen from './src/screens/provider/SubmissionStatusScreen';
import ProviderJobHistoryScreen from './src/screens/provider/ProviderJobHistoryScreen';
import ProviderWalletScreen from './src/screens/provider/ProviderWalletScreen';
// Real-Time Job Flow Screens
import JobTrackingScreen from './src/screens/customer/JobTrackingScreenEnhanced';
import JobChatScreen from './src/screens/customer/JobChatScreen';
import ActiveJobScreen from './src/screens/provider/ActiveJobScreen';
import ResetOnboardingScreen from './src/screens/ResetOnboardingScreen';
// Map Screens - DISABLED FOR EXPO GO (react-native-maps not supported)
// Uncomment these when building standalone app
// import CustomerMapScreen from './src/screens/customer/CustomerMapScreen';
// import ProviderMapScreen from './src/screens/provider/ProviderMapScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
            <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
            <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationHandler} />
            <Stack.Screen name="EnhancedLogin" component={EnhancedLoginScreen} />
            <Stack.Screen name="Login" component={CustomerLoginScreen} />
            <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
            <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} />
            <Stack.Screen name="EmailOTPVerification" component={EmailOTPVerificationScreen} />
            <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />
            <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} />
            <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="CustomerDashboard" component={CustomerTabNavigator} />
            <Stack.Screen name="ProviderDashboard" component={ProviderTabNavigator} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="Safety" component={SafetyScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            <Stack.Screen name="NearbyProviders" component={NearbyProvidersScreen} />
            <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
            <Stack.Screen name="ServicesList" component={ServicesListScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen name="RequestServiceForm" component={RequestServiceFormScreen} />
            <Stack.Screen name="OfferList" component={OfferListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="TopRatedProviders" component={TopRatedProvidersScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="EmergencyService" component={EmergencyServiceScreen} />
            <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
            <Stack.Screen name="ProviderMatching" component={ProviderMatchingScreen} />
            <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
            <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Rating" component={RatingScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="EmergencySelect" component={EmergencySelectScreen} />
            <Stack.Screen name="EmergencyLocation" component={EmergencyLocationScreen} />
            <Stack.Screen name="EmergencyHome" component={EmergencyHomeScreen} />
            <Stack.Screen name="StandardEmergency" component={StandardEmergencyScreen} />
            <Stack.Screen name="NonStandardEmergency" component={NonStandardEmergencyScreen} />
            <Stack.Screen name="EmergencySearching" component={EmergencySearchingScreen} />
            <Stack.Screen name="EmergencyOffers" component={EmergencyOffersScreen} />
            {/* <Stack.Screen name="EmergencyTracking" component={EmergencyTrackingScreen} /> */}
            <Stack.Screen name="ProviderRegistrationIntro" component={ProviderRegistrationIntroScreen} />
            <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="ProfessionalInfo" component={ProfessionalInfoScreen} />
            <Stack.Screen name="CNICVerification" component={CNICVerificationScreen} />
            <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen} />
            <Stack.Screen name="ProofOfService" component={ProofOfServiceScreen} />
            <Stack.Screen name="ProviderAgreement" component={ProviderAgreementScreen} />
            <Stack.Screen name="SubmissionStatus" component={SubmissionStatusScreen} />
            <Stack.Screen name="JobTracking" component={JobTrackingScreen} />
            <Stack.Screen name="JobTrackingScreenEnhanced" component={JobTrackingScreen} />
            <Stack.Screen name="JobChat" component={JobChatScreen} />
            <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
            <Stack.Screen name="ResetOnboarding" component={ResetOnboardingScreen} />
            <Stack.Screen name="ProviderJobHistory" component={ProviderJobHistoryScreen} />
            <Stack.Screen name="ProviderWallet" component={ProviderWalletScreen} />
            {/* Map Screens - DISABLED FOR EXPO GO */}
            {/* <Stack.Screen name="CustomerMap" component={CustomerMapScreen} /> */}
            {/* <Stack.Screen name="ProviderMap" component={ProviderMapScreen} /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
