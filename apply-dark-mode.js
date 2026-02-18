// This script documents the dark mode changes needed for all screens
// Apply these patterns to each screen manually or use find/replace

const darkModePatterns = {
  // 1. Add import at top of file
  addImport: `import { useTheme } from '../../context/ThemeContext';`,
  
  // 2. Add hook in component
  addHook: `const { colors } = useTheme();`,
  
  // 3. Container updates
  containerBefore: `<SafeAreaView style={styles.container}>`,
  containerAfter: `<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>`,
  
  // 4. StatusBar updates
  statusBarBefore: `<StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />`,
  statusBarAfter: `<StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />`,
  
  // 5. Common style updates
  styleUpdates: {
    'backgroundColor: COLORS.white': 'backgroundColor: colors.background',
    'backgroundColor: \'#FFFFFF\'': 'backgroundColor: colors.background',
    'backgroundColor: \'#F5F5F5\'': 'backgroundColor: colors.backgroundSecondary',
    'backgroundColor: \'#F9F9F9\'': 'backgroundColor: colors.backgroundTertiary',
    'color: COLORS.textBlack': 'color: colors.text',
    'color: \'#1A1A1A\'': 'color: colors.text',
    'color: COLORS.textGrey': 'color: colors.textSecondary',
    'color: \'#666666\'': 'color: colors.textSecondary',
    'borderColor: \'#E0E0E0\'': 'borderColor: colors.border',
  }
};

// List of all screens to update
const screensToUpdate = [
  'src/screens/customer/ProfileScreen.js',
  'src/screens/customer/HistoryScreen.js',
  'src/screens/customer/MessagesScreen.js',
  'src/screens/customer/MoreScreen.js',
  'src/screens/customer/TopRatedProvidersScreen.js',
  'src/screens/customer/ProviderDetailsScreen.js',
  'src/screens/customer/PaymentMethodsScreen.js',
  'src/screens/customer/AddressScreen.js',
  'src/screens/customer/SupportScreen.js',
  'src/screens/customer/SafetyScreen.js',
  'src/screens/customer/NotificationsScreen.js',
  'src/screens/customer/HelpScreen.js',
  'src/screens/customer/RequestServiceFormScreen.js',
  'src/screens/customer/OfferListScreen.js',
  'src/screens/customer/ChatScreen.js',
  'src/screens/customer/LanguageScreen.js',
  'src/screens/customer/PrivacyPolicyScreen.js',
  'src/screens/customer/TermsConditionsScreen.js',
  'src/components/MenuDrawer.js',
];

console.log('Screens to update:', screensToUpdate.length);
