import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';

const Logo = ({ colors }) => (
  <View style={styles.logoContainer}>
    <Svg width="50" height="50" viewBox="0 0 50 50">
      <Circle cx="18" cy="25" r="15" fill={colors.primary} opacity="0.9" />
      <Circle cx="32" cy="25" r="15" fill={colors.primary} opacity="0.9" />
    </Svg>
    <Text style={[styles.logoText, { color: colors.text }]}>HomeEase</Text>
  </View>
);

const EnhancedLoginScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const role = route?.params?.role || 'customer'; // 'customer' or 'provider'
  
  const [identifier, setIdentifier] = useState(''); // Email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter your email or phone number');
      return;
    }

    if (!password) {
      Alert.alert('Required', 'Please enter your password');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const result = await loginUser(identifier.trim(), password);

      setLoading(false);

      if (result.success) {
        // Check if user role matches
        if (result.user.role !== role) {
          Alert.alert(
            'Wrong Account Type',
            `This is a ${result.user.role} account. Please use the ${result.user.role} login.`
          );
          return;
        }

        // Save to auth context
        await signIn(result.user);

        // Navigate based on role
        if (role === 'provider') {
          navigation.replace('ProviderDashboard');
        } else {
          navigation.replace('CustomerDashboard');
        }
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleSignup = () => {
    if (role === 'provider') {
      navigation.navigate('ProviderRegistrationIntro');
    } else {
      navigation.navigate('CustomerSignup');
    }
  };

  return (
    <ScreenWrapper variant="light">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Logo colors={colors} />

        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to your {role} account
        </Text>

        {/* Email or Phone */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email or Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="your.email@example.com or 03001234567"
            placeholderTextColor={colors.placeholder}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Svg width="20" height="20" viewBox="0 0 20 20">
                {showPassword ? (
                  <Path
                    d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                    fill={colors.textSecondary}
                  />
                ) : (
                  <>
                    <Path
                      d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                      fill={colors.textSecondary}
                    />
                    <Path
                      d="M2 2l16 16"
                      stroke={colors.textSecondary}
                      strokeWidth="2"
                    />
                  </>
                )}
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword', { role })}
          style={styles.forgotPasswordContainer}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={[styles.toggleLink, { color: colors.primary }]}> Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Switch Role */}
        <TouchableOpacity
          style={styles.switchRoleContainer}
          onPress={() => {
            const newRole = role === 'customer' ? 'provider' : 'customer';
            navigation.replace('EnhancedLogin', { role: newRole });
          }}
        >
          <Text style={[styles.switchRoleText, { color: colors.primary }]}>
            {role === 'customer' 
              ? 'Are you a Service Provider? Login here' 
              : 'Are you a Customer? Login here'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: '700',
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRoleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchRoleText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default EnhancedLoginScreen;
