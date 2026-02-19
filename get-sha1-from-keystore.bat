@echo off
echo ========================================
echo Extract SHA-1 from Debug Keystore
echo ========================================
echo.

set KEYSTORE_PATH=%USERPROFILE%\.android\debug.keystore

echo Checking for debug keystore...
if exist "%KEYSTORE_PATH%" (
    echo Found: %KEYSTORE_PATH%
    echo.
    echo Extracting SHA-1 fingerprint...
    echo.
    keytool -list -v -keystore "%KEYSTORE_PATH%" -alias androiddebugkey -storepass android -keypass android
    echo.
    echo ========================================
    echo INSTRUCTIONS:
    echo ========================================
    echo 1. Look for "SHA1:" in the output above
    echo 2. Copy the SHA1 value (format: XX:XX:XX:...)
    echo 3. Go to Firebase Console:
    echo    https://console.firebase.google.com/
    echo 4. Select your HomeEase project
    echo 5. Go to Project Settings (gear icon)
    echo 6. Scroll to "Your apps" section
    echo 7. Find Android app (com.homeease.app)
    echo 8. Click "Add fingerprint"
    echo 9. Paste SHA-1 and Save
    echo ========================================
) else (
    echo ERROR: Debug keystore not found!
    echo Expected location: %KEYSTORE_PATH%
    echo.
    echo The keystore is created when you first build an Android app.
    echo.
    echo To create it, run:
    echo   npx expo prebuild --platform android
    echo   npx expo run:android
    echo.
    echo Then run this script again.
)
echo.
pause
