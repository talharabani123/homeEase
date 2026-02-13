import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

export default function App() {
  return (
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
