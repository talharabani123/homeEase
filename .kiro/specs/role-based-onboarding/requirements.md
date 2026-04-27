# Role-Based Onboarding with Provider Registration

## Overview
Redesign the app onboarding flow to allow users to choose their role (Customer or Provider) on first launch, with full provider registration integrated into the onboarding process instead of being hidden in the More tab.

## User Stories

### US-1: Role Selection on First Launch
**As a** new user opening the app for the first time  
**I want to** choose whether I want to hire services or become a provider  
**So that** I can access the appropriate features immediately

**Acceptance Criteria:**
- 1.1: App shows role selection screen on first launch
- 1.2: Two clear options displayed: "Hire a Service Provider" and "Become a Service Provider"
- 1.3: Each option has descriptive text and appropriate icons
- 1.4: Selection is saved and user doesn't see this screen again
- 1.5: Screen supports dark mode

### US-2: Customer Path (Hire Services)
**As a** user who selects "Hire a Service Provider"  
**I want to** proceed directly to customer signup/login  
**So that** I can start booking services

**Acceptance Criteria:**
- 2.1: User is directed to customer authentication flow
- 2.2: After authentication, user lands on customer dashboard
- 2.3: User role is set to "customer" in the system
- 2.4: User can later switch to provider mode if desired

### US-3: Provider Registration - Service Selection
**As a** user who selects "Become a Service Provider"  
**I want to** select one or multiple services I can provide  
**So that** I can register for the appropriate service categories

**Acceptance Criteria:**
- 3.1: Display all 9 service categories (Plumber, Electrician, AC Technician, Gas Repair, Locksmith, Carpenter, Painter, Cleaner, Appliance Repair)
- 3.2: User can select multiple services
- 3.3: At least one service must be selected to continue
- 3.4: Progress indicator shows "Step 1 of 8"
- 3.5: Selected services are saved in draft

### US-4: Provider Registration - Personal Information
**As a** provider registrant  
**I want to** provide my personal details  
**So that** the platform can verify my identity

**Acceptance Criteria:**
- 4.1: Collect: Full Name, Date of Birth, Phone Number, Email, Residential Address, City, GPS Location
- 4.2: Age validation: Must be 18+ years old
- 4.3: Phone number format validation (11 digits)
- 4.4: Email format validation
- 4.5: GPS location must be captured (not manually entered)
- 4.6: Progress indicator shows "Step 2 of 8"
- 4.7: All fields are mandatory
- 4.8: Data is saved in draft

### US-5: Provider Registration - Professional Information
**As a** provider registrant  
**I want to** provide my professional background  
**So that** customers can assess my qualifications

**Acceptance Criteria:**
- 5.1: Collect: Years of Experience, Skills Description, Service Radius, Base Price (optional)
- 5.2: Experience validation: 0-50 years
- 5.3: Skills description minimum 50 characters
- 5.4: Service radius options: 5, 10, 15, 20, 30, 50 km
- 5.5: Base price validation: Rs. 100-10,000 (optional field)
- 5.6: Progress indicator shows "Step 3 of 8"
- 5.7: Data is saved in draft

### US-6: Provider Registration - CNIC Verification (KYC)
**As a** provider registrant  
**I want to** upload my CNIC documents  
**So that** the platform can verify my identity

**Acceptance Criteria:**
- 6.1: Collect CNIC number with format validation (XXXXX-XXXXXXX-X)
- 6.2: Upload CNIC front image
- 6.3: Upload CNIC back image
- 6.4: System checks for duplicate CNIC registration
- 6.5: Images must be clear and readable
- 6.6: Progress indicator shows "Step 4 of 8"
- 6.7: All fields are mandatory
- 6.8: Data is saved in draft

### US-7: Provider Registration - Live Selfie Verification
**As a** provider registrant  
**I want to** take a live selfie  
**So that** the platform can verify I am a real person

**Acceptance Criteria:**
- 7.1: Camera opens in selfie mode (front camera)
- 7.2: Gallery upload is disabled
- 7.3: Guidelines displayed: clear face, good lighting, no sunglasses/hat, plain background
- 7.4: User can retake selfie if not satisfied
- 7.5: Progress indicator shows "Step 5 of 8"
- 7.6: Selfie is mandatory
- 7.7: Data is saved in draft

### US-8: Provider Registration - Proof of Service
**As a** provider registrant  
**I want to** upload proof documents for each selected service  
**So that** I can demonstrate my qualifications

**Acceptance Criteria:**
- 8.1: For each selected service, user must upload proof
- 8.2: Minimum 2 images required per service
- 8.3: Maximum 3 images allowed per service
- 8.4: Acceptable proof: certificates, work photos, shop pictures
- 8.5: User can take photos or choose from gallery
- 8.6: Progress indicator shows "Step 6 of 8"
- 8.7: All services must have proof before continuing
- 8.8: Data is saved in draft

### US-9: Provider Registration - Terms & Agreement
**As a** provider registrant  
**I want to** review and accept platform terms  
**So that** I understand my obligations

**Acceptance Criteria:**
- 9.1: Display terms including: commission policy, cancellation policy, background check consent, platform rules
- 9.2: User must check acceptance boxes
- 9.3: Cannot proceed without accepting all terms
- 9.4: Progress indicator shows "Step 7 of 8"
- 9.5: Terms are scrollable and readable
- 9.6: Data is saved in draft

### US-10: Provider Registration - Submission & Review
**As a** provider registrant  
**I want to** submit my application for review  
**So that** I can become an approved provider

