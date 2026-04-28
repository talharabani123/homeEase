import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getUserRole, canSwitchToProvider } from '../../services/roleManagementService';
import { getProviderProfile } from '../../services/providerRegistrationService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const MoreScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, userData, currentMode, switchMode, signOut: authSignOut } = useAuth();
  const alert = useAlert();
  
  const [userRole, setUserRole] = useState('customer');
  const [providerStatus, setProviderStatus] = useState(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const checkProviderStatus = async () => {
    try {
      // Get user role
      const roleResult = await getUserRole();
      if (roleResult.success) {
        setUserRole(roleResult.role);
      }

      // Check if user can switch to provider mode
      const canSwitchResult = await canSwitchToProvider();
      setCanSwitch(canSwitchResult);

      // Get provider profile if exists
      const profileResult = await getProviderProfile();
      if (profileResult.success && profileResult.data) {
        setProviderStatus(profileResult.data);
      }
    } catch (error) {
      console.error('Error checking provider status:', error);
    }
  };

  const handleSwitchMode = async () => {
    try {
      setSwitchingMode(true);
      
      const newMode = currentMode === 'customer' ? 'provider' : 'customer';
      const result = await switchMode(newMode);
      
      setSwitchingMode(false);
      
      if (result.success) {
        alert.success(
          'Mode Switched',
          `You are now in ${newMode === 'provider' ? 'Provider' : 'Customer'} mode`,
          () => {
            if (newMode === 'provider') {
              navigation.navigate('ProviderDashboard');
            } else {
              navigation.navigate('CustomerDashboard');
            }
          }
        );
      } else {
        alert.error('Error', result.error || 'Failed to switch mode');
      }
    } catch (error) {
      setSwitchingMode(false);
      console.error('Switch mode error:', error);
      alert.error('Error', 'Something went wrong');
    }
  };

  const handleLogout = () => {
    alert.confirm(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        setLoading(true);
        const result = await authSignOut();
        setLoading(false);
        
        if (result.success) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } else {
          alert.error('Error', 'Failed to logout. Please try again.');
        }
      }
    );
  };

  // Dynamic provider/mode button based on user role and status
  const getProviderButton = () => {
    // If user is verified provider (can switch modes)
    if (canSwitch && providerStatus?.isVerified) {
      return {
        id: 'switchMode',
        label: currentMode === 'customer' ? 'Switch to Provider Mode' : 'Switch to Customer Mode',
        subtitle: currentMode === 'customer' ? 'Start receiving job requests' : 'Browse and hire services',
        icon: () => (
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
              fill="#10B981"
            />
          </Svg>
        ),
        onPress: handleSwitchMode,
        highlight: true,
        loading: switchingMode,
      };
    }
    
    // If user is pending verification
    if (providerStatus && !providerStatus.isVerified) {
      return {
        id: 'pendingVerification',
        label: 'Provider Registration Pending',
        subtitle: 'Your application is under review',
        icon: () => (
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#F59E0B"
            />
          </Svg>
        ),
        onPress: () => navigation.navigate('SubmissionStatus'),
        highlight: true,
      };
    }
    
    // Default: Show "Become a Provider" for customers
    return {
      id: 'provider',
      label: 'Earn as a Service Provider',
      subtitle: 'Register and start earning',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"
            fill="#F59E0B"
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('ProviderRegistrationIntro'),
      highlight: true,
    };
  };

  const providerButton = getProviderButton();

  const menuItems = [
    providerButton,
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

  // Get user display data with safety checks
  const safeName = userData?.fullName || user?.displayName || 'Guest User';
  const safeEmail = userData?.email || user?.email || '';
  const safePhone = userData?.phone || 'Not logged in';
  const safeProfileImage = userData?.profileImage || user?.photoURL || null;
  const initials = safeName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

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
          <View style={[styles.profileAvatarWrap, { backgroundColor: COLORS.primaryGreen }]}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{safeName}</Text>
            {safeEmail ? (
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>{safeEmail}</Text>
            ) : null}
            <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>{safePhone}</Text>
          </View>
          <View style={[styles.editBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.editBadgeText, { color: COLORS.primaryGreen }]}>Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem, 
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                item.highlight && { borderColor: '#F59E0B', borderWidth: 2, backgroundColor: '#FEF3C7' }
              ]}
              onPress={item.onPress}
              disabled={item.loading}
            >
              <View style={styles.menuIconContainer}>
                {item.icon()}
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                )}
              </View>
              {item.loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
                </Svg>
              )}
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
    </ScreenWrapper>
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
    padding: 18,
    marginTop: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  profileAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 1,
  },
  profilePhone: {
    fontSize: 13,
  },
  editBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBadgeText: {
    fontSize: 13,
    fontWeight: '700',
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
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
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
