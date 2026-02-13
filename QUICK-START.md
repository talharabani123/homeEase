# HomeEase - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you run the HomeEase app on your device quickly.

---

## Prerequisites

Make sure you have these installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo Go** app on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Step 1: Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install all required packages. Wait for it to complete (may take 2-3 minutes).

---

## Step 2: Start the Development Server

Run:

```bash
npm start
```

Or:

```bash
npx expo start
```

You should see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## Step 3: Open on Your Device

### For Android:
1. Open **Expo Go** app
2. Tap **"Scan QR Code"**
3. Scan the QR code from your terminal
4. App will load on your device

### For iOS:
1. Open **Camera** app
2. Point at the QR code
3. Tap the notification that appears
4. App will open in Expo Go

### For Emulator/Simulator:
- Press **`a`** in terminal for Android emulator
- Press **`i`** in terminal for iOS simulator

---

## Step 4: Test the App

Once the app loads:

1. **Splash Screen** - Wait 2 seconds
2. **Onboarding** - Swipe through 3 screens
3. **Get Started** - Tap button on last screen
4. **Choose Role** - Select customer or provider
5. **Sign Up** - Fill the form and test features

---

## 🎯 Quick Test Scenarios

### Test Customer Signup:
1. Choose "Hire a Service Professional"
2. Fill form:
   - Name: `John Doe`
   - Phone: `03001234567` (watch it auto-format!)
   - Password: `password123`
   - Confirm: `password123`
3. Tap "Continue"
4. Enter any 6-digit OTP
5. Watch the confetti animation! 🎉

### Test Provider Signup:
1. Choose "Become a Service Provider"
2. Go through all 6 steps
3. Watch CNIC auto-format: `3520212345671` → `35202-1234567-1`
4. Complete OTP verification
5. See the success animation!

### Test Password Reset:
1. From login, tap "Forgot Password?"
2. Toggle between Phone and Email methods
3. Enter phone number (watch formatting)
4. Complete the flow

---

## 🔧 Troubleshooting

### Problem: "npm install" fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Problem: "Expo Go can't connect"
**Solution:**
- Make sure phone and computer are on same WiFi
- Disable VPN if active
- Try restarting the dev server: Press `r` in terminal

### Problem: App shows error screen
**Solution:**
```bash
# Clear cache and restart
npx expo start -c
```

### Problem: Changes not reflecting
**Solution:**
- Press `r` in terminal to reload
- Or shake device and tap "Reload"

---

## 📱 Device Requirements

### Minimum Requirements:
- **Android**: 5.0 (Lollipop) or higher
- **iOS**: 13.0 or higher
- **RAM**: 2GB minimum
- **Storage**: 100MB free space

### Recommended:
- **Android**: 8.0 (Oreo) or higher
- **iOS**: 14.0 or higher
- **RAM**: 4GB or more
- Good WiFi connection

---

## 🎨 Features to Test

### ✅ Implemented Features:
- [x] Splash screen with logo
- [x] 3-screen onboarding
- [x] Role selection modal
- [x] Customer signup with validation
- [x] Provider 6-step signup
- [x] Phone auto-formatting (+92 format)
- [x] CNIC auto-formatting (XXXXX-XXXXXXX-X)
- [x] Dual login methods (Password/OTP)
- [x] Password reset (Phone/Email)
- [x] OTP verification
- [x] Success modal with confetti animation
- [x] Pending verification screen
- [x] Real-time form validation

### 🔄 Placeholder Features (Need Backend):
- [ ] Actual OTP sending/verification
- [ ] Image upload (CNIC, face, work proof)
- [ ] GPS location picker
- [ ] User authentication
- [ ] Dashboard screens

---

## 📂 Project Structure

