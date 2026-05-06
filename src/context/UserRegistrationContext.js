import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserRegistrationContext = createContext();

export const useUserRegistration = () => {
  const context = useContext(UserRegistrationContext);
  if (!context) {
    throw new Error('useUserRegistration must be used within UserRegistrationProvider');
  }
  return context;
};

const STORAGE_KEY = '@user_registration_data';

export const UserRegistrationProvider = ({ children }) => {
  const [registrationData, setRegistrationData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phoneNumber: '',
    cnicNumber: '',
    address: '',
    dateOfBirth: '',
    
    // Professional Information (for providers)
    experience: '',
    skills: [],
    services: [],
    workingHours: '',
    serviceArea: '',
    
    // Verification Data
    selfieUri: null,
    cnicFrontUri: null,
    cnicBackUri: null,
    documentsUri: [],
    
    // Application Status
    applicationId: null,
    submissionDate: null,
    status: 'pending', // pending, approved, rejected
    
    // User Role
    role: null, // 'customer' or 'provider'
  });

  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadRegistrationData();
  }, []);

  const loadRegistrationData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setRegistrationData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading registration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRegistrationData = async (newData) => {
    try {
      const updatedData = { ...registrationData, ...newData };
      setRegistrationData(updatedData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return { success: true };
    } catch (error) {
      console.error('Error saving registration data:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePersonalInfo = async (personalData) => {
    return await saveRegistrationData(personalData);
  };

  const updateProfessionalInfo = async (professionalData) => {
    return await saveRegistrationData(professionalData);
  };

  const updateVerificationData = async (verificationData) => {
    return await saveRegistrationData(verificationData);
  };

  const setSelfieImage = async (uri) => {
    return await saveRegistrationData({ selfieUri: uri });
  };

  const setCNICImages = async (frontUri, backUri) => {
    return await saveRegistrationData({ 
      cnicFrontUri: frontUri, 
      cnicBackUri: backUri 
    });
  };

  const setUserRole = async (role) => {
    return await saveRegistrationData({ role });
  };

  const submitApplication = async () => {
    const applicationId = `APP${Date.now()}`;
    const submissionDate = new Date().toISOString();
    
    return await saveRegistrationData({
      applicationId,
      submissionDate,
      status: 'pending'
    });
  };

  const clearRegistrationData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setRegistrationData({
        fullName: '',
        email: '',
        phoneNumber: '',
        cnicNumber: '',
        address: '',
        dateOfBirth: '',
        experience: '',
        skills: [],
        services: [],
        workingHours: '',
        serviceArea: '',
        selfieUri: null,
        cnicFrontUri: null,
        cnicBackUri: null,
        documentsUri: [],
        applicationId: null,
        submissionDate: null,
        status: 'pending',
        role: null,
      });
      return { success: true };
    } catch (error) {
      console.error('Error clearing registration data:', error);
      return { success: false, error: error.message };
    }
  };

  const isDataComplete = () => {
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'cnicNumber', 'address'];
    return requiredFields.every(field => registrationData[field] && registrationData[field].trim() !== '');
  };

  const getDisplayName = () => {
    return registrationData.fullName || 'User';
  };

  const getProfileImage = () => {
    return registrationData.selfieUri || null;
  };

  const value = {
    registrationData,
    loading,
    updatePersonalInfo,
    updateProfessionalInfo,
    updateVerificationData,
    setSelfieImage,
    setCNICImages,
    setUserRole,
    submitApplication,
    clearRegistrationData,
    isDataComplete,
    getDisplayName,
    getProfileImage,
    saveRegistrationData,
  };

  return (
    <UserRegistrationContext.Provider value={value}>
      {children}
    </UserRegistrationContext.Provider>
  );
};