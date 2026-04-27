/**
 * Reset Onboarding Utility
 * Run this script to clear onboarding flag and see the full app flow
 * 
 * Usage: Add this to your test screen or run manually
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('@homeease_onboarding_complete');
    console.log('✅ Onboarding flag cleared!');
    console.log('🔄 Restart the app to see Splash → Onboarding → Role Selection');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing onboarding:', error);
    return { success: false, error };
  }
};

export const checkOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem('@homeease_onboarding_complete');
    console.log('Onboarding status:', value ? 'Complete' : 'Not complete');
    return value;
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return null;
  }
};

// Clear all app data (use with caution)
export const clearAllAppData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ All app data cleared!');
    console.log('🔄 Restart the app to see fresh installation flow');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing app data:', error);
    return { success: false, error };
  }
};
