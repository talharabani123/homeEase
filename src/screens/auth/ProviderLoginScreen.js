import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="60" height="60" viewBox="0 0 60 60">
      <Circle cx="22" cy="30" r="18" fill={COLORS.primaryGreen} opacity="0.9" />
      <Circle cx="38" cy="30" r="18" fill={COLORS.primaryGreen} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
    <View style={styles.providerBadge}>
      <Text style={styles.providerBadgeText}>Service Provider</Text>
    </View>
  </View>
);

const ProviderLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = () => {
    console.log('Provider Login:', { email, password });
    // TODO: Implement provider login API call
  };

  const handleSignup = () => {
    console.log('Provider Signup:', { email, password, phone });
    // TODO: Implement provider signup API call
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <Logo />

        {/* Title */}
        <Text style={styles.title}>
          {isSignup ? 'Join as Provider' : 'Provider Login'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignup ? 'Start earning by helping customers' : 'Sign in to manage your services'}
        </Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.textGrey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {isSignup && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.textGrey}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textGrey}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Forgot Password */}
        {!isSignup && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword', { isProvider: true })}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Login/Signup Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={isSignup ? handleSignup : handleLogin}
        >
          <Text style={styles.primaryButtonText}>
            {isSignup ? 'Sign Up as Provider' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Toggle Signup/Login */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isSignup ? 'Already registered?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.toggleLink}>
              {isSignup ? ' Sign In' : ' Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Customer Login Link */}
        <TouchableOpacity
          style={styles.customerLinkContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.customerLinkText}>
            Looking for services? Customer login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginTop: 12,
  },
  providerBadge: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  title: {
    fontSize: TYPOGRAPHY.mainHeading,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.subHeading,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textBlack,
    backgroundColor: '#F9F9F9',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  primaryButton: {
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  customerLinkContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  customerLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
    textDecorationLine: 'underline',
  },
});

export default ProviderLoginScreen;
