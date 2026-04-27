# Role-Based Onboarding - Implementation Tasks

## Phase 1: Core Infrastructure

### 1. Create Role Management Service
- [x] 1.1 Create `src/services/roleManagementService.js`
  - [x] 1.1.1 Implement `saveUserRole(role)` function
  - [x] 1.1.2 Implement `getUserRole()` function
  - [x] 1.1.3 Implement `getCurrentMode()` function
  - [x] 1.1.4 Implement `canSwitchToProvider()` function
  - [x] 1.1.5 Implement `switchUserMode(newMode)` function
  - [x] 1.1.6 Implement `updateUserRole(newRole)` function
  - [x] 1.1.7 Add storage key constants
  - [x] 1.1.8 Add error handling for all functions

### 2. Update AuthContext
- [x] 2.1 Update `src/context/AuthContext.js`
  - [x] 2.1.1 Add `currentMode` state
  - [x] 2.1.2 Add `loadCurrentMode()` function
  - [x] 2.1.3 Add `switchMode(newMode)` function
  - [x] 2.1.4 Export `currentMode` in context value
  - [x] 2.1.5 Load current mode on app start

## Phase 2: Role Selection Screen

### 3. Create RoleSelectionScreen
- [x] 3.1 Create `src/screens/RoleSelectionScreen.js`
  - [x] 3.1.1 Create screen layout with header
  - [x] 3.1.2 Add welcome text and description
  - [x] 3.1.3 Create "Hire a Service Provider" card
  - [x] 3.1.4 Create "Become a Service Provider" card
  - [x] 3.1.5 Implement role selection logic
  - [x] 3.1.6 Add navigation to CustomerLogin for customer role
  - [x] 3.1.7 Add navigation to ServiceSelection for provider role
  - [x] 3.1.8 Save selected role to storage
  - [x] 3.1.9 Add dark mode support
  - [x] 3.1.10 Add loading states

### 4. Create RoleCard Component
- [ ] 4.1 Create `src/components/RoleCard.js`
  - [ ] 4.1.1 Create card layout with icon
  - [ ] 4.1.2 Add title and description props
  - [ ] 4.1.3 Add onPress handler
  - [ ] 4.1.4 Add hover/press animations
  - [ ] 4.1.5 Style for dark mode
  - [ ] 4.1.6 Add accessibility labels

## Phase 3: Onboarding Flow Updates

### 5. Update OnboardingScreen
- [x] 5.1 Update `src/screens/OnboardingScreen.js`
  - [x] 5.1.1 Change "Get Started" navigation to RoleSelectionScreen
  - [x] 5.1.2 Add check for completed onboarding
  - [x] 5.1.3 Skip to appropriate dashboard if already onboarded
  - [x] 5.1.4 Save onboarding completion flag

### 6. Update App.js Navigation
- [x] 6.1 Update `App.js`
  - [x] 6.1.1 Add RoleSelectionScreen to stack navigator
  - [x] 6.1.2 Update initial route logic
  - [x] 6.1.3 Add provider dashboard route
  - [x] 6.1.4 Ensure all provider registration screens are registered

## Phase 4: Provider Dashboard

### 7. Create Provider Tab Navigator
- [ ] 7.1 Create `src/navigation/ProviderTabNavigator.js`
  - [ ] 7.1.1 Set up bottom tab navigator
  - [ ] 7.1.2 Add Dashboard tab
  - [ ] 7.1.3 Add Jobs tab (placeholder)
  - [ ] 7.1.4 Add Earnings tab (placeholder)
  - [ ] 7.1.5 Add Profile tab (placeholder)
  - [ ] 7.1.6 Configure tab bar icons
  - [ ] 7.1.7 Add dark mode support

### 8. Update ProviderDashboardScreen
- [ ] 8.1 Update `src/screens/provider/ProviderDashboardScreen.js`
  - [ ] 8.1.1 Add online/offline toggle
  - [ ] 8.1.2 Add earnings summary card
  - [ ] 8.1.3 Add job requests section
  - [ ] 8.1.4 Add ratings display
  - [ ] 8.1.5 Add quick stats (total jobs, completed, etc.)
  - [ ] 8.1.6 Implement online status toggle logic
  - [ ] 8.1.7 Load provider profile data
  - [ ] 8.1.8 Add refresh functionality

## Phase 5: Mode Switching

