import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/context/ThemeContext';
// Firebase AuthProvider disabled for Expo Go testing
// import { AuthProvider } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CustomerLoginScreen from './src/screens/auth/CustomerLoginScreen';
import CustomerSignupScreen from './src/screens/auth/CustomerSignupScreen';
import ProviderLoginScreen from './src/screens/auth/ProviderLoginScreen';
import ProviderSignupScreen from './src/screens/auth/ProviderSignupScreen';
import PendingVerificationScreen from './src/screens/auth/PendingVerificationScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import CustomerTabNavigator from './src/navigation/CustomerTabNavigator';
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

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      {/* Firebase AuthProvider disabled for Expo Go testing */}
      {/* <AuthProvider> */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={CustomerLoginScreen} />
          <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
          <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} />
          <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />
          <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} />
          <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="CustomerDashboard" component={CustomerTabNavigator} />
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
        </Stack.Navigator>
      </NavigationContainer>
      {/* </AuthProvider> */}
    </ThemeProvider>
  );
}
