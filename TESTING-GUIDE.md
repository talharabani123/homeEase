# HomeEase Authentication Testing Guide

## 🧪 Testing Your Implementation

This guide will help you test all the authentication features we've implemented.

---

## Prerequisites

Before testing, ensure you have:
- ✅ Expo CLI installed
- ✅ Node.js and npm installed
- ✅ Expo Go app on your mobile device (or emulator)
- ✅ All dependencies installed

---

## 🚀 Running the Application

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Development Server
```bash
npm start
# or
npx expo start
```

### Step 3: Open on Device
- Scan the QR code with Expo Go (Android)
- Scan with Camera app (iOS)
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator

---

## 📱 Testing Flows

### 1. Onboarding Flow Test

**Steps:**
1. Launch the app
2. Wait for splash screen (2 seconds)
3. Swipe through 3 onboarding screens
4. On the 3rd screen, verify:
   - ✅ Arrow button is replaced with "Get Started" button
   - ✅ Button is full-width and styled correctly
5. Tap "Get Started"
6. Verify role selection modal appears with:
   - ✅ Title: "Do you want to offer home services..."
   - ✅ Two buttons visible
   - ✅ Modal has semi-transparent overlay

**Expected Result:** Modal opens smoothly with both role options

---

### 2. Customer Signup Flow Test

**Steps:**
1. From role modal, tap "Hire a Service Professional"
2. Should navigate to CustomerSignupScreen
3. Test form validation:

**Test Case 2.1: Empty Form Submission**
- Leave all fields empty
- Tap "Continue"
- ✅ Verify error messages appear for all required fields

**Test Case 2.2: Invalid Phone Number**
- Enter: `123`
- ✅ Verify auto-formatting to `+92 123`
- ✅ Verify error: "Enter valid Pakistani mobile number"

**Test Case 2.3: Valid Phone Number Formatting**
- Enter: `03001234567`
- ✅ Verify auto-formats to: `+92 300 1234 567`
- ✅ Verify no error message

**Test Case 2.4: Weak Password**
- Enter password: `123`
- ✅ Verify error: "Password must be at least 6 characters"

**Test Case 2.5: Password Mismatch**
- Password: `password123`
- Confirm: `password456`
- ✅ Verify error: "Passwords do not match"

**Test Case 2.6: Valid Signup**
- Full Name: `John Doe`
- Phone: `03001234567` (auto-formats to `+92 300 1234 567`)
- Email: `john@example.com` (optional)
- Password: `password123`
- Confirm Password: `password123`
- Tap "Continue"
- ✅ Should navigate to OTP Verification screen

**Test Case 2.7: OTP Verification**
- Enter 6-digit OTP (any digits for testing)
- ✅ Auto-focus moves to next field
- ✅ Backspace moves to previous field
- ✅ Timer counts down from 60s
- ✅ "Resend Code" appears after timer ends
- Tap "Verify & Continue"
- ✅ Success modal appears with confetti animation

**Test Case 2.8: Success Modal**
- ✅ Confetti animation plays (30 particles)
- ✅ Success icon animates with spring effect
- ✅ Title: "Registration Successful 🎉"
- ✅ Welcome message with user's name
- ✅ Two buttons: "Continue to Dashboard" and "Go to Login"
- ✅ Animation stops after 3-5 seconds
- Tap "Go to Login"
- ✅ Navigates to CustomerLoginScreen

**Expected Result:** Complete signup flow works smoothly with validation and success animation

---

### 3. Provider Signup Flow Test

**Steps:**
1. From onboarding, tap "Get Started"
2. Tap "Become a Service Provider"
3. Should navigate to ProviderSignupScreen

**Test Case 3.1: Step 1 - Personal Information**
- ✅ Progress bar shows "Step 1 of 6"
- ✅ Progress fill is ~16.67%
- Test phone formatting: `03001234567` → `+92 300 1234 567`
- Test password validation (minimum 6 chars)
- Test password match
- Tap "Next"
- ✅ Should move to Step 2

