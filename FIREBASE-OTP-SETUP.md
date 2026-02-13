# Firebase Phone Authentication Setup Guide

**Project:** HomeEase  
**Date:** February 13, 2026  
**Purpose:** Integrate Firebase Phone Auth for OTP verification

---

## 📋 Prerequisites

1. Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
2. Android and iOS apps registered in Firebase
3. Phone Authentication enabled in Firebase Console

---

## 🔧 Installation Steps

### 1. Install Firebase Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

### 2. Update package.json

The dependencies will be added automatically. Verify they're present:

```json
{
  "dependencies": {
    "@react-native-firebase/app": "^20.0.0",
    "@react-native-firebase/auth": "^20.0.0"
  }
}
```

---

## 🤖 Android Setup

### Step 1: Download google-services.json

1. Go to Firebase Console → Project Settings
2. Download `google-services.json`
3. Place it in: `android/app/google-services.json`

### Step 2: Update Project-level build.gradle

File: `android/build.gradle`

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.4")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        
        // Add Firebase plugin
        classpath("com.google.gms:google-services:4.4.1")
    }
}
```

### Step 3: Update App-level build.gradle

File: `android/app/build.gradle`

Add at the top (after other plugins):

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

// Add Firebase plugin
apply plugin: "com.google.gms.google-services"
```

Add dependencies:

```gradle
dependencies {
    // Firebase BOM
    implementation platform('com.google.firebase:firebase-bom:32.8.0')
    
    // Firebase Auth
    implementation 'com.google.firebase:firebase-auth'
    
    // Firebase Analytics (optional)
    implementation 'com.google.firebase:firebase-analytics'
    
    // Existing dependencies...
}
```

### Step 4: Sync Gradle

```bash
cd android
./gradlew clean
cd ..
```

---

## 🍎 iOS Setup

### Step 1: Download GoogleService-Info.plist

1. Go to Firebase Console → Project Settings → iOS App
2. Download `GoogleService-Info.plist`
3. Place it in: `ios/HomeEase/GoogleService-Info.plist`

### Step 2: Install Pods

```bash
cd ios
pod install
cd ..
```

### Step 3: Update AppDelegate

File: `ios/HomeEase/AppDelegate.mm`

Add Firebase import at the top:

```objc
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Add Firebase configuration
  [FIRApp configure];
  
  // Existing code...
  self.moduleName = @"HomeEase";
  self.initialProps = @{};
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
```

### Step 4: Enable Phone Auth Capability

1. Open `ios/HomeEase.xcworkspace` in Xcode
2. Select your target → Signing & Capabilities
3. Add "Push Notifications" capability (required for phone auth)

---

## 🔥 Firebase Console Configuration

### 1. Enable Phone Authentication

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Phone" provider
3. Add test phone numbers (optional for development):
   - Phone: +92 300 0000000
   - Code: 123456

### 2. Configure SHA-1 (Android)

Get SHA-1 fingerprint:

```bash
cd android
./gradlew signingReport
```

Add SHA-1 to Firebase Console:
- Project Settings → Your Android App → Add fingerprint

### 3. Add iOS App ID

In Firebase Console:
- Project Settings → iOS App
- Verify Bundle ID matches: `com.homeease` (or your bundle ID)

---

## 📱 Implementation in React Native

### Update OTPVerificationScreen.js

The screen is already created. Now integrate Firebase:

```javascript
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { phoneNumber, verificationType } = route.params;
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    sendOTP();
  }, []);

  const sendOTP = async () => {
    try {
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setLoading(false);
      setTimer(60);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      await confirm.confirm(otp);
      
      // OTP verified successfully
      if (verificationType === 'signup') {
        // Complete signup process
        navigation.navigate('CustomerDashboard');
      } else if (verificationType === 'reset') {
        // Navigate to reset password
        navigation.navigate('ResetPassword', { phoneNumber });
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Invalid OTP', 'The code you entered is incorrect');
    }
  };

  const resendOTP = () => {
    if (timer === 0) {
      sendOTP();
    }
  };

  return (
    // Existing UI with verifyOTP and resendOTP handlers
  );
};
```

### Update CustomerSignupScreen.js

Add phone verification before signup:

```javascript
import auth from '@react-native-firebase/auth';

const handleSignup = async () => {
  // Validate fields first
  if (!validateFields()) return;

  try {
    setLoading(true);
    
    // Send OTP to phone number
    const formattedPhone = formatPhoneNumber(phoneNumber); // +92XXXXXXXXXX
    
    navigation.navigate('OTPVerification', {
      phoneNumber: formattedPhone,
      verificationType: 'signup',
      userData: {
        name,
        email,
        password,
      },
    });
    
    setLoading(false);
  } catch (error) {
    setLoading(false);
    Alert.alert('Error', 'Failed to send verification code');
  }
};
```

### Update ForgotPasswordScreen.js

Add OTP verification for password reset:

