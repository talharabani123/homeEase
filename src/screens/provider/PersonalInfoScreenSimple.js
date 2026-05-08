import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft, loadDraft } from '../../services/supabaseProviderService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const PersonalInfoScreenSimple = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { selectedServices, userEmail, userId } = route.params;
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(userEmail || ''); // Pre-fill from signup
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const result = await loadDraft();
    if (result.success && result.data) {
      const data = result.data;
      if (data.fullName) setFullName(data.fullName);
      if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
      // Only load email from draft if not provided from signup
      if (data.email && !userEmail) setEmail(data.email);
      if (data.dateOfBirth) setDateOfBirth(data.dateOfBirth);
      if (data.city) setCity(data.city);
      if (data.residentialAddress) setResidentialAddress(data.residentialAddress);
    }
  };

  const handleContinue = async () => {
    if (!fullName || !phoneNumber || !email || !city || !residentialAddress) {
      alert.error('Required Fields', 'Please fill all required fields');
      return;
    }

    // Validate email
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    const registrationData = {
      selectedServices,
      fullName,
      phoneNumber,
      email,
      dateOfBirth,
      city,
      residentialAddress,
      currentStep: 2
    };

    // Save to Firestore
    const saveResult = await saveDraft(registrationData);
    
    setLoading(false);

    if (saveResult.success) {
      navigation.navigate('ProfessionalInfo', { registrationData });
    } else {
      alert.error('Error', 'Failed to save progress. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '40%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 2 of 8</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Please provide your personal details
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="Enter your full name"
            placeholderTextColor={colors.placeholder}
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="03001234567"
            placeholderTextColor={colors.placeholder}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: userEmail ? colors.disabled : colors.inputBackground, 
                borderColor: colors.inputBorder, 
                color: colors.text 
              }
            ]}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading && !userEmail} // Disable if email came from signup
          />
          {userEmail && (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Email from your account (cannot be changed)
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Date of Birth (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.placeholder}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            editable={!loading}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Format: YYYY-MM-DD (e.g., 1990-01-15)
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>City *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="Enter your city"
            placeholderTextColor={colors.placeholder}
            value={city}
            onChangeText={setCity}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Residential Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="House/Flat no, Street, Area"
            placeholderTextColor={colors.placeholder}
            value={residentialAddress}
            onChangeText={setResidentialAddress}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalInfoScreenSimple;
