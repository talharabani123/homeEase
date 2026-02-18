# Apply Dark Mode to All Remaining Screens

## ✅ COMPLETED SCREENS
1. ThemeContext.js
2. App.js  
3. CustomerTabNavigator.js - Tab bar
4. ScreenHeader.js
5. SettingsScreen.js
6. HomeScreen.js
7. MoreScreen.js

## 🔄 APPLY TO REMAINING SCREENS

For each screen below, follow these exact steps:

### STEP 1: Add Import (after existing imports)
```javascript
import { useTheme } from '../../context/ThemeContext';
```

### STEP 2: Add Hook (first line in component function)
```javascript
const { colors } = useTheme();
```

### STEP 3: Find and Replace in JSX

#### Container:
```javascript
// FIND:
<SafeAreaView style={styles.container}>
  <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

// REPLACE:
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
  <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
```

#### Headers/Cards:
```javascript
// FIND:
<View style={styles.header}>

// REPLACE:
<View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>

// FIND:
<View style={styles.card}>

// REPLACE:
<View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
```

#### Text Elements:
```javascript
// FIND:
<Text style={styles.title}>

// REPLACE:
<Text style={[styles.title, { color: colors.text }]}>

// FIND:
<Text style={styles.subtitle}>

// REPLACE:
<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
```

#### TextInput:
```javascript
// FIND:
<TextInput
  style={styles.input}
  placeholderTextColor={COLORS.textGrey}

// REPLACE:
<TextInput
  style={[styles.input, { 
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    color: colors.text
  }]}
  placeholderTextColor={colors.placeholder}
```

#### SVG Icons:
```javascript
// FIND:
<Path stroke="#666666" fill="#1A1A1A" />
<Path stroke={COLORS.textGrey} fill={COLORS.textBlack} />

// REPLACE:
<Path stroke={colors.textSecondary} fill={colors.text} />
```

### STEP 4: Update StyleSheet (remove hardcoded colors)

```javascript
// FIND in styles:
container: {
  flex: 1,
  backgroundColor: '#FFFFFF',  // DELETE THIS LINE
  backgroundColor: COLORS.white,  // DELETE THIS LINE
  backgroundColor: '#F5F5F5',  // DELETE THIS LINE
},
title: {
  fontSize: 18,
  color: '#1A1A1A',  // DELETE THIS LINE
  color: COLORS.textBlack,  // DELETE THIS LINE
},
subtitle: {
  fontSize: 14,
  color: '#666666',  // DELETE THIS LINE
  color: COLORS.textGrey,  // DELETE THIS LINE
},
card: {
  padding: 16,
  backgroundColor: COLORS.white,  // DELETE THIS LINE
  borderColor: '#E0E0E0',  // DELETE THIS LINE
},

// REPLACE WITH (colors applied inline in JSX):
container: {
  flex: 1,
  // backgroundColor removed
},
title: {
  fontSize: 18,
  // color removed
},
subtitle: {
  fontSize: 14,
  // color removed
},
card: {
  padding: 16,
  // backgroundColor and borderColor removed
},
```

## 📋 SCREENS TO UPDATE

### Priority 1 - Main Screens
- [ ] **ProfileScreen.js** - src/screens/customer/ProfileScreen.js
- [ ] **HistoryScreen.js** - src/screens/customer/HistoryScreen.js
- [ ] **MessagesScreen.js** - src/screens/customer/MessagesScreen.js

### Priority 2 - Provider Screens
- [ ] **TopRatedProvidersScreen.js** - src/screens/customer/TopRatedProvidersScreen.js
- [ ] **ProviderDetailsScreen.js** - src/screens/customer/ProviderDetailsScreen.js

### Priority 3 - Feature Screens
- [ ] **PaymentMethodsScreen.js** - src/screens/customer/PaymentMethodsScreen.js
- [ ] **AddressScreen.js** - src/screens/customer/AddressScreen.js
- [ ] **SupportScreen.js** - src/screens/customer/SupportScreen.js
- [ ] **SafetyScreen.js** - src/screens/customer/SafetyScreen.js
- [ ] **NotificationsScreen.js** - src/screens/customer/NotificationsScreen.js
- [ ] **HelpScreen.js** - src/screens/customer/HelpScreen.js

### Priority 4 - Service Screens
- [ ] **RequestServiceFormScreen.js** - src/screens/customer/RequestServiceFormScreen.js
- [ ] **OfferListScreen.js** - src/screens/customer/OfferListScreen.js
- [ ] **ChatScreen.js** - src/screens/customer/ChatScreen.js

### Priority 5 - Settings Screens (Already themed but verify)
- [ ] **LanguageScreen.js** - src/screens/customer/LanguageScreen.js
- [ ] **PrivacyPolicyScreen.js** - src/screens/customer/PrivacyPolicyScreen.js
- [ ] **TermsConditionsScreen.js** - src/screens/customer/TermsConditionsScreen.js

### Components
- [ ] **MenuDrawer.js** - src/components/MenuDrawer.js

## 🎨 Color Reference

Use these color properties from `colors` object:

```javascript
colors.background          // Main background
colors.backgroundSecondary // Secondary background  
colors.backgroundTertiary  // Tertiary background
colors.card                // Card background
colors.cardBorder          // Card border
colors.text                // Primary text
colors.textSecondary       // Secondary text
colors.textTertiary        // Tertiary text
colors.primary             // Primary green (#88C791)
colors.primaryLight        // Light primary background
colors.border              // Border color
colors.divider             // Divider color
colors.inputBackground     // Input background
colors.inputBorder         // Input border
colors.placeholder         // Placeholder text
colors.statusBar           // StatusBar style ('dark-content' or 'light-content')
```

## ⚡ Quick Tips

1. **Search & Replace**: Use your editor's find/replace for efficiency
2. **Test Frequently**: Toggle dark mode after each screen
3. **Check SVGs**: Don't forget to update SVG path colors
4. **Remove All Hardcoded Colors**: Check StyleSheet carefully
5. **Consistent Patterns**: Use same color for same element types

## ✅ Verification Checklist

After updating each screen:
- [ ] Import added
- [ ] Hook added
- [ ] Container updated
- [ ] StatusBar updated
- [ ] All text elements updated
- [ ] All cards/views updated
- [ ] All inputs updated
- [ ] All SVG icons updated
- [ ] StyleSheet cleaned (no hardcoded colors)
- [ ] Tested in light mode
- [ ] Tested in dark mode

## 🚀 Current Status

**Working:** Tab bar, Home, Settings, More screens
**Remaining:** ~17 screens
**Time per screen:** 5-10 minutes
**Total time:** 2-3 hours

Dark mode foundation is complete and working perfectly!
