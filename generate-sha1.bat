@echo off
echo ========================================
echo HomeEase SHA-1 Fingerprint Generator
echo ========================================
echo.

echo Step 1: Checking for Android folder...
if exist "android\gradlew.bat" (
    echo Android folder found with Gradle wrapper!
    goto :generate_sha1
) else (
    echo Android folder not found or incomplete.
    echo.
    echo This is an Expo project. We need to prebuild first.
    echo.
    goto :prebuild
)

:prebuild
echo Step 2: Prebuilding Android native files...
echo This will generate the full Android project structure.
echo.
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo.
    echo ERROR: Prebuild failed!
    echo.
    echo Please try manually:
    echo 1. Close any Android Studio or file explorer windows
    echo 2. Delete the android folder if it exists
    echo 3. Run: npx expo prebuild --platform android
    pause
    exit /b 1
)
echo.
echo Prebuild completed successfully!
echo.

:generate_sha1
echo Step 3: Generating SHA-1 fingerprint...
echo.
cd android
call gradlew signingReport
cd ..
echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo 1. Look for "Variant: debug" in the output above
echo 2. Copy the SHA1 value (format: XX:XX:XX:...)
echo 3. Go to Firebase Console
echo 4. Project Settings -^> Your Apps -^> Android
echo 5. Add the SHA-1 fingerprint
echo 6. Download updated google-services.json
echo 7. Replace android/app/google-services.json
echo ========================================
echo.
pause