### 9. Create Mode Switch Component
- [ ] 9.1 Create `src/components/ModeSwitchButton.js`
  - [ ] 9.1.1 Create button layout
  - [ ] 9.1.2 Add current mode detection
  - [ ] 9.1.3 Add switch mode handler
  - [ ] 9.1.4 Add loading state during switch
  - [ ] 9.1.5 Add success/error feedback
  - [ ] 9.1.6 Style for dark mode

### 10. Update MoreScreen
- [ ] 10.1 Update `src/screens/customer/MoreScreen.js`
  - [ ] 10.1.1 Add provider status check on mount
  - [ ] 10.1.2 Remove old "Earn as Provider" button
  - [ ] 10.1.3 Add conditional button rendering logic
  - [ ] 10.1.4 Show "Switch to Provider Mode" for verified providers
  - [ ] 10.1.5 Show "Become a Provider" for customers
  - [ ] 10.1.6 Show "Switch Mode" for dual-role users
  - [ ] 10.1.7 Implement mode switch handler
  - [ ] 10.1.8 Add navigation to ServiceSelection for new providers

### 11. Add Settings Mode Switch
- [ ] 11.1 Update `src/screens/customer/SettingsScreen.js`
  - [ ] 11.1.1 Add "Mode" section for dual-role users
  - [ ] 11.1.2 Add current mode display
  - [ ] 11.1.3 Add switch mode button
  - [ ] 11.1.4 Implement mode switch logic
  - [ ] 11.1.5 Add confirmation dialog

## Phase 6: Provider Registration Integration

### 12. Update ServiceSelectionScreen
- [ ] 12.1 Update `src/screens/provider/ServiceSelectionScreen.js`
  - [ ] 12.1.1 Remove back button if coming from onboarding
  - [ ] 12.1.2 Update navigation params handling
  - [ ] 12.1.3 Ensure draft loading works correctly

### 13. Update PersonalInfoScreen
- [ ] 13.1 Update `src/screens/provider/PersonalInfoScreen.js` or use Simple version
  - [ ] 13.1.1 Ensure all validations work
  - [ ] 13.1.2 Test draft save/load
  - [ ] 13.1.3 Verify navigation to next step

### 14. Update SubmissionStatusScreen
- [ ] 14.1 Update `src/screens/provider/SubmissionStatusScreen.js`
  - [ ] 14.1.1 Add auto-check for approval status
  - [ ] 14.1.2 Navigate to ProviderDashboard on approval
  - [ ] 14.1.3 Update user role to 'provider' or 'both'
  - [ ] 14.1.4 Set current mode to 'provider'
  - [ ] 14.1.5 Show approval notification

## Phase 7: Data Management

### 15. Update Provider Registration Service
- [ ] 15.1 Update `src/services/providerRegistrationService.js`
  - [ ] 15.1.1 Add `updateUserRoleOnApproval()` function
  - [ ] 15.1.2 Update `submitProviderRegistration()` to handle role updates
  - [ ] 15.1.3 Add `checkApprovalStatus()` function
  - [ ] 15.1.4 Ensure CNIC duplicate check works
  - [ ] 15.1.5 Add proper error handling

### 16. Create Onboarding Service
- [ ] 16.1 Create `src/services/onboardingService.js`
  - [ ] 16.1.1 Implement `isOnboardingComplete()` function
  - [ ] 16.1.2 Implement `setOnboardingComplete()` function
  - [ ] 16.1.3 Implement `getInitialRoute()` function
  - [ ] 16.1.4 Add storage key constants

## Phase 8: Validation & Error Handling

### 17. Add Comprehensive Validation
- [ ] 17.1 Update validation functions
  - [ ] 17.1.1 Add age validation (18+)
  - [ ] 17.1.2 Add phone format validation
  - [ ] 17.1.3 Add email format validation
  - [ ] 17.1.4 Add CNIC format validation
  - [ ] 17.1.5 Add skills description length validation
  - [ ] 17.1.6 Add proof documents validation

### 18. Implement Error Handling
- [ ] 18.1 Add error handling across all screens
  - [ ] 18.1.1 Network error handling
  - [ ] 18.1.2 Permission error handling
  - [ ] 18.1.3 Storage error handling
  - [ ] 18.1.4 Validation error display
  - [ ] 18.1.5 Add retry mechanisms

## Phase 9: UI/UX Polish