**Test Case 3.2: Step 2 - CNIC Verification**
- ✅ Progress bar shows "Step 2 of 6"
- Test CNIC formatting:
  - Enter: `3520212345671`
  - ✅ Auto-formats to: `35202-1234567-1`
- Test invalid CNIC:
  - Enter: `123`
  - ✅ Error: "Enter valid CNIC in XXXXX-XXXXXXX-X format"
- Tap "Upload CNIC Front"
- ✅ Alert shows: "Image picker will be implemented"
- ✅ Button changes to "✓ Image Uploaded"
- Repeat for CNIC Back
- Tap "Back"
- ✅ Should return to Step 1 with data preserved
- Tap "Next" twice to return to Step 2
- Tap "Next"
- ✅ Should move to Step 3

**Test Case 3.3: Step 3 - Facial Verification**
- ✅ Progress bar shows "Step 3 of 6"
- ✅ Large upload button visible
- Tap "🤳 Capture Selfie"
- ✅ Alert shows: "Image picker will be implemented"
- ✅ Button changes to "✓ Selfie Captured"
- Tap "Next"
- ✅ Should move to Step 4

**Test Case 3.4: Step 4 - Service Details**
- ✅ Progress bar shows "Step 4 of 6"
- ✅ 9 service categories displayed in grid
- Tap "Plumber"
- ✅ Button highlights with green background
- Tap "Electrician"
- ✅ Previous selection deselects, new one highlights
- Enter experience: `5`
- Enter skills: `Expert in electrical repairs and installations`
- Enter tools (optional): `Multimeter, Wire strippers, etc.`
- Tap "Next"
- ✅ Should move to Step 5

**Test Case 3.5: Step 5 - Address & Location**
- ✅ Progress bar shows "Step 5 of 6"
- Enter address: `House 123, Street 45, F-7 Islamabad`
- Enter city: `Islamabad`
- Enter postal code: `44000` (optional)
- Tap "📍 Pick Location on Map"
- ✅ Alert shows: "GPS location picker will be implemented"
- ✅ Button changes to "✓ Location Set"
- Tap "Next"
- ✅ Should move to Step 6

**Test Case 3.6: Step 6 - Work Proof (Optional)**
- ✅ Progress bar shows "Step 6 of 6"
- ✅ Progress fill is 100%
- ✅ Both upload buttons visible
- ✅ Counter shows (0) for both
- Tap "Submit"
- ✅ Should navigate to OTP Verification

**Test Case 3.7: Provider OTP & Success**
- Complete OTP verification
- ✅ Success modal appears with confetti
- ✅ Message mentions "under verification"
- ✅ Info box shows "24-48 hours"
- ✅ Only "Go to Login" button visible
- Tap "Go to Login"
- ✅ Navigates to ProviderLoginScreen

**Expected Result:** Complete 6-step provider signup works with validation and success animation

---

### 4. Customer Login Flow Test

**Test Case 4.1: Login Method Toggle**
- Navigate to CustomerLoginScreen
- ✅ Default method is "Password"
- Tap "OTP" tab
- ✅ Password field disappears
- ✅ Helper text changes
- Tap "Password" tab
- ✅ Password field reappears

**Test Case 4.2: Password Login**
- Enter phone: `03001234567`
- ✅ Auto-formats to `+92 300 1234 567`
- Enter password: `password123`
- Tap "Sign In"
- ✅ Console logs login attempt
- ✅ (With backend: navigates to dashboard)

**Test Case 4.3: OTP Login**
- Switch to "OTP" method
- Enter phone: `03001234567`
- Tap "Send OTP"
- ✅ Navigates to OTP Verification
- Complete OTP
- ✅ (With backend: navigates to dashboard)

**Test Case 4.4: Forgot Password Link**
- Tap "Forgot Password?"
- ✅ Navigates to ForgotPasswordScreen

**Test Case 4.5: Signup Link**
- Tap "Sign Up" link
- ✅ Navigates to CustomerSignupScreen

**Expected Result:** All login options work correctly

---

### 5. Provider Login Flow Test

