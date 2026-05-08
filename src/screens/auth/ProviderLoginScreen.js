import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { formatPakistaniPhone, cleanPhoneNumber, getPhoneError } from '../../utils/validation';
import { signInWithEmail } from '../../services/supabaseAuthService';
import { sendEmailOTP } from '../../services/emailOTPService';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="50" height="50" viewBox="0 0 50 50">
      <Circle cx="18" cy="25" r="15" fill={COLORS.primaryGreen} opacity="0.9" />
      <Circle cx="32" cy="25" r="15" fill={COLORS.primaryGreen} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
    <View style={styles.providerBadge}>
      <Text style={styles.providerBadgeText}>Service Provider</Text>
    </View>
  </View>
);

const ProviderLoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const alert = useAlert();
  
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (loginMethod === 'password' && !password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await signInWithEmail(email.trim(), password);
      
      if (result.success) {
        // Check if user is a provider
        if (result.userData?.role !== 'provider') {
          setLoading(false);
          alert.error('Invalid Account', 'This account is not registered as a service provider');
          return;
        }

        // Sign in to context
        await signIn(result.user, result.userData);
        
        setLoading(false);
        
        // Navigate based on provider status
        if (result.userData.isVerified) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProviderDashboard' }],
          });
        } else {
          // Provider needs to complete registration
          navigation.navigate('ProviderRegistrationIntro');
        }
      } else {
        setLoading(false);
        alert.error('Login Failed', result.error || 'Invalid email or password');
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Login error:', error);
      
      // Show user-friendly error message
      let errorTitle = 'Login Failed';
      let errorMessage = 'Unable to sign in. Please try again.';
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/user-not-found') {
        errorTitle = 'Invalid Credentials';
        errorMessage = 'The email or password you entered is incorrect. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = 'Too Many Attempts';
        errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      } else if (error.code === 'auth/user-disabled') {
        errorTitle = 'Account Disabled';
        errorMessage = 'This account has been disabled. Please contact support.';
      }
      
      alert.error(errorTitle, errorMessage);
    }
  };

  const handleOTPLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await sendEmailOTP(email.trim());
      
      setLoading(false);
      
      if (result.success) {
        alert.success('OTP Sent', 'Check your email for the verification code', () => {
          navigation.navigate('EmailOTPVerification', {
            email: email.trim(),
            verificationType: 'provider_login',
            role: 'provider',
          });
        });
      } else {
        alert.error('Failed', result.error || 'Could not send OTP');
      }
    } catch (error) {
      setLoading(false);
      console.error('OTP error:', error);
      alert.error('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleLogin = () => {
    if (loginMethod === 'otp') {
      handleOTPLogin();
    } else {
      handlePasswordLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Logo />

        <Text style={styles.title}>Provider Login</Text>
        <Text style={styles.subtitle}>Sign in to manage your services</Text>

        {/* Login Method Toggle */}
        <View style={styles.toggleMethodContainer}>
          <TouchableOpacity
            style={[styles.methodButton, loginMethod === 'password' && styles.methodButtonActive]}
            onPress={() => setLoginMethod('password')}
          >
            <Text style={[styles.methodButtonText, loginMethod === 'password' && styles.methodButtonTextActive]}>
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodButton, loginMethod === 'otp' && styles.methodButtonActive]}
            onPress={() => setLoginMethod('otp')}
          >
            <Text style={[styles.methodButtonText, loginMethod === 'otp' && styles.methodButtonTextActive]}>
              OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="your.email@example.com"
            placeholderTextColor={COLORS.textGrey}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password (only if password method selected) */}
        {loginMethod === 'password' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textGrey}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry
              editable={!loading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
        )}

        {/* Forgot Password */}
        {loginMethod === 'password' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {loginMethod === 'otp' ? 'Send OTP' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProviderSignup')}>
            <Text style={styles.toggleLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={alert.hide}
      />
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleMethodContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
  },
  methodButtonTextActive: {
    color: COLORS.primaryGreen,
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
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
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
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ProviderLoginScreen;
