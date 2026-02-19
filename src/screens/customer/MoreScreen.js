import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Image, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { getUserData, clearUserData } from '../../services/userStorageService';
import { useTheme } from '../../context/ThemeContext';

const MoreScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const result = await getUserData();
    if (result.success && result.data) {
      setUserData(result.data);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearUserData();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'payment',
      label: 'Payment Methods',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'address',
      label: 'Address',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Address'),
    },
    {
      id: 'support',
      label: 'Support',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 1C8.96 1 6.5 3.46 6.5 6.5c0 1.33.47 2.55 1.26 3.5H7.5c-1.93 0-3.5 1.57-3.5 3.5v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7c0-1.93-1.57-3.5-3.5-3.5h-.26c.79-.95 1.26-2.17 1.26-3.5C17.5 3.46 15.04 1 12 1zm0 2c1.93 0 3.5 1.57 3.5 3.5S13.93 10 12 10s-3.5-1.57-3.5-3.5S10.07 3 12 3z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'safety',
      label: 'Safety Information',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Safety'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'help',
      label: 'Help',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Help'),
    },
  ];

  const initials = userData?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity
          style={[styles.profileSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => navigation.navigate('Profile')}
        >
          {userData?.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{userData?.fullName || 'Guest User'}</Text>
            <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>{userData?.phoneNumber || 'Not logged in'}</Text>
          </View>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                {item.icon()}
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={handleLogout}>
          <View style={styles.logoutIconContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                fill="#FF4444"
              />
            </Svg>
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
  },
});

export default MoreScreen;
