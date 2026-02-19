import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, SafeAreaView } from 'react-native';
import Svg, { Path, Circle, Rect as SvgRect } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { getUserData, clearUserData } from '../services/userStorageService';

const MenuDrawer = ({ visible, onClose, navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (visible) {
      loadUserData();
    }
  }, [visible]);

  const loadUserData = async () => {
    const result = await getUserData();
    if (result.success && result.data) {
      setUserData(result.data);
    }
  };

  const handleLogout = async () => {
    await clearUserData();
    onClose();
    navigation.navigate('Login');
  };

  const menuItems = [
    {
      id: 'history',
      title: 'History',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      onPress: () => {
        onClose();
        navigation.navigate('History');
      },
    },
    {
      id: 'addresses',
      title: 'Addresses',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      onPress: () => {
        onClose();
        console.log('Addresses clicked');
      },
    },
    {
      id: 'payment',
      title: 'Payment methods',
      subtitle: 'JazzCash',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      badge: (
        <Svg width="32" height="20" viewBox="0 0 32 20">
          <SvgRect width="32" height="20" rx="3" fill="#FF6B00" />
        </Svg>
      ),
      onPress: () => {
        onClose();
        navigation.navigate('PaymentMethods');
      },
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      onPress: () => {
        onClose();
        navigation.navigate('Messages');
      },
    },
    {
      id: 'support',
      title: 'Support',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M12 1C8.96 1 6.5 3.46 6.5 6.5c0 1.33.47 2.55 1.26 3.5H7.5c-1.93 0-3.5 1.57-3.5 3.5v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7c0-1.93-1.57-3.5-3.5-3.5h-.26c.79-.95 1.26-2.17 1.26-3.5C17.5 3.46 15.04 1 12 1zm0 2c1.93 0 3.5 1.57 3.5 3.5S13.93 10 12 10s-3.5-1.57-3.5-3.5S10.07 3 12 3z"
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      onPress: () => {
        onClose();
        console.log('Support clicked');
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            fill={COLORS.textBlack}
          />
        </Svg>
      ),
      onPress: () => {
        onClose();
        navigation.navigate('Settings');
      },
    },
  ];

  console.log('MenuDrawer - Menu items count:', menuItems.length);

  const initials = userData?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.drawerContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <SafeAreaView style={styles.drawer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill={COLORS.textBlack}
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <TouchableOpacity 
              style={styles.profileSection}
              onPress={() => {
                onClose();
                navigation.navigate('Profile');
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
              </View>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 6 L13 10 L7 14" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
              </Svg>
            </TouchableOpacity>

            {/* Menu Items */}
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuIconContainer}>
                    {item.icon()}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.badge && (
                    <View style={styles.badgeContainer}>
                      {item.badge}
                    </View>
                  )}
                  <Svg width="20" height="20" viewBox="0 0 20 20">
                    <Path d="M7 6 L13 10 L7 14" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
                  </Svg>
                </TouchableOpacity>
              ))}

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
            </ScrollView>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.white,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.textBlack,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  badgeContainer: {
    marginRight: 12,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
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

export default MenuDrawer;
