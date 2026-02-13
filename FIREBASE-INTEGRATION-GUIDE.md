# Firebase Integration Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

### Step 2: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or select existing
3. Add Android app:
   - Package name: `com.homeease`
   - Download `google-services.json`
4. Add iOS app:
   - Bundle ID: `com.homeease`
   - Download `GoogleService-Info.plist`
5. Enable Phone Authentication:
   - Authentication → Sign-in method → Phone → Enable

### Step 3: Android Configuration

1. Place `google-services.json` in `android/app/`
2. Update `android/build.gradle`:
   ```gradle
   dependencies {
       classpath("com.google.gms:google-services:4.4.1")
   }
   ```
3. Update `android/app/build.gradle`:
   ```gradle
   apply plugin: "com.google.gms.google-services"
   
   dependencies {
       implementation platform('com.google.firebase:firebase-bom:32.8.0')
       implementation 'com.google.firebase:firebase-auth'
   }
   ```

### Step 4: iOS Configuration

1. Place `GoogleService-Info.plist` in `ios/HomeEase/`
2. Update `ios/HomeEase/AppDelegate.mm`:
   ```objc
   #import <Firebase.h>
   
   - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
   {
     [FIRApp configure];
     // ... rest of code
   }
   ```
3. Run: `cd ios && pod install && cd ..`

### Step 5: Test

```bash
# Android
npx react-native run-android

# iOS (requires physical device)
npx react-native run-ios --device
```

---

## 📱 Usage in Your App

### Import Firebase Auth Utilities

```javascript
import { sendOTP, verifyOTP, formatPhoneNumber } from '../utils/firebaseAuth';
```

### Send OTP

```javascript
const handleSendOTP = async () => {
  const result = await sendOTP(phoneNumber);
  
  if (result.success) {
    setConfirmation(result.confirmation);
    // Navigate to OTP screen
  } else {
    Alert.alert('Error', result.error);
  }
};
```

### Verify OTP

```javascript
const handleVerifyOTP = async () => {
  const result = await verifyOTP(confirmation, otpCode);
  
  if (result.success) {
    // User authenticated
    console.log('User UID:', result.uid);
    // Navigate to dashboard
  } else {
    Alert.alert('Error', result.error);
  }
};
```

---

## 🧪 Test Phone Numbers (Development)

Add these in Firebase Console → Authentication → Sign-in method → Phone → Test phone numbers:

| Phone Number | OTP Code |
|--------------|----------|
| +92 300 0000000 | 123456 |
| +92 300 1111111 | 654321 |
| +92 300 2222222 | 111111 |

These numbers won't send actual SMS but will work for testing.

---

## 🔒 Security Checklist

- [ ] Enable App Check in Firebase Console
- [ ] Add SHA-1 fingerprint for Android
- [ ] Enable reCAPTCHA for web
- [ ] Set up rate limiting
- [ ] Monitor Firebase quotas
- [ ] Implement backend verification
- [ ] Use HTTPS for all API calls
- [ ] Store sensitive data securely

---

## 📊 Firebase Quotas

**Free Tier (Spark):**
- 10,000 phone verifications/month
- Unlimited authentications

**Paid Tier (Blaze):**
- $0.06 per verification after free tier
- Pay as you go

---

## 🐛 Common Issues

### "google-services.json not found"
- Ensure file is in `android/app/` directory
- Run `cd android && ./gradlew clean`

### "Phone auth not working on iOS"
- Must use physical device (not simulator)
- Enable Push Notifications capability
- Verify GoogleService-Info.plist is added to Xcode project

### "OTP not received"
- Check phone number format: +92XXXXXXXXXX
- Verify Firebase quota not exceeded
- Use test phone numbers for development

---

## 📚 Files Created

1. `FIREBASE-OTP-SETUP.md` - Complete setup guide
2. `src/utils/firebaseAuth.js` - Firebase helper functions
3. `android/app/google-services.json.example` - Example config
4. `FIREBASE-INTEGRATION-GUIDE.md` - This quick start

---

## ✅ Integration Status

- [x] Firebase packages installed
- [ ] google-services.json added (Android)
- [ ] GoogleService-Info.plist added (iOS)
- [ ] Build.gradle updated (Android)
- [ ] AppDelegate updated (iOS)
- [ ] Phone Auth enabled in Firebase Console
- [ ] Test phone numbers configured
- [ ] OTP screens updated with Firebase
- [ ] Tested on physical device

---

## 🎯 Next Steps

1. Download Firebase config files from console
2. Place them in correct directories
3. Update build files as shown above
4. Test OTP flow on physical device
5. Deploy to production

**Need Help?** Check `FIREBASE-OTP-SETUP.md` for detailed instructions.
