# Role-Based Onboarding - Design Document

## Architecture Overview

### Component Structure
```
App.js
├── OnboardingScreen (updated)
├── RoleSelectionScreen (new)
├── Customer Flow
│   ├── CustomerLoginScreen
│   ├── CustomerSignupScreen
│   └── CustomerTabNavigator
└── Provider Flow
    ├── ServiceSelectionScreen
    ├── PersonalInfoScreen
    ├── ProfessionalInfoScreen
    ├── CNICVerificationScreen
    ├── SelfieVerificationScreen
    ├── ProofOfServiceScreen
    ├── ProviderAgreementScreen
    ├── SubmissionStatusScreen
    └── ProviderDashboardScreen
```

### Navigation Flow
```
SplashScreen
    ↓
OnboardingScreen (swipeable intro)
    ↓
RoleSelectionScreen (new)
    ↓
    ├─→ "Hire Services" → CustomerLoginScreen → CustomerDashboard
    └─→ "Become Provider" → ServiceSelectionScreen → ... → ProviderDashboard
```

## Component Designs

### 1. RoleSelectionScreen (New)

**Purpose**: Allow users to choose their role on first app launch

**UI Layout**:
```
┌─────────────────────────────────┐
│  [Back]  Choose Your Role  [ ]  │
├─────────────────────────────────┤
│                                 │
│   Welcome to HomeEase! 🏠       │
│   How would you like to use     │
│   our platform?                 │
│                                 │
│  ┌───────────────────────────┐ │
│  │  👤 Hire a Service        │ │
│  │     Provider              │ │
│  │                           │ │
│  │  Find trusted professionals│ │
│  │  for your home services   │ │
│  │                           │ │
│  │         [Select] →        │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │  💼 Become a Service      │ │
│  │     Provider              │ │
│  │                           │ │
│  │  Earn by offering your    │ │
│  │  professional services    │ │
│  │                           │ │
│  │         [Select] →        │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**State Management**:
```javascript
const [selectedRole, setSelectedRole] = useState(null);
```

**Navigation Logic**:
```javascript
if (role === 'customer') {
  await saveUserRole('customer');
  navigation.replace('CustomerLogin');
} else if (role === 'provider') {
  await saveUserRole('provider');
  navigation.replace('ServiceSelection');
}
```

### 2. Updated OnboardingScreen

**Changes**:
- After last swipe, navigate to `RoleSelectionScreen` instead of `Login`
- Check if onboarding was completed before
- If completed, skip to appropriate dashboard based on saved role

**Logic**:
```javascript
const handleGetStarted = async () => {
  await AsyncStorage.setItem('@homeease_onboarding_complete', 'true');
  navigation.replace('RoleSelection');
};
```

### 3. Updated MoreScreen

**Dynamic Button Logic**:
```javascript
const { user } = useAuth();
const [providerStatus, setProviderStatus] = useState(null);

useEffect(() => {
  checkProviderStatus();
}, []);

const checkProviderStatus = async () => {
  const result = await getVerificationStatus();
  setProviderStatus(result);
};

// Button rendering logic
if (user.role === 'provider' && providerStatus.isVerified) {
  // Show "Switch to Provider Mode"
  return <SwitchModeButton />;
} else if (user.role === 'customer') {
  // Show "Become a Provider"
  return <BecomeProviderButton />;
} else if (user.role === 'both') {
  // Show "Switch Mode"
  return <SwitchModeButton />;
}
```

### 4. Provider Dashboard Navigation (New)

**Structure**:
```javascript
// src/navigation/ProviderTabNavigator.js
const ProviderTab = createBottomTabNavigator();

<ProviderTab.Navigator>
  <ProviderTab.Screen name="Dashboard" component={ProviderDashboardScreen} />
  <ProviderTab.Screen name="Jobs" component={ProviderJobsScreen} />
  <ProviderTab.Screen name="Earnings" component={ProviderEarningsScreen} />
  <ProviderTab.Screen name="Profile" component={ProviderProfileScreen} />