**Test Case 5.1: Provider Badge**
- Navigate to ProviderLoginScreen
- ✅ Provider badge visible below logo
- ✅ Badge text: "Service Provider"
- ✅ Badge has green background

**Test Case 5.2: Login Methods**
- Test both Password and OTP methods
- ✅ Same functionality as customer login
- ✅ Phone formatting works
- ✅ Validation works

**Test Case 5.3: Navigation**
- Test "Forgot Password?" link
- Test "Sign Up" link → ProviderSignupScreen
- ✅ All navigation works

**Expected Result:** Provider login works with proper branding

---

### 6. Password Reset Flow Test

**Test Case 6.1: Method Selection**
- From login, tap "Forgot Password?"
- ✅ Two method tabs visible: "📱 Mobile Number" and "✉️ Email"
- ✅ Default is Mobile Number

**Test Case 6.2: Reset via Phone**
- Enter phone: `03001234567`
- ✅ Auto-formats to `+92 300 1234 567`
- ✅ Helper text: "We'll send an OTP..."
- ✅ Info box shows instructions
- Tap "Send OTP"
- ✅ Navigates to OTP Verification
- Complete OTP
- ✅ Navigates to ResetPasswordScreen

**Test Case 6.3: Reset via Email**
- Switch to "Email" tab
- Enter email: `test@example.com`
- ✅ Helper text: "We'll send a reset link..."
- ✅ Info box shows different instructions
- Tap "Send Reset Link"
- ✅ Alert shows: "Password reset link has been sent"
- ✅ Navigates back to login

**Test Case 6.4: Reset Password Screen**
- After OTP verification
- ✅ Success icon visible
- ✅ Title: "Create New Password"
- Enter new password: `newpass123`
- Enter confirm: `newpass123`
- ✅ No error
- Test mismatch:
  - Confirm: `different`
  - ✅ Error: "Passwords do not match"
- Fix and tap "Reset Password"
- ✅ Alert: "Your password has been reset successfully"
- ✅ Navigates to CustomerLoginScreen

**Test Case 6.5: Show Password Toggle**
- ✅ Checkbox visible
- Tap checkbox
- ✅ Password becomes visible
- Tap again
- ✅ Password hidden

**Test Case 6.6: Password Requirements**
- ✅ Requirements box visible
- ✅ Shows "At least 6 characters"
- ✅ Shows recommendation for mix

**Expected Result:** Complete password reset flow works for both methods

---

### 7. Validation Testing

**Test Case 7.1: CNIC Formatting**
Test in ProviderSignupScreen Step 2:
- Input: `1` → Output: `1`
- Input: `12345` → Output: `12345`
- Input: `123456` → Output: `12345-6`
- Input: `123456789012` → Output: `12345-6789012`
- Input: `1234567890123` → Output: `12345-6789012-3`
- Input: `12345678901234` → Output: `12345-6789012-3` (max 13 digits)
- ✅ Dashes auto-added at correct positions

**Test Case 7.2: Phone Formatting**
Test in any signup/login screen:
- Input: `0` → Output: `+92 0`
- Input: `03` → Output: `+92 3`
- Input: `030` → Output: `+92 30`
- Input: `0300` → Output: `+92 300`
- Input: `03001` → Output: `+92 300 1`
- Input: `030012345` → Output: `+92 300 1234 5`
- Input: `03001234567` → Output: `+92 300 1234 567`
- Input: `030012345678` → Output: `+92 300 1234 567` (max length)
- ✅ Spaces auto-added at correct positions

**Test Case 7.3: Email Validation**
Test in CustomerSignupScreen:
- Input: `test` → No error (optional field)
- Input: `test@` → Error: "Enter valid email address"
- Input: `test@example` → Error: "Enter valid email address"
- Input: `test@example.com` → No error
- ✅ Email validation works

**Expected Result:** All formatting and validation works correctly

---

### 8. Animation Testing

**Test Case 8.1: Confetti Animation**
- Complete any signup flow
- When success modal appears:
  - ✅ Count ~30 confetti pieces
  - ✅ Multiple colors visible
  - ✅ Particles fall from top
  - ✅ Random horizontal movement
  - ✅ Rotation animation
  - ✅ Fade out effect
  - ✅ Animation stops after 3-5 seconds
  - ✅ No infinite loop

