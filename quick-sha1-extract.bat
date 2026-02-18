@echo off
echo ========================================
echo Quick SHA-1 Extraction
echo ========================================
echo.

set JAVA_BIN=C:\Program Files\Java\jdk-21.0.10\bin
set KEYTOOL=%JAVA_BIN%\keytool.exe
set KEYSTORE=%USERPROFILE%\.android\debug.keystore

echo Checking for debug keystore...
if exist "%KEYSTORE%" (
    echo ✅ Found keystore: %KEYSTORE%
    goto :extract_sha1
) else (
    echo ❌ Keystore not found at: %KEYSTORE%
    echo.
    echo The keystore will be created when you build the Android app.
    echo.
    echo Option 1: Run the full build script
    echo   .\generate-sha1-with-java.bat
    echo.
    echo Option 2: Create keystore manually (for testing only)
    echo.
    set /p CREATE_KEYSTORE="Would you like to create a debug keystore now? (Y/N): "
    if /i "%CREATE_KEYSTORE%"=="Y" goto :create_keystore
    if /i "%CREATE_KEYSTORE%"=="YES" goto :create_keystore
    echo.
    echo Please run: .\generate-sha1-with-java.bat
    pause
    exit /b 1
)

:create_keystore
echo.
echo Creating debug keystore...
if not exist "%USERPROFILE%\.android" mkdir "%USERPROFILE%\.android"

"%KEYTOOL%" -genkeypair -v -keystore "%KEYSTORE%" -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"

if errorlevel 1 (
    echo ERROR: Failed to create keystore
    pause
    exit /b 1
)
echo.
echo ✅ Keystore created!
echo.

:extract_sha1
echo ========================================
echo Extracting SHA-1 Fingerprint...
echo ========================================
echo.

"%KEYTOOL%" -list -v -keystore "%KEYSTORE%" -alias androiddebugkey -storepass android -keypass android | findstr "SHA1:"

if errorlevel 1 (
    echo.
    echo Showing full certificate info:
    "%KEYTOOL%" -list -v -keystore "%KEYSTORE%" -alias androiddebugkey -storepass android -keypass android
)

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Copy the SHA1 value from above
echo    (Format: SHA1: XX:XX:XX:...)
echo.
echo 2. Go to Firebase Console:
echo    https://console.firebase.google.com/
echo.
echo 3. Select HomeEase project
echo.
echo 4. Project Settings → Your apps → Android
echo.
echo 5. Click "Add fingerprint"
echo.
echo 6. Paste SHA-1 value (without "SHA1:" prefix)
echo.
echo 7. Click Save
echo.
echo 8. Download updated google-services.json
echo.
echo ========================================
echo.
pause