**Acceptance Criteria:**
- 10.1: Review screen shows summary of all entered information
- 10.2: User can edit any section before final submission
- 10.3: On submission, status is set to "Pending Approval"
- 10.4: Progress indicator shows "Step 8 of 8"
- 10.5: Success message displayed: "Your profile is under review. Approval may take 24–48 hours."
- 10.6: Draft is cleared after successful submission
- 10.7: User receives confirmation notification

### US-11: Admin Verification System
**As an** admin  
**I want to** review provider applications  
**So that** I can approve or reject registrations

**Acceptance Criteria:**
- 11.1: Admin can view all pending applications
- 11.2: Admin can approve applications
- 11.3: Admin can reject applications with reason
- 11.4: Admin can request additional documents
- 11.5: Provider is notified of status changes
- 11.6: Only approved providers can go online

### US-12: Provider Dashboard Access
**As an** approved provider  
**I want to** access the provider dashboard  
**So that** I can start receiving job requests

**Acceptance Criteria:**
- 12.1: After approval, user is automatically logged into Provider Mode
- 12.2: App UI changes to Provider Dashboard
- 12.3: Dashboard shows: Online/Offline toggle, Incoming requests, Earnings, Job history, Ratings, Wallet
- 12.4: User role is updated to "provider" or "both"
- 12.5: Provider can toggle online/offline status
- 12.6: Only online providers receive job requests

### US-13: Dual Role Management
**As a** user with both customer and provider roles  
**I want to** switch between modes  
**So that** I can use the app as customer or provider

**Acceptance Criteria:**
- 13.1: User can have roles: customer, provider, or both
- 13.2: Settings menu shows "Switch Mode" option for dual-role users
- 13.3: Switching mode changes entire app UI
- 13.4: Current mode is persisted across app restarts
- 13.5: Mode switch is instant without re-authentication

### US-14: More Tab Update
**As a** customer user  
**I want to** see relevant options in More tab  
**So that** I can access appropriate features

**Acceptance Criteria:**
- 14.1: "Earn as a Service Provider" button removed from More tab for new users
- 14.2: For verified providers, show "Switch to Provider Mode" instead
- 14.3: For customers, show "Become a Provider" that starts registration
- 14.4: Button styling matches app theme

### US-15: Draft Management
**As a** provider registrant  
**I want to** save my progress  
**So that** I can complete registration later

**Acceptance Criteria:**
- 15.1: Draft is automatically saved after each step
- 15.2: User can resume registration from where they left off
- 15.3: Draft expires after 30 days
- 15.4: User can clear draft and start over
- 15.5: Draft includes all entered data and uploaded images

### US-16: Security & Validation
**As a** platform administrator  
**I want to** ensure data security and prevent fraud  
**So that** only legitimate providers are registered

**Acceptance Criteria:**
- 16.1: Duplicate CNIC numbers are blocked
- 16.2: All documents are stored securely
- 16.3: Selfie must be taken live (gallery disabled)
- 16.4: Phone number OTP verification required
- 16.5: Email verification required
- 16.6: Unverified providers are not visible to customers
- 16.7: All sensitive data is encrypted

## Technical Requirements

### Data Models

#### User
```javascript
{
  id: string,
  name: string,
  phone: string,
  email: string,
  role: 'customer' | 'provider' | 'both',
  currentMode: 'customer' | 'provider',
  isPhoneVerified: boolean,
  isEmailVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### ProviderProfile
```javascript
{
  userId: string,
  services: array,
  experience: number,
  skillsDescription: string,
  serviceRadius: number,
  basePrice: number,
  verificationStatus: 'pending' | 'approved' | 'rejected',
  isVerified: boolean,
  isOnline: boolean,
  documents: {
    cnicNumber: string,
    cnicFront: string,
    cnicBack: string,
    selfie: string,
    proofDocuments: array
  },
  personalInfo: object,
  earnings: number,
  rating: number,
  totalJobs: number,
  completedJobs: number,
  createdAt: timestamp,
  approvedAt: timestamp
}
```

### Storage Keys
- `@homeease_onboarding_complete`: boolean
- `@homeease_user_role`: string
- `@homeease_current_mode`: string
- `@provider_registration_draft`: object

## UI/UX Requirements

1. **Progress Indicator**: Show step number and progress bar on all registration screens
2. **Validation**: Real-time field validation with clear error messages
3. **Dark Mode**: All screens must support dark mode
4. **Responsive**: Layouts must work on different screen sizes
5. **Accessibility**: Proper labels and contrast ratios
6. **Loading States**: Show loading indicators during async operations
7. **Error Handling**: Graceful error messages with retry options
8. **Image Preview**: Show uploaded images with option to retake/reselect

## Success Metrics

1. Provider registration completion rate > 70%
2. Average registration time < 15 minutes
3. Draft resume rate > 50%
4. Provider approval rate > 80%
5. Zero duplicate CNIC registrations
6. Zero fake selfie uploads

## Dependencies

- expo-image-picker (already installed)
- expo-location (already installed)
- @react-native-community/datetimepicker (already installed)
- AsyncStorage (already installed)

## Out of Scope

- Payment integration during onboarding
- Background check automation
- AI-based document verification
- Video verification
- Multi-language support (future enhancement)

## Notes

- All provider registration screens already exist and are functional
- Need to create new RoleSelectionScreen
- Need to update OnboardingScreen to navigate to RoleSelectionScreen
- Need to update MoreScreen to show appropriate options based on user role
- Need to create provider dashboard navigation
- Mock auto-approval after 10 seconds for testing (already implemented)
