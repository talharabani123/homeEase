import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const EditIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M14.06 3.94l2 2L5.92 16.08l-2.83.71.71-2.83L14.06 3.94zM17.66 1.34l-2 2-2-2 2-2 2 2z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill={COLORS.textGrey}
    />
  </Svg>
);

const LockIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M14 7h-1V5c0-1.66-1.34-3-3-3S7 3.34 7 5v2H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-4 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm2-9H8V5c0-.55.45-1 1-1s1 .45 1 1v2z"
      fill={COLORS.textGrey}
    />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"
      fill="#FF4444"
    />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path d="M7 6l5 5-5 5" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
  </Svg>
);

const ProfileScreen = ({ navigation }) => {
  // Mock user data
  const [userData] = useState({
    name: 'Muhammad Ali',
    phone: '+92 300 1234567',
    email: 'ali@example.com',
    address: 'House 123, Street 5, F-7, Islamabad',
    savedLocations: [
      { id: 1, label: 'Home', address: 'House 123, Street 5, F-7, Islamabad' },
      { id: 2, label: 'Office', address: 'Plot 45, Blue Area, Islamabad' },
    ],
  });

  // Safety checks
  const safeName = userData?.name || 'User';
  const safeSavedLocations = userData?.savedLocations || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userData.name);
  const [editedAddress, setEditedAddress] = useState(userData.address);

  const handleSaveProfile = () => {
    // TODO: Save to backend
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleResetPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  const handleAddLocation = () => {
    // TODO: Navigate to add location screen
    Alert.alert('Add Location', 'Location picker will be implemented');
  };

  const handleEditLocation = (location) => {
    // TODO: Navigate to edit location screen
    Alert.alert('Edit Location', `Edit ${location.label}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <EditIcon />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {safeName.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                />
              ) : (
                <Text style={styles.infoValue}>{userData.name}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{userData.phone}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.email || 'Not added'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, styles.addressInput]}
                  value={editedAddress}
                  onChangeText={setEditedAddress}
                  placeholder="Enter your address"
                  multiline
                />
              ) : (
                <Text style={[styles.infoValue, styles.addressValue]}>
                  {userData.address}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Saved Locations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Locations</Text>
            <TouchableOpacity onPress={handleAddLocation}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {safeSavedLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationCard}
              onPress={() => handleEditLocation(location)}
            >
              <View style={styles.locationIconContainer}>
                <LocationIcon />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{location.label}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleResetPassword}
            >
              <View style={styles.actionIconContainer}>
                <LockIcon />
              </View>
              <Text style={styles.actionText}>Reset Password</Text>
              <ChevronIcon />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.logoutCard]}
              onPress={handleLogout}
            >
              <View style={styles.actionIconContainer}>
                <LogoutIcon />
              </View>
              <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
              <ChevronIcon />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save/Cancel Buttons (when editing) */}
      {isEditing && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsEditing(false);
              setEditedName(userData.name);
              setEditedAddress(userData.address);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 12,
  },
  addButton: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  infoInput: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryGreen,
    paddingVertical: 4,
  },
  addressValue: {
    lineHeight: 22,
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },

  // Location Card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.textGrey,
    lineHeight: 18,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoutCard: {
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF9F9',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  logoutText: {
    color: '#FF4444',
  },

  // Bottom Container
  bottomContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
