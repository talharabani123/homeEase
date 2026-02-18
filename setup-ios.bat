@echo off
echo ========================================
echo HomeEase iOS Setup
echo ========================================
echo.

echo This script will set up iOS for Firebase Phone Auth.
echo.
echo IMPORTANT NOTES:
echo - iOS requires APNs for real phone numbers
echo - For testing, use Firebase test phone numbers
echo - You need a Mac to build iOS apps
echo.
pause

echo ========================================
echo Step 1: Checking GoogleService-Info.plist
echo ========================================
if exist "GoogleService-Info.plist" (
    echo ✅ Found GoogleService-Info.plist
) else (
    echo ❌ GoogleService-Info.plist not found!
    echo.
    echo Please download it from Firebase Console:
    echo 1. Go to: https://console.firebase.google.com/
    echo 2. Select HomeEase project
    echo 3. Project Settings → Your apps → iOS
    echo 4. Download GoogleService-Info.plist
    echo 5. Place it in the project root
    echo.
    pause
    exit /b 1
)
echo.

echo ========================================
echo Step 2: Checking app.json configuration
echo ========================================
echo.
echo Please ensure your app.json has iOS configuration:
echo.
echo "ios": {
echo   "bundleIdentifier": "com.homeease.app",
echo   "googleServicesFile": "./GoogleService-Info.plist"
echo },
echo "plugins": [
echo   "@react-native-firebase/app",
echo   "@react-native-firebase/auth"
echo ]
echo.
pause

echo ========================================
echo Step 3: Prebuilding iOS project
echo ========================================
echo.
echo This will generate the native iOS files...
echo.
call npx expo prebuild --platform ios
if errorlevel 1 (
    echo ERROR: Prebuild failed!
    pause
    exit /b 1
)
echo.
echo ✅ iOS project prebuilt!
echo.

echo ========================================
echo Step 4: Installing CocoaPods dependencies
echo ========================================
echo.
echo NOTE: This step requires a Mac with CocoaPods installed.
echo If you're on Windows, skip this step and run it on Mac:
echo   cd ios
echo   pod install
echo.
set /p CONTINUE="Are you on a Mac? (Y/N): "
if /i "%CONTINUE%"=="Y" goto :install_pods
if /i "%CONTINUE%"=="YES" goto :install_pods
echo.
echo Skipping pod install. Run it manually on Mac.
goto :next_steps

:install_pods
cd ios
call pod install
cd ..
echo.
echo ✅ Pods installed!
echo.

:next_steps
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Add Test Phone Numbers in Firebase:
echo    - Firebase Console → Authentication → Sign-in method
echo    - Scroll to "Phone numbers for testing"
echo    - Add: +1 650-555-1234 → Code: 123456
echo.
echo 2. On Mac, run:
echo    npx expo run:ios
echo.
echo 3. Test with test phone number:
echo    - Phone: +1 650-555-1234
echo    - Code: 123456
echo.
echo 4. For production (real phone numbers):
echo    - Get Apple Developer Account
echo    - Create APNs authentication key
echo    - Upload to Firebase Console
echo.
echo ========================================
echo.
echo See IOS-FIREBASE-SETUP.md for detailed instructions.
echo.
pause
