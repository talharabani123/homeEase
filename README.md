# HomeEase - Real-Time Home Services Mobile Application

A React Native mobile application for on-demand home services connecting customers with nearby verified service providers.

## Features Implemented

### ✅ Splash Screen
- Centered app logo with HomeEase branding
- Tagline: "Reliable Help, Right Now"
- Auto-navigation to onboarding after 2.5 seconds
- Soft mint green background (#7ED4AD)

### ✅ Onboarding Screens (4 screens)

1. **What is HomeEase**
   - Home services introduction
   - Message: "Get trusted home professionals instantly near you"

2. **How It Works**
   - 3-step process visualization
   - Choose Service → Request → Get Help
   - Tagline: "Simple. Fast. Reliable."

3. **Real-Time & Secure**
   - Live Tracking feature
   - Verified Providers
   - Secure Payments
   - Safety message

4. **For Providers**
   - Provider earning opportunity
   - "Earn money by helping nearby customers"
   - Call-to-action: "Join as a Provider"

### Design System

**Colors:**
- Primary: #7ED4AD (soft mint green)
- Secondary: #FFFFFF (white)
- Accent: #4A9B7E (dark green)
- Text Primary: #2C2C2C (dark gray)
- Text Secondary: #6B7280 (medium gray)

**Typography:**
- Headers: 26px, bold
- Body: 17px, regular
- Buttons: 16px, medium weight

**Features:**
- Swipe navigation between onboarding screens
- Page indicators showing current position
- Skip functionality on all screens
- Next/Get Started buttons
- Mobile-first design (375px width)
- Clean spacing and rounded corners

## Installation

\`\`\`bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
\`\`\`

## Project Structure

\`\`\`
homeease/
├── src/
│   ├── constants/
│   │   ├── colors.js          # Color palette
│   │   └── typography.js      # Typography settings
│   └── screens/
│       ├── SplashScreen.js    # Splash screen with auto-navigation
│       └── OnboardingScreen.js # 4 onboarding slides
├── App.js                      # Main navigation setup
├── package.json
└── README.md
\`\`\`

## Technical Stack

- React Native 0.73
- Expo ~50.0
- React Navigation 6.x
- React Native Gesture Handler
- React Native Safe Area Context

## Design Reference

All screens follow the design specifications from the provided reference image with:
- Isometric illustration style
- Minimalist, professional appearance
- Clean spacing and modern typography
- Mobile-first responsive design

## Next Steps (Not Implemented)

The following features are planned but not yet implemented:
- Login/Signup screens
- OTP verification
- Customer dashboard
- Service provider dashboard
- Maps integration
- Real-time tracking
- Payment integration
- Chat functionality
- Admin panel

## Notes

- Auto-navigation from splash screen occurs after 2.5 seconds
- Onboarding screens support swipe gestures
- Skip button available on all onboarding screens
- Design strictly follows provided specifications
- No additional features added beyond requirements
