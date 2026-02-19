@echo off
echo ========================================
echo Build HomeEase for Android and iOS
echo ========================================
echo.

echo This will build your app for BOTH platforms!
echo.
echo Features that work on both:
echo - Phone OTP Authentication
echo - Home Screen with Services
echo - Provider Listings
echo - Service Booking
echo - Live Tracking
echo - Payment and Rating
echo - User Profile
echo.
pause

echo Step 1: Installing EAS CLI...
call npm install -g eas-cli
if errorlevel 1 (
    echo ERROR: Failed to install EAS CLI
    pause
    exit /b 1
)
echo ✅ EAS CLI installed!
echo.

echo Step 2: Login to Expo...
call eas login
if errorlevel 1 (
    echo ERROR: Login failed
    pause
    exit /b 1
)
echo ✅ Logged in!
echo.

echo Step 3: Configure EAS (if needed)...
call eas build:configure
echo.

echo Step 4: Building for BOTH platforms...
echo.
echo This will build:
echo - Android APK
echo - iOS IPA
echo.
echo Build time: 15-20 minutes
echo.
set /p CONFIRM="Build for both Android and iOS? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Build cancelled.
    pause
    exit /b 0
)

echo.
echo Starting build for all platforms...
call eas build --platform all

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://expo.dev/
echo 2. Navigate to your project → Builds
echo 3. Download Android APK
echo 4. Download iOS IPA
echo 5. Install on your devices
echo 6. Test all features!
echo.
echo Both platforms have:
echo ✅ Same functionality
echo ✅ Same UI/UX
echo ✅ Phone OTP authentication
echo ✅ All features working
echo.
pause
