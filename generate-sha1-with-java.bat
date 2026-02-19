@echo off
echo ========================================
echo HomeEase SHA-1 Generator (with Java)
echo ========================================
echo.

set JAVA_BIN=C:\Program Files\Java\jdk-21.0.10\bin
set KEYTOOL=%JAVA_BIN%\keytool.exe

echo Checking Java installation...
"%JAVA_BIN%\java.exe" -version
if errorlevel 1 (
    echo ERROR: Java not found at: %JAVA_BIN%
    echo Please verify Java installation path.
    pause
    exit /b 1
)
echo.
echo ✅ Java found!
echo.

echo ========================================
echo Step 1: Checking for Android project...
echo ========================================
if exist "android\gradlew.bat" (
    echo ✅ Android project found!
    goto :generate_sha1
) else (
    echo Android project not found. Need to prebuild...
    goto :prebuild
)

:prebuild
echo.
echo ========================================
echo Step 2: Prebuilding Android project...
echo ========================================
echo.
echo IMPORTANT: If you see an error about locked files:
echo 1. Close any File Explorer windows showing the android folder
echo 2. Close Android Studio if it's open
echo 3. Run this script again
echo.
pause
echo.

REM Try to delete old android folder
if exist "android" (
    echo Removing old android folder...
    rmdir /s /q android 2>nul
    if exist "android" (
        echo.
        echo ERROR: Cannot delete android folder - it's locked!
        echo.
        echo Please:
        echo 1. Close File Explorer windows
        echo 2. Close Android Studio
        echo 3. Delete the android folder manually
        echo 4. Run this script again
        echo.
        pause
        exit /b 1
    )
)

echo Running expo prebuild...
call npx expo prebuild --platform android
if errorlevel 1 (
    echo.
    echo ERROR: Prebuild failed!
    pause
    exit /b 1
)
echo.
echo ✅ Prebuild completed!
echo.

:generate_sha1
echo ========================================
echo Step 3: Generating SHA-1 fingerprint...
echo ========================================
echo.

if not exist "android\gradlew.bat" (
    echo ERROR: gradlew.bat not found!
    echo Please run: npx expo prebuild --platform android
    pause
    exit /b 1
)

cd android
call gradlew.bat signingReport
cd ..

echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo.
echo 1. Look for "Variant: debug" in the output above
echo 2. Find the line that starts with "SHA1:"
echo 3. Copy the SHA-1 value (format: XX:XX:XX:...)
echo.
echo 4. Go to Firebase Console:
echo    https://console.firebase.google.com/
echo.
echo 5. Select your HomeEase project
echo.
echo 6. Click gear icon → Project Settings
echo.
echo 7. Scroll to "Your apps" section
echo.
echo 8. Find Android app: com.homeease.app
echo.
echo 9. Click "Add fingerprint"
echo.
echo 10. Paste SHA-1 and click Save
echo.
echo 11. Download updated google-services.json
echo.
echo 12. Replace: android/app/google-services.json
echo.
echo ========================================
echo.
pause
