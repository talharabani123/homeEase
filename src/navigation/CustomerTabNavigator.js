import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';

// Import screens
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import HistoryScreen from '../screens/customer/HistoryScreen';

// Placeholder screens (to be implemented)
const MessagesScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Messages Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Profile Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();

// Tab Icons
const HomeIcon = ({ focused }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={focused ? COLORS.primaryGreen : COLORS.textGrey}
    />
  </Svg>
);

const RequestsIcon = ({ focused }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      fill={focused ? COLORS.primaryGreen : COLORS.textGrey}
    />
  </Svg>
);

const MessagesIcon = ({ focused }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
      fill={focused ? COLORS.primaryGreen : COLORS.textGrey}
    />
  </Svg>
);

const ProfileIcon = ({ focused }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={focused ? COLORS.primaryGreen : COLORS.textGrey}
    />
  </Svg>
);

const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primaryGreen,
        tabBarInactiveTintColor: COLORS.textGrey,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <RequestsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => <MessagesIcon focused={focused} />,
          tabBarBadge: 3, // Example badge
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: COLORS.white,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.textGrey,
  },
});

export default CustomerTabNavigator;
