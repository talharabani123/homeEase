import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { verifyEmailOTP, resendOTP, getUserProfile } from '../../services/supabaseAuthService';
import { getProviderProfile } from '../../services/supabaseProviderService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../context/AuthContext';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="50" height="50" viewBox="0 0 50 50">
      <Circle cx="18" cy="25" r="15" fill={COLORS.textBlack} opacity="0.9" />
      <Circle cx="32" cy="25" r="15" fill={COLORS.textBlack} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
  </View>
);

const EmailOTPVerificationScreen = ({ route, navigation }) => {
  const { email, userData, otpId, devOTP, isReVerification = false, isRegistration = false, selectedServices, role, providerFullName, providerPhone } = route.params || {};
  const { signIn } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [currentOtpId, setCurrentOtpId] = useState(otpId);
  const [currentDevOTP, setCurrentDevOTP] = useState(devOTP);
  const alert = useAlert();
  
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Show dev OTP in development
  useEffect(() => {
    if (currentDevOTP && __DEV__) {
      alert.info('Development Mode', `OTP: ${currentDevOTP}\n\nThis will be removed in production.`);
    }
  }, [currentDevOTP]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(index + pastedOtp.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      alert.warning('Invalid OTP', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with Supabase
      const verifyResult = await verifyEmailOTP(email, otpCode);
      
      if (!verifyResult.success) {
        setLoading(false);
        alert.error('Verification Failed', verifyResult.error);
        return;
      }

      // OTP verified successfully - user is now logged in!
      // Update AuthContext with verified user
      if (verifyResult.user) {
        const profileResult = await getUserProfile(verifyResult.user.id);
        await signIn(verifyResult.user, profileResult.data);
      }

      setLoading(false);

      // Determine where to navigate based on the flow
      let navigateTo = null;
      let navigateParams = null;

      if (isRegistration && selectedServices) {
        navigateTo = 'PersonalInfo';
        navigateParams = { selectedServices, userEmail: email, providerFullName, providerPhone };
      } else if (role === 'provider' || isRegistration) {
        navigateTo = 'ProviderRegistrationIntro';
      } else {
        // Customer signup/login — go straight to dashboard
        navigateTo = 'CustomerDashboard';
      }

      // Show success alert for feedback, but navigate immediately so that
      // tapping the overlay (onDismiss) can never block the navigation.
      alert.success(
        'Email Verified! ✅',
        role === 'provider' || isRegistration
          ? 'Your email has been verified.'
          : 'Welcome to HomeEase! You can now start booking services.',
      );

      // Navigate immediately — don't wait for alert OK button
      if (navigateTo === 'PersonalInfo') {
        navigation.navigate(navigateTo, navigateParams);
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: navigateTo }],
        });
      }
    } catch (error) {
      setLoading(false);
      alert.error('Error', 'Something went wrong. Please try again.');
      console.error('OTP Verification error:', error);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    try {
      const result = await resendOTP(email);
      
      setResending(false);

      if (result.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
        if (result.devOTP) {
          setCurrentDevOTP(result.devOTP);
        }
        
        alert.success('OTP Resent', 'A new OTP has been sent to your email.');
      } else {
        alert.error('Error', result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setResending(false);
      alert.error('Error', 'Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.content}>
        <Logo />

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
              <Text style={styles.resendText}>
                {resending ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in {timer}s
            </Text>
          )}
        </View>

        {/* Back to Signup */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Change Email</Text>
        </TouchableOpacity>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginTop: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.mainHeading,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  email: {
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textBlack,
    textAlign: 'center',
    backgroundColor: '#F9F9F9',
  },
  otpInputFilled: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0F9F5',
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  timerText: {
    fontSize: 15,
    color: COLORS.textGrey,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textGrey,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
  },
});

export default EmailOTPVerificationScreen;
