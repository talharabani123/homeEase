@echo off
echo ========================================
echo HomeEase EAS Build Setup
echo ========================================
echo.
echo This will set up EAS Build to generate SHA-1
echo automatically without needing Java installed.
echo.
echo ========================================
echo Step 1: Installing EAS CLI...
echo ========================================
call npm install -g eas-cli
if errorlevel 1 (
    echo ERROR: Failed to install EAS CLI
    pause
    exit /b 1
)
echo.
echo ✅ EAS CLI installed successfully!
echo.
echo ========================================
echo Step 2: Login to Expo
echo ========================================
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
echo.
echo ✅ Logged in successfully!
echo.
echo ========================================
echo Step 3: Configure EAS Build
echo ========================================
call eas build:configure
if errorlevel 1 (
    echo ERROR: Configuration failed
    pause
    exit /b 1
)
echo.
echo ✅ EAS configured successfully!
echo.
echo ========================================
echo Step 4: Start Android Build
echo ========================================
echo.
echo This will create a development build and generate SHA-1.
echo The build will run on Expo's servers (takes 5-10 minutes).
echo.
pause
echo.
echo Starting build...
call eas build --platform android --profile development
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Wait for build to complete
echo 2. Go to: https://expo.dev/
echo 3. Navigate to your project → Builds
echo 4. Click on your Android build
echo 5. Copy the SHA-1 fingerprint
echo 6. Add it to Firebase Console
echo ========================================
echo.
pause