</ProviderTab.Navigator>
```

## Data Flow

### User Role Management

**Storage Keys**:
```javascript
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@homeease_onboarding_complete',
  USER_ROLE: '@homeease_user_role',
  CURRENT_MODE: '@homeease_current_mode',
  PROVIDER_PROFILE: '@provider_profile',
  REGISTRATION_DRAFT: '@provider_registration_draft'
};
```

**User Object Structure**:
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  role: 'customer' | 'provider' | 'both',
  currentMode: 'customer' | 'provider',
  isPhoneVerified: boolean,
  isEmailVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Provider Registration Flow

**Draft Management**:
```javascript
// Save after each step
const saveDraft = async (stepData) => {
  const existingDraft = await loadDraft();
  const updatedDraft = {
    ...existingDraft.data,
    ...stepData,
    lastSaved: new Date().toISOString(),
    currentStep: stepNumber
  };
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(updatedDraft));
};

// Load on screen mount
const loadDraft = async () => {
  const draft = await AsyncStorage.getItem(DRAFT_KEY);
  if (draft) {
    const data = JSON.parse(draft);
    // Check expiry (30 days)
    const daysDiff = (new Date() - new Date(data.lastSaved)) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 30) {
      return { success: true, data };
    }
  }
  return { success: false };
};
```

**Submission Flow**:
```javascript
const submitRegistration = async (finalData) => {
  // 1. Validate all data
  const validation = validateRegistrationData(finalData);
  if (!validation.valid) return { success: false, error: validation.error };
  
  // 2. Check CNIC duplicate
  const cnicCheck = await checkCNICExists(finalData.cnicNumber);
  if (cnicCheck.exists) return { success: false, error: 'CNIC already registered' };
  
  // 3. Create provider profile
  const profile = await createProviderProfile(finalData);
  
  // 4. Set status to pending
  profile.verificationStatus = 'pending';
  profile.isVerified = false;
  
  // 5. Save to storage
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  
  // 6. Clear draft
  await clearDraft();
  
  // 7. Mock auto-approval (testing only)
  setTimeout(async () => {
    profile.verificationStatus = 'approved';
    profile.isVerified = true;
    profile.approvedAt = new Date().toISOString();
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, 10000);
  
  return { success: true, profile };
};
```

### Mode Switching

**Switch Mode Logic**:
```javascript
const switchMode = async (newMode) => {
  // 1. Validate user has access to mode
  if (newMode === 'provider' && user.role !== 'provider' && user.role !== 'both') {
    return { success: false, error: 'Not registered as provider' };
  }
  
  // 2. Update current mode
  await AsyncStorage.setItem(CURRENT_MODE_KEY, newMode);
  
  // 3. Update user object
  const updatedUser = { ...user, currentMode: newMode };
  await updateUser(updatedUser);
  
  // 4. Navigate to appropriate dashboard
  if (newMode === 'customer') {
    navigation.replace('CustomerDashboard');
  } else {
    navigation.replace('ProviderDashboard');
  }
  
  return { success: true };
};
```

## Service Layer Updates

### roleManagementService.js (New)

```javascript
/**
 * Role Management Service
 * Handles user role selection, switching, and persistence
 */

// Save user role after selection
export const saveUserRole = async (role) => {
  try {
    await AsyncStorage.setItem(USER_ROLE_KEY, role);
    await AsyncStorage.setItem(CURRENT_MODE_KEY, role);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save role' };
  }
};

// Get user role
export const getUserRole = async () => {
  try {
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);
    return { success: true, role: role || 'customer' };
  } catch (error) {
    return { success: false, role: 'customer' };
  }
};

// Get current mode
export const getCurrentMode = async () => {
  try {
    const mode = await AsyncStorage.getItem(CURRENT_MODE_KEY);
    return { success: true, mode: mode || 'customer' };
  } catch (error) {
    return { success: false, mode: 'customer' };
  }
};

// Check if user can switch to provider mode
export const canSwitchToProvider = async () => {
  const roleResult = await getUserRole();
  const providerResult = await getProviderProfile();
  
  return (
    (roleResult.role === 'provider' || roleResult.role === 'both') &&
    providerResult.success &&
    providerResult.data.isVerified
  );
};

