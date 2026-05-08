import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/supabaseAuthService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import * as ImagePicker from 'expo-image-picker';

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
  const { user, userData, signOut: authSignOut, refreshUserData } = useAuth();
  const alert = useAlert();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState({
    fullName: '',
    address: '',
    phone: '',
    profileImage: null,
  });

  // Load user data when component mounts or userData changes
  useEffect(() => {
    if (userData) {
      setEditedData({
        fullName: userData.fullName || '',
        address: userData.address || '',
        phone: userData.phone || '',
        profileImage: userData.profileImage || null,
      });
    }
  }, [userData]);

  // Safety checks
  const safeName = userData?.fullName || user?.displayName || 'User';
  const safeEmail = userData?.email || user?.email || 'Not available';
  const safePhone = userData?.phone || 'Not added';
  const safeAddress = userData?.address || 'Not added';
  const safeProfileImage = userData?.profileImage || user?.photoURL || null;

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert.warning(
          'Permission Required',
          'Please allow access to your photos to upload a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setEditedData({ ...editedData, profileImage: result.assets[0].uri });
      }
    } catch (error) {
      alert.error('Error', 'Failed to pick image');
    }
  };

  const handleSaveProfile = async () => {
    if (!editedData.fullName.trim()) {
      alert.warning('Validation Error', 'Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      const updates = {
        fullName: editedData.fullName.trim(),
        address: editedData.address.trim(),
        phone: editedData.phone.trim(),
        profileImage: editedData.profileImage,
      };

      const result = await updateUserProfile(user.uid, updates);

      setLoading(false);

      if (result.success) {
        // Refresh user data in context
        await refreshUserData();
        setIsEditing(false);
        alert.success('Success', 'Profile updated successfully');
      } else {
        alert.error('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      setLoading(false);
      alert.error('Error', 'Something went wrong. Please try again.');
      console.error('Update profile error:', error);
    }
  };

  const handleResetPassword = () => {
    navigation.navigate('ForgotPassword');
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
            disabled={loading}
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
          {safeProfileImage || editedData.profileImage ? (
            <Image
              source={{ uri: editedData.profileImage || safeProfileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {safeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          {isEditing && (
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleImagePick}
            >
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
                  value={editedData.fullName}
                  onChangeText={(value) => setEditedData({ ...editedData, fullName: value })}
                  placeholder="Enter your name"
                  editable={!loading}
                />
              ) : (
                <Text style={styles.infoValue}>{safeName}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedData.phone}
                  onChangeText={(value) => setEditedData({ ...editedData, phone: value })}
                  placeholder="Enter your phone"
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              ) : (
                <Text style={styles.infoValue}>{safePhone}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{safeEmail}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, styles.addressInput]}
                  value={editedData.address}
                  onChangeText={(value) => setEditedData({ ...editedData, address: value })}
                  placeholder="Enter your address"
                  multiline
                  editable={!loading}
                />
              ) : (
                <Text style={[styles.infoValue, styles.addressValue]}>
                  {safeAddress}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Account Info */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>
                  {userData?.role === 'customer' ? 'Customer' : 'Provider'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Verified</Text>
                <Text style={[styles.infoValue, styles.verifiedText]}>
                  {userData?.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleResetPassword}
              disabled={loading}
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
              disabled={loading}
            >
              <View style={styles.actionIconContainer}>
                <LogoutIcon />
              </View>
              <Text style={[styles.actionText, styles.logoutText]}>
                {loading ? 'Logging out...' : 'Logout'}
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color="#FF4444" />
              ) : (
                <ChevronIcon />
              )}
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
              setEditedData({
                fullName: userData?.fullName || '',
                address: userData?.address || '',
                phone: userData?.phone || '',
                profileImage: userData?.profileImage || null,
              });
            }}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.primaryGreen,
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
  saveButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  verifiedText: {
    color: COLORS.primaryGreen,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
