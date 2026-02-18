@echo off
echo ========================================
echo Quick APK Build (No Android Studio)
echo ========================================
echo.

echo This will build your app using Expo's cloud service.
echo No Android Studio installation required!
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
echo.
echo Please enter your Expo credentials.
echo If you don't have an account, create one at: https://expo.dev/
echo.
call eas login
if errorlevel 1 (
    echo ERROR: Login failed
    pause
    exit /b 1
)
echo ✅ Logged in!
echo.

echo Step 3: Configure EAS Build...
call eas build:configure
if errorlevel 1 (
    echo ERROR: Configuration failed
    pause
    exit /b 1
)
echo ✅ Configured!
echo.

echo Step 4: Building APK...
echo.
echo This will take 10-15 minutes.
echo The build runs on Expo's servers.
echo.
call eas build --platform android --profile preview
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://expo.dev/
echo 2. Navigate to your project → Builds
echo 3. Download the APK file
echo 4. Transfer to your Android device
echo 5. Install and test!
echo.
echo Your Phone OTP should work once installed!
echo.
pause