```
HomeEase/
├── App.js                          # Main navigation
├── src/
│   ├── components/
│   │   └── RegistrationSuccessModal.js
│   ├── constants/
│   │   ├── colors.js
│   │   └── typography.js
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── OnboardingScreen.js
│   │   └── auth/
│   │       ├── CustomerLoginScreen.js
│   │       ├── CustomerSignupScreen.js
│   │       ├── ProviderLoginScreen.js
│   │       ├── ProviderSignupScreen.js
│   │       ├── ForgotPasswordScreen.js
│   │       ├── ResetPasswordScreen.js
│   │       ├── OTPVerificationScreen.js
│   │       └── PendingVerificationScreen.js
│   └── utils/
│       └── validation.js           # Pakistan-specific validations
├── assets/                         # Images and icons
└── package.json                    # Dependencies
```

---

## 🎯 What to Focus On

### 1. Phone Number Formatting
Watch how `03001234567` automatically becomes `+92 300 1234 567`

### 2. CNIC Formatting
See `3520212345671` transform to `35202-1234567-1`

### 3. Confetti Animation
Complete any signup to see the celebration animation

### 4. Multi-Step Form
Provider signup shows progress through 6 steps

### 5. Validation
Try submitting empty forms or invalid data to see error messages

---

## 🔄 Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start -c

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Run on web browser
npm run web

# Check for issues
npx expo doctor
```

---

## 📊 Performance Tips

### For Better Performance:
1. **Close other apps** on your device
2. **Use good WiFi** connection
3. **Keep phone charged** (testing drains battery)
4. **Clear Expo cache** if app feels slow:
   ```bash
   npx expo start -c
   ```

### For Faster Reloads:
- Enable **Fast Refresh** (enabled by default)
- Use **Hot Reload** for quick changes
- Press `r` in terminal for manual reload

---

## 🎓 Learning Resources

### Understanding the Code:
1. Start with `App.js` - See navigation setup
2. Check `src/screens/OnboardingScreen.js` - See animations
3. Look at `src/utils/validation.js` - See formatting logic
4. Review `src/components/RegistrationSuccessModal.js` - See confetti

### React Native Basics:
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

---

## 🐛 Known Limitations

### Current Limitations:
1. **No Backend** - All data is local, not saved
2. **Mock OTP** - Any 6 digits work
3. **Image Upload** - Shows placeholder alert
4. **Location Picker** - Shows placeholder alert
5. **No Persistence** - Data lost on app restart

### Coming Soon:
- Backend API integration
- Real OTP service
- Image upload functionality
- GPS location picker
- User authentication
- Data persistence

---

## 📞 Need Help?

### If you encounter issues:
1. Check **TESTING-GUIDE.md** for detailed testing steps
2. Review **IMPLEMENTATION-SUMMARY.md** for feature overview
3. Check **ENHANCED-AUTH-FEATURES.md** for technical details
4. Look at console logs for error messages

### Common Questions:

**Q: Why does OTP accept any number?**
A: Backend not connected yet. Any 6 digits work for testing.

**Q: Where is my data saved?**
A: Currently nowhere. Backend integration needed for persistence.

**Q: Can I test on multiple devices?**
A: Yes! Scan the same QR code on multiple devices.

**Q: How do I reset the app?**
A: Close and reopen, or shake device and tap "Reload".

---

## ✅ Success Checklist

You're ready when you can:
- [ ] Run `npm start` successfully
- [ ] See app on your device
- [ ] Complete customer signup flow
- [ ] Complete provider signup flow
- [ ] See confetti animation
- [ ] Test phone formatting
- [ ] Test CNIC formatting
- [ ] Test password reset
- [ ] Navigate between screens smoothly

---

## 🎉 You're All Set!

The app is now running on your device. Explore all the features and test the authentication flows.

**Next Steps:**
1. Complete the testing guide (TESTING-GUIDE.md)
2. Review implementation details (IMPLEMENTATION-SUMMARY.md)
3. Plan backend integration
4. Build dashboard screens

**Happy Coding! 🚀**

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Status:** ✅ Ready for Testing
