@echo off
echo ========================================
echo Firebase OTP - Build and Test
echo ========================================
echo.

echo Step 1: Deleting old Android folder...
rmdir /s /q android
echo Done!
echo.

echo Step 2: Rebuilding Android project...
call npx expo prebuild --platform android
echo Done!
echo.

echo Step 3: Running on device...
echo Make sure your device is connected via USB!
echo.
call npx expo run:android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Now test:
echo 1. Sign Up with your phone number
echo 2. You should receive real OTP via SMS
echo 3. Enter OTP and verify
echo 4. Login success!
echo.
pause