// Switch mode
export const switchUserMode = async (newMode) => {
  try {
    if (newMode === 'provider') {
      const canSwitch = await canSwitchToProvider();
      if (!canSwitch) {
        return { success: false, error: 'Not authorized for provider mode' };
      }
    }
    
    await AsyncStorage.setItem(CURRENT_MODE_KEY, newMode);
    return { success: true, mode: newMode };
  } catch (error) {
    return { success: false, error: 'Failed to switch mode' };
  }
};

// Update user role (when provider gets approved)
export const updateUserRole = async (newRole) => {
  try {
    const currentRole = await getUserRole();
    
    // If user was customer and becomes provider, set to 'both'
    if (currentRole.role === 'customer' && newRole === 'provider') {
      await AsyncStorage.setItem(USER_ROLE_KEY, 'both');
      return { success: true, role: 'both' };
    }
    
    await AsyncStorage.setItem(USER_ROLE_KEY, newRole);
    return { success: true, role: newRole };
  } catch (error) {
    return { success: false, error: 'Failed to update role' };
  }
};
```

### Updated AuthContext

```javascript
// Add role management to AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState('customer');

  useEffect(() => {
    loadUser();
    loadCurrentMode();
  }, []);

  const loadCurrentMode = async () => {
    const result = await getCurrentMode();
    if (result.success) {
      setCurrentMode(result.mode);
    }
  };

  const switchMode = async (newMode) => {
    const result = await switchUserMode(newMode);
    if (result.success) {
      setCurrentMode(newMode);
      return { success: true };
    }
    return result;
  };

  const value = {
    user,
    loading,
    currentMode,
    signIn,
    signOut,
    updateUser,
    switchMode,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## UI Components

### RoleCard Component

```javascript
const RoleCard = ({ icon, title, description, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <Text style={[styles.roleTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
      {description}
    </Text>
    <View style={[styles.selectButton, { backgroundColor: colors.primary }]}>
      <Text style={styles.selectButtonText}>Select</Text>
      <Svg width="20" height="20" viewBox="0 0 20 20">
        <Path d="M7 4l6 6-6 6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      </Svg>
    </View>
  </TouchableOpacity>
);
```

### ModeSwitchButton Component

```javascript
const ModeSwitchButton = ({ currentMode, onSwitch, colors }) => {
  const targetMode = currentMode === 'customer' ? 'provider' : 'customer';
  const icon = targetMode === 'provider' ? '💼' : '👤';
  const label = targetMode === 'provider' ? 'Switch to Provider Mode' : 'Switch to Customer Mode';
  
  return (
    <TouchableOpacity
      style={[styles.switchButton, { backgroundColor: colors.primary }]}
      onPress={() => onSwitch(targetMode)}
    >
      <Text style={styles.switchIcon}>{icon}</Text>
      <Text style={styles.switchLabel}>{label}</Text>
    </TouchableOpacity>
  );
};
```

## Validation Rules

### Registration Validation

```javascript
const validateRegistrationData = (data) => {
  // Personal Info
  if (!data.fullName || data.fullName.length < 3) {
    return { valid: false, error: 'Full name must be at least 3 characters' };
  }
  
  if (calculateAge(data.dateOfBirth) < 18) {
    return { valid: false, error: 'Must be 18 years or older' };
  }
  
  if (!data.phoneNumber || data.phoneNumber.length !== 11) {
    return { valid: false, error: 'Phone number must be 11 digits' };
  }
  
  if (!data.email || !data.email.includes('@')) {
    return { valid: false, error: 'Invalid email address' };
  }
  
  // Professional Info
  if (!data.yearsOfExperience || data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
    return { valid: false, error: 'Experience must be between 0-50 years' };
  }
  
  if (!data.skillsDescription || data.skillsDescription.length < 50) {
    return { valid: false, error: 'Skills description must be at least 50 characters' };
  }
  
  // CNIC
  const cnicValidation = validateCNIC(data.cnicNumber);
  if (!cnicValidation.valid) {
    return cnicValidation;
  }
  
  // Documents
  if (!data.cnicFrontImage || !data.cnicBackImage) {
    return { valid: false, error: 'CNIC images are required' };
  }
  
  if (!data.selfieImage) {
    return { valid: false, error: 'Selfie is required' };
  }
  
  // Services
  if (!data.selectedServices || data.selectedServices.length === 0) {
    return { valid: false, error: 'At least one service must be selected' };
  }
  
  // Proof documents
  for (const service of data.selectedServices) {
    if (!service.proofDocuments || service.proofDocuments.length < 2) {
      return { valid: false, error: `At least 2 proof images required for ${service.name}` };
    }
  }
  
  return { valid: true };
};
```

## Error Handling

### Common Error Scenarios

1. **Network Errors**: Show retry button with error message
2. **Validation Errors**: Show inline error messages below fields
3. **Permission Errors**: Show permission request dialog
4. **Storage Errors**: Show error and suggest clearing app data
5. **Duplicate CNIC**: Show error and suggest contacting support

### Error Messages

```javascript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PERMISSION_DENIED: 'Permission denied. Please enable permissions in settings.',
  DUPLICATE_CNIC: 'This CNIC is already registered. Please contact support if this is an error.',
  INVALID_DATA: 'Please check your information and try again.',
  STORAGE_ERROR: 'Failed to save data. Please try again.',
  UPLOAD_ERROR: 'Failed to upload image. Please try again.',
};
```

## Testing Strategy

### Unit Tests
- Role selection logic
- Draft save/load functionality
- Validation functions
- Mode switching logic

### Integration Tests
- Complete registration flow
- Mode switching between customer and provider
- Draft resume functionality
- CNIC duplicate check

### E2E Tests
- New user onboarding → role selection → registration → approval
- Customer switching to provider mode
- Provider switching to customer mode

## Performance Considerations

1. **Image Optimization**: Compress images before upload (quality: 0.7-0.8)
2. **Draft Autosave**: Debounce autosave by 2 seconds
3. **Lazy Loading**: Load provider dashboard components only when needed
4. **Cache Management**: Clear expired drafts on app start
5. **Memory Management**: Release image URIs after upload

## Accessibility

1. **Screen Readers**: Add accessibility labels to all interactive elements
2. **Color Contrast**: Ensure 4.5:1 contrast ratio for text
3. **Touch Targets**: Minimum 44x44 points for buttons
4. **Focus Management**: Proper focus order for form fields
5. **Error Announcements**: Announce validation errors to screen readers

## Security Considerations

1. **Data Encryption**: Encrypt sensitive data before storage
2. **CNIC Validation**: Server-side CNIC format validation
3. **Image Verification**: Check image file types and sizes
4. **Session Management**: Implement session timeout
5. **Secure Storage**: Use secure storage for sensitive data in production

## Migration Strategy

### Existing Users
- Users who already have "Earn as Provider" button in More tab can still access it
- After registration, they become dual-role users
- Show migration prompt to complete registration if draft exists

### Data Migration
- No data migration needed (new feature)
- Existing user roles default to 'customer'
- Provider registrations start fresh

## Future Enhancements

1. **Video Verification**: Add video selfie verification
2. **AI Document Verification**: Automatic CNIC validation
3. **Background Check Integration**: Third-party background check API
4. **Multi-language Support**: Support for Urdu and other languages
5. **Social Login**: Google/Facebook login for faster onboarding
6. **Referral System**: Referral codes for new providers
7. **Skills Assessment**: Online skills test for providers
8. **Portfolio Builder**: Allow providers to build detailed portfolios

## Rollout Plan

### Phase 1: Core Implementation (Week 1-2)
- Create RoleSelectionScreen
- Update OnboardingScreen navigation
- Implement role management service
- Update AuthContext

### Phase 2: Provider Flow Integration (Week 2-3)
- Connect provider registration to onboarding
- Implement draft management
- Add validation and error handling

### Phase 3: Dashboard & Mode Switching (Week 3-4)
- Create provider dashboard navigation
- Implement mode switching
- Update MoreScreen

### Phase 4: Testing & Polish (Week 4-5)
- Unit and integration tests
- UI/UX polish
- Performance optimization
- Bug fixes

### Phase 5: Deployment (Week 5)
- Production build
- Monitoring setup
- User feedback collection
