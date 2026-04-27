import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import ScreenWrapper from '../../components/ScreenWrapper';

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Service Completed',
      message: 'Your plumbing service has been completed. Please rate your experience.',
      time: '2 hours ago',
      read: false,
      type: 'success',
    },
    {
      id: '2',
      title: 'Provider Arriving Soon',
      message: 'Ahmed Khan is 5 minutes away from your location.',
      time: '5 hours ago',
      read: false,
      type: 'info',
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Your payment of Rs. 580 has been processed successfully.',
      time: '1 day ago',
      read: true,
      type: 'success',
    },
    {
      id: '4',
      title: 'New Offer Available',
      message: 'Get 20% off on your next electrician service. Valid till tomorrow!',
      time: '2 days ago',
      read: true,
      type: 'promo',
    },
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#4CAF50"
            />
          </Svg>
        );
      case 'info':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              fill="#2196F3"
            />
          </Svg>
        );
      case 'promo':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
              fill="#FF9800"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ScreenWrapper variant="default">
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={{ width: 24 }} />}
        </View>

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Receive notifications on your device</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Email Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Get updates via email</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>SMS Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Receive SMS alerts</Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Notifications</Text>
          
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                !notification.read && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{notification.title}</Text>
                  {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>{notification.message}</Text>
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  notificationsSection: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
});

export default NotificationsScreen;