### 19. Add Loading States
- [ ] 19.1 Add loading indicators
  - [ ] 19.1.1 Role selection loading
  - [ ] 19.1.2 Mode switch loading
  - [ ] 19.1.3 Registration submission loading
  - [ ] 19.1.4 Draft save loading
  - [ ] 19.1.5 Image upload loading

### 20. Add Success Feedback
- [ ] 20.1 Add success messages
  - [ ] 20.1.1 Role selection success
  - [ ] 20.1.2 Mode switch success
  - [ ] 20.1.3 Registration submission success
  - [ ] 20.1.4 Draft save success
  - [ ] 20.1.5 Approval notification

### 21. Improve Animations
- [ ] 21.1 Add smooth transitions
  - [ ] 21.1.1 Screen transitions
  - [ ] 21.1.2 Card press animations
  - [ ] 21.1.3 Button press feedback
  - [ ] 21.1.4 Loading animations
  - [ ] 21.1.5 Success animations

## Phase 10: Testing

### 22. Unit Tests
- [ ] 22.1 Test role management service
  - [ ] 22.1.1 Test saveUserRole
  - [ ] 22.1.2 Test getUserRole
  - [ ] 22.1.3 Test switchUserMode
  - [ ] 22.1.4 Test canSwitchToProvider

### 23. Integration Tests
- [ ] 23.1 Test complete flows
  - [ ] 23.1.1 Test customer onboarding flow
  - [ ] 23.1.2 Test provider registration flow
  - [ ] 23.1.3 Test mode switching
  - [ ] 23.1.4 Test draft resume

### 24. Manual Testing
- [ ] 24.1 Test on different devices
  - [ ] 24.1.1 Test on Android
  - [ ] 24.1.2 Test on iOS
  - [ ] 24.1.3 Test in light mode
  - [ ] 24.1.4 Test in dark mode
  - [ ] 24.1.5 Test with slow network
  - [ ] 24.1.6 Test with no network

## Phase 11: Documentation

### 25. Update Documentation
- [ ] 25.1 Create user guides
  - [ ] 25.1.1 Document role selection process
  - [ ] 25.1.2 Document provider registration steps
  - [ ] 25.1.3 Document mode switching
  - [ ] 25.1.4 Document draft management

### 26. Update Code Documentation
- [ ] 26.1 Add code comments
  - [ ] 26.1.1 Document role management service
  - [ ] 26.1.2 Document navigation flow
  - [ ] 26.1.3 Document data structures
  - [ ] 26.1.4 Document validation rules

## Phase 12: Deployment Preparation

### 27. Performance Optimization
- [ ] 27.1 Optimize performance
  - [ ] 27.1.1 Optimize image loading
  - [ ] 27.1.2 Implement lazy loading
  - [ ] 27.1.3 Reduce bundle size
  - [ ] 27.1.4 Optimize re-renders

### 28. Security Hardening
- [ ] 28.1 Implement security measures
  - [ ] 28.1.1 Encrypt sensitive data
  - [ ] 28.1.2 Validate all inputs
  - [ ] 28.1.3 Implement rate limiting
  - [ ] 28.1.4 Add session management

### 29. Final Testing
- [ ] 29.1 Comprehensive testing
  - [ ] 29.1.1 Regression testing
  - [ ] 29.1.2 Performance testing
  - [ ] 29.1.3 Security testing
  - [ ] 29.1.4 Accessibility testing

### 30. Deployment
- [ ] 30.1 Prepare for deployment
  - [ ] 30.1.1 Build production version
  - [ ] 30.1.2 Test production build
  - [ ] 30.1.3 Set up monitoring
  - [ ] 30.1.4 Deploy to app stores
  - [ ] 30.1.5 Monitor for issues

## Notes

- All provider registration screens already exist and are functional
- Focus on integration and navigation flow
- Ensure backward compatibility with existing users
- Test thoroughly before deployment
- Monitor user feedback after release

## Priority

**High Priority** (Must have for MVP):
- Tasks 1-16 (Core infrastructure, screens, and navigation)

**Medium Priority** (Important for good UX):
- Tasks 17-21 (Validation, error handling, UI polish)

**Low Priority** (Can be added later):
- Tasks 22-30 (Testing, documentation, optimization)

## Estimated Timeline

- Phase 1-3: 2-3 days
- Phase 4-6: 2-3 days
- Phase 7-9: 2-3 days
- Phase 10-12: 2-3 days

**Total: 8-12 days**
