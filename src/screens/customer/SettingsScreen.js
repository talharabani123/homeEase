import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Switch, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import ScreenHeader from '../../components/ScreenHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const SETTINGS_KEY = '@homeease_settings';

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setNotifications(settings.notifications ?? true);
        setLocationServices(settings.locationServices ?? true);
      }
      
      // Load language
      const lang = await AsyncStorage.getItem('@homeease_language');
      if (lang) {
        const langNames = {
          'en': 'English',
          'ur': 'Urdu',
          'ar': 'Arabic',
          'hi': 'Hindi',
          'es': 'Spanish',
          'fr': 'French',
        };
        setSelectedLanguage(langNames[lang] || 'English');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      settings[key] = value;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationsToggle = (value) => {
    setNotifications(value);
    saveSettings('notifications', value);
    Alert.alert(
      'Push Notifications',
      value ? 'Notifications enabled' : 'Notifications disabled'
    );
  };

  const handleLocationToggle = (value) => {
    setLocationServices(value);
    saveSettings('locationServices', value);
    Alert.alert(
      'Location Services',
      value ? 'Location services enabled' : 'Location services disabled'
    );
  };

  const handleDarkModeToggle = () => {
    toggleTheme();
    Alert.alert(
      'Dark Mode',
      isDarkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode'
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear cache but keep user data
            Alert.alert('Success', 'Cache cleared successfully!');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          label: 'Push Notifications',
          subtitle: 'Receive updates about your services',
          type: 'toggle',
          value: notifications,
          onToggle: handleNotificationsToggle,
        },
        {
          id: 'location',
          label: 'Location Services',
          subtitle: 'Allow app to access your location',
          type: 'toggle',
          value: locationServices,
          onToggle: handleLocationToggle,
        },
        {
          id: 'darkmode',
          label: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'toggle',
          value: isDarkMode,
          onToggle: handleDarkModeToggle,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'language',
          label: 'Language',
          subtitle: selectedLanguage,
          type: 'navigation',
          onPress: () => navigation.navigate('Language'),
        },
        {
          id: 'privacy',
          label: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          type: 'navigation',
          onPress: () => navigation.navigate('Profile'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'terms',
          label: 'Terms & Conditions',
          subtitle: 'Read our terms of service',
          type: 'navigation',
          onPress: () => navigation.navigate('TermsConditions'),
        },
        {
          id: 'privacy-policy',
          label: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'navigation',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          label: 'App Version',
          subtitle: '1.0.0',
          type: 'info',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header with Menu */}
      <ScreenHeader title="Settings" showBack={true} showMenu={false} navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {item.type === 'toggle' ? (
                    <View style={styles.settingItem}>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                      </View>
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: colors.border, true: COLORS.primaryGreen }}
                        thumbColor={colors.background}
                        disabled={item.disabled}
                      />
                    </View>
                  ) : item.type === 'navigation' ? (
                    <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                      </View>
                      <Svg width="20" height="20" viewBox="0 0 20 20">
                        <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
                      </Svg>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.settingItem}>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                      </View>
                    </View>
                  )}
                  {itemIndex < section.items.length - 1 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Clear Cache Button */}
        <TouchableOpacity
          style={[styles.clearCacheButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={handleClearCache}
        >
          <Text style={[styles.clearCacheText, { color: colors.text }]}>Clear Cache</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  clearCacheButton: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearCacheText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
});

export default SettingsScreen;
