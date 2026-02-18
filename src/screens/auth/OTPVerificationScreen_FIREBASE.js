import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { KeyboardDismissView } from '../../components/KeyboardDismissView';
import { verifyOTP, createUserProfile, sendOTP } from '../../services/firebaseAuthService';
import { CommonActions } from '@react-navigation/native';

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const { phoneNumber, confirmation, userData, verificationType } = route.params || {};

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

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a complete 6-digit OTP');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Verify OTP with Firebase
      const result = await verifyOTP(confirmation, otpCode);

      if (result.success) {
        console.log('OTP verified successfully');

        // Handle different verification types
        if (verificationType === 'signup') {
          // Create user profile in Firestore
          const profileResult = await createUserProfile(userData, result.user.uid);

          if (profileResult.success) {
            // Reset navigation stack and go to dashboard
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'CustomerDashboard' }],
              })
            );
          } else {
            Alert.alert('Error', 'Failed to create user profile');
          }
        } else if (verificationType === 'login') {
          // Just navigate to dashboard for login
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'CustomerDashboard' }],
            })
          );
        } else if (verificationType === 'password_reset') {
          // Navigate to reset password screen
          navigation.navigate('ResetPassword', {
            phoneNumber,
            userId: result.user.uid,
          });
        }
      } else {
        Alert.alert('Invalid OTP', result.error || 'Please check the code and try again');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);

    try {
      const result = await sendOTP(phoneNumber);

      if (result.success) {
        // Update confirmation object
        route.params.confirmation = result.confirmation;
        
        // Reset timer and OTP
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <KeyboardDismissView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📱</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {verificationType === 'password_reset' ? 'Verify Your Identity' : 'Verify Your Phone'}
        </Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to{'\n'}
          <Text style={styles.phone}>{phoneNumber || 'your phone'}</Text>
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Timer / Resend */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color={COLORS.primaryGreen} />
              ) : (
                <Text style={styles.resendText}>Resend Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!isOtpComplete || loading) && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={!isOtpComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Didn't receive the code? Check your messages
        </Text>
      </View>
    </KeyboardDismissView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.mainHeading,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.subHeading,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  phone: {
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 52,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textBlack,
    textAlign: 'center',
    backgroundColor: '#F9F9F9',
  },
  otpInputFilled: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0F9F4',
  },
  resendContainer: {
    marginBottom: 32,
    minHeight: 20,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  timerHighlight: {
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  verifyButton: {
    width: '100%',
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
    backgroundColor: '#D1D1D1',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  helpText: {
    fontSize: 13,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