```javascript
import auth from '@react-native-firebase/auth';

const handleResetViaPhone = async () => {
  if (!phoneNumber) {
    Alert.alert('Error', 'Please enter your phone number');
    return;
  }

  try {
    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    navigation.navigate('OTPVerification', {
      phoneNumber: formattedPhone,
      verificationType: 'reset',
    });
    
    setLoading(false);
  } catch (error) {
    setLoading(false);
    Alert.alert('Error', 'Failed to send verification code');
  }
};
```

---

## 🧪 Testing

### Test on Android

```bash
npx react-native run-android
```

### Test on iOS (Physical Device Required)

```bash
npx react-native run-ios --device
```

**Note:** Phone authentication requires a physical device. It won't work on emulators/simulators.

### Test Flow

1. Open app → Navigate to Signup
2. Enter phone number: +92 300 1234567
3. Tap "Send OTP"
4. Receive SMS with 6-digit code
5. Enter OTP
6. Verify → Navigate to Dashboard

---

## 🔒 Security Best Practices

### 1. Rate Limiting

Firebase automatically rate limits OTP requests. Additional backend validation recommended.

### 2. Test Phone Numbers

For development, use Firebase test phone numbers:

```javascript
// In Firebase Console → Authentication → Sign-in method → Phone
// Add test numbers:
// +92 300 0000000 → 123456
// +92 300 1111111 → 654321
```

### 3. Production Considerations

- Enable App Check for abuse prevention
- Implement CAPTCHA for web
- Monitor Firebase usage quotas
- Add backend verification layer

---

## 📊 Firebase Quotas

### Free Tier (Spark Plan)

- 10,000 phone verifications/month
- Unlimited authentications after verification
- No credit card required

### Paid Tier (Blaze Plan)

- $0.06 per verification after free tier
- Pay as you go
- Higher rate limits

---

## 🐛 Troubleshooting

### Android Issues

**Issue:** "google-services.json not found"
- Solution: Ensure file is in `android/app/` directory
- Run: `cd android && ./gradlew clean`

**Issue:** "SHA-1 fingerprint mismatch"
- Solution: Add SHA-1 to Firebase Console
- Get SHA-1: `cd android && ./gradlew signingReport`

**Issue:** "Phone auth not working"
- Solution: Enable Phone provider in Firebase Console
- Check internet connection
- Verify google-services.json is correct

### iOS Issues

**Issue:** "GoogleService-Info.plist not found"
- Solution: Add file to Xcode project (not just folder)
- Ensure it's in target membership

**Issue:** "Push notifications not configured"
- Solution: Add Push Notifications capability in Xcode
- Enable in Apple Developer Portal

**Issue:** "Phone auth requires physical device"
- Solution: Test on real iPhone, not simulator
- Use test phone numbers for development

### Common Issues

**Issue:** "OTP not received"
- Check phone number format: +92XXXXXXXXXX
- Verify Firebase quota not exceeded
- Check spam/blocked messages
- Use test phone numbers for development

**Issue:** "Invalid verification code"
- Ensure 6-digit code is correct
- Check if code expired (usually 60 seconds)
- Try resending OTP

---

## 🔄 Integration Checklist

- [ ] Install Firebase packages
- [ ] Add google-services.json (Android)
- [ ] Add GoogleService-Info.plist (iOS)
- [ ] Update build.gradle files (Android)
- [ ] Update AppDelegate.mm (iOS)
- [ ] Install iOS pods
- [ ] Enable Phone Auth in Firebase Console
- [ ] Add SHA-1 fingerprint (Android)
- [ ] Update OTPVerificationScreen with Firebase
- [ ] Update CustomerSignupScreen
- [ ] Update ForgotPasswordScreen
- [ ] Test on physical device
- [ ] Add error handling
- [ ] Implement resend OTP
- [ ] Add timer countdown
- [ ] Test complete flow

---

## 📝 Next Steps

1. **Backend Integration**
   - Store verified phone numbers in database
   - Link Firebase UID with user profile
   - Implement session management

2. **Enhanced Features**
   - Auto-read OTP (Android SMS Retriever API)
   - Biometric authentication after first login
   - Remember device option
   - Multi-factor authentication

3. **Analytics**
   - Track OTP success rate
   - Monitor verification failures
   - Analyze user drop-off points

---

## 📚 Resources

- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/android/phone-auth)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com)
- [Android SHA-1 Guide](https://developers.google.com/android/guides/client-auth)

---

## ✅ Summary

Firebase Phone Authentication is now ready to integrate into HomeEase. Follow the steps above to:

1. Set up Firebase in Android and iOS
2. Update authentication screens with Firebase SDK
3. Test OTP flow on physical devices
4. Deploy to production with proper security measures

**Estimated Setup Time:** 1-2 hours  
**Testing Time:** 30 minutes  
**Status:** Ready for implementation

---

**Note:** This guide assumes you're using Expo bare workflow or React Native CLI. If using Expo managed workflow, use `expo-firebase-auth` instead.
