import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { getUserData, clearUserData } from '../services/userStorageService';

// Import Screens
import CustomerTabNavigator from './CustomerTabNavigator';
import PaymentMethodsScreen from '../screens/customer/PaymentMethodsScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import AddressScreen from '../screens/customer/AddressScreen';
import SupportScreen from '../screens/customer/SupportScreen';
import SafetyScreen from '../screens/customer/SafetyScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import HelpScreen from '../screens/customer/HelpScreen';

const Drawer = createDrawerNavigator();

// Custom Drawer Content
function CustomDrawerContent(props) {
  const { navigation } = props;
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const result = await getUserData();
    if (result.success && result.data) {
      setUserData(result.data);
    }
  };

  const handleLogout = async () => {
    await clearUserData();
    navigation.navigate('Login');
  };

  const menuItems = [
    {
      id: 'payment',
      label: 'Payment Methods',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
            fill={COLORS.textBlack}
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
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L15.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L4.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            fill={COLORS.textBlack}
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
            fill={COLORS.textBlack}
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
            fill={COLORS.textBlack}
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
            fill={COLORS.textBlack}
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
            fill={COLORS.textBlack}
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
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      onPress: () => navigation.navigate('Help'),
    },
  ];

  const initials = userData?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <View style={styles.drawerContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => {
            navigation.closeDrawer();
            navigation.navigate('Home', { screen: 'Profile' });
          }}
        >
          {userData?.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.fullName || 'Guest User'}</Text>
            <Text style={styles.profilePhone}>{userData?.phoneNumber || 'Not logged in'}</Text>
            {userData?.email && <Text style={styles.profileEmail}>{userData.email}</Text>}
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                {item.icon()}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 6 L13 10 L7 14" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HomeEase v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const CustomerDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '80%',
        },
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="Home" component={CustomerTabNavigator} />
      <Drawer.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Address" component={AddressScreen} />
      <Drawer.Screen name="Support" component={SupportScreen} />
      <Drawer.Screen name="Safety" component={SafetyScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primaryGreen,
    paddingTop: 50,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 2,
  },
  menuSection: {
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textBlack,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textGrey,
  },
});

export default CustomerDrawerNavigator;