**Test Case 8.2: Success Icon Animation**
- ✅ Icon scales from 0 to 1
- ✅ Spring/bounce effect
- ✅ Smooth animation

**Test Case 8.3: Modal Appearance**
- ✅ Fade-in animation
- ✅ Smooth overlay appearance

**Expected Result:** All animations are smooth and performant

---

### 9. Navigation Testing

**Test Case 9.1: Back Navigation**
- Test back button on all screens
- ✅ Returns to previous screen
- ✅ Data preserved where appropriate

**Test Case 9.2: Deep Navigation**
- Test complete flow: Onboarding → Signup → OTP → Success → Login
- ✅ All transitions smooth
- ✅ No navigation errors

**Test Case 9.3: Modal Dismissal**
- Test role selection modal
- Test success modal
- ✅ Modals close properly
- ✅ Correct navigation after close

**Expected Result:** All navigation works smoothly

---

### 10. Edge Cases Testing

**Test Case 10.1: Rapid Input**
- Type very fast in phone/CNIC fields
- ✅ Formatting keeps up
- ✅ No crashes

**Test Case 10.2: Copy/Paste**
- Copy formatted phone: `+92 300 1234 567`
- Paste in phone field
- ✅ Accepts and formats correctly
- Copy unformatted: `03001234567`
- Paste in phone field
- ✅ Formats correctly

**Test Case 10.3: Special Characters**
- Try entering letters in phone field
- ✅ Only numbers accepted
- Try entering special chars in CNIC
- ✅ Only numbers accepted

**Test Case 10.4: Long Names**
- Enter very long name (100+ characters)
- ✅ Accepts input
- ✅ Displays correctly in success modal

**Test Case 10.5: Network Errors (Simulated)**
- Disable network
- Try to submit form
- ✅ (With backend: shows error message)

**Expected Result:** App handles edge cases gracefully

---

## 🐛 Common Issues & Solutions

### Issue 1: App Won't Start
**Solution:**
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue 2: Confetti Not Showing
**Check:**
- Modal is visible
- Animation is not blocked by other components
- Check console for errors

### Issue 3: Formatting Not Working
**Check:**
- Validation.js is imported correctly
- Functions are called in onChange handlers
- State is updating

### Issue 4: Navigation Errors
**Check:**
- All screens are registered in App.js
- Screen names match exactly
- Navigation params are passed correctly

---

## 📊 Testing Checklist

### Core Functionality
- [ ] Splash screen displays
- [ ] Onboarding swipe works
- [ ] Role selection modal works
- [ ] Customer signup complete flow
- [ ] Provider signup all 6 steps
- [ ] Customer login both methods
- [ ] Provider login both methods
- [ ] Password reset via phone
- [ ] Password reset via email
- [ ] OTP verification all types

### Validation
- [ ] Phone auto-formatting
- [ ] CNIC auto-formatting
- [ ] Email validation
- [ ] Password validation
- [ ] Required field validation
- [ ] Error messages display

### Animations
- [ ] Confetti animation
- [ ] Success icon animation
- [ ] Modal transitions
- [ ] Screen transitions

### Navigation
- [ ] All forward navigation
- [ ] All back navigation
- [ ] Modal dismissal
- [ ] Deep linking (if implemented)

### UI/UX
- [ ] Responsive on different screen sizes
- [ ] Keyboard handling
- [ ] Touch targets adequate
- [ ] Text readable
- [ ] Colors consistent

---

## 📝 Bug Report Template

If you find issues, document them:

```
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Device Info:**
- Device: [e.g., iPhone 12, Samsung Galaxy S21]
- OS: [e.g., iOS 15, Android 12]
- Expo Version: [from package.json]

**Additional Context:**
[Any other relevant information]
```

---

## ✅ Testing Complete

Once all tests pass:
1. Document any issues found
2. Fix critical bugs
3. Proceed to backend integration
4. Conduct user acceptance testing

---

**Happy Testing! 🚀**
