import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useUserRegistration } from '../../context/UserRegistrationContext';

const ProviderProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { registrationData, getDisplayName, getProfileImage, setSelfieImage } = useUserRegistration();
  
  const [profileImage, setProfileImage] = useState(getProfileImage());
  const [isOnline, setIsOnline] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Choose an option',
      [
        { text: 'Change Photo', onPress: changeProfilePhoto },
        { text: 'Edit Details', onPress: () => navigation.navigate('PersonalInfo') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const changeProfilePhoto = async () => {
    Alert.alert(
      'Change Profile Photo',
      'Select photo source',
      [
        { text: 'Camera', onPress: () => takePhoto() },
        { text: 'Gallery', onPress: () => pickImage() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImageUri = result.assets[0].uri;
      setProfileImage(newImageUri);
      await setSelfieImage(newImageUri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImageUri = result.assets[0].uri;
      setProfileImage(newImageUri);
      await setSelfieImage(newImageUri);
    }
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getServiceType = () => {
    if (registrationData.selectedServices && registrationData.selectedServices.length > 0) {
      return registrationData.selectedServices[0].name || 'Service Provider';
    }
    return 'Service Provider';
  };

  const getRating = () => {
    // Mock rating - in real app this would come from reviews
    return '4.8';
  };

  const getCompletedJobs = () => {
    // Mock data - in real app this would come from job history
    return '127';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 20 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity 
          onPress={handleEditProfile}
          style={styles.editButton}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={colors.text} />
          </Svg>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={changeProfilePhoto} style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.initialsText}>{getInitials()}</Text>
                </View>
              )}
              
              {/* Online Status Dot */}
              <View style={[
                styles.onlineStatusDot,
                { backgroundColor: isOnline ? '#10B981' : '#EF4444' }
              ]} />
              
              {/* Edit Icon */}
              <View style={styles.editIconContainer}>
                <Svg width="20" height="20" viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill={colors.card} />
                  <Path d="M12 8V16M8 12H16" stroke={colors.primary} strokeWidth="2" />
                </Svg>
              </View>
            </TouchableOpacity>

            <Text style={[styles.profileName, { color: colors.text }]}>
              {getDisplayName()}
            </Text>
            <Text style={[styles.serviceType, { color: colors.textSecondary }]}>
              {getServiceType()}
            </Text>
            
            {/* Status Badge */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: isOnline ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.statusText}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{getRating()}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Svg key={star} width="16" height="16" viewBox="0 0 24 24">
                    <Path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill={star <= 4 ? '#FFD700' : '#E5E7EB'}
                    />
                  </Svg>
                ))}
              </View>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{getCompletedJobs()}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Done</Text>
            </View>
          </View>

          {/* Profile Details */}
          <View style={[styles.detailsSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
            
            <View style={styles.detailItem}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill={colors.primary} />
              </Svg>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {registrationData.email || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill={colors.primary} />
              </Svg>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {registrationData.phoneNumber || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill={colors.primary} />
              </Svg>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {registrationData.address || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleEditProfile}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#FFFFFF" />
              </Svg>
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}
              onPress={() => setIsOnline(!isOnline)}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill={isOnline ? '#10B981' : '#EF4444'} />
              </Svg>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 16,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 20,
  },
  detailsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProviderProfileScreen;