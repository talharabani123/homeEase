@echo off
echo ========================================
echo HomeEase SHA-1 Finder
echo ========================================
echo.

REM Check if keytool is available
where keytool >nul 2>&1
if %errorlevel% equ 0 (
    goto :extract_sha1
)

echo Keytool not found in PATH. Searching for Java...
echo.

REM Common Java installation paths
set JAVA_PATHS[0]="C:\Program Files\Java"
set JAVA_PATHS[1]="C:\Program Files (x86)\Java"
set JAVA_PATHS[2]="C:\Program Files\Android\Android Studio\jbr\bin"
set JAVA_PATHS[3]="C:\Program Files\Android\Android Studio\jre\bin"
set JAVA_PATHS[4]="%LOCALAPPDATA%\Android\Sdk\jre\bin"

for /L %%i in (0,1,4) do (
    if exist !JAVA_PATHS[%%i]! (
        for /r !JAVA_PATHS[%%i]! %%j in (keytool.exe) do (
            if exist "%%j" (
                set KEYTOOL_PATH=%%j
                goto :found_keytool
            )
        )
    )
)

echo ERROR: Java/keytool not found!
echo.
echo Please install Java JDK or Android Studio.
echo.
echo After installation, run this script again.
goto :end

:found_keytool
echo Found keytool at: %KEYTOOL_PATH%
echo.

:extract_sha1
set KEYSTORE_PATH=%USERPROFILE%\.android\debug.keystore

if not exist "%KEYSTORE_PATH%" (
    echo ERROR: Debug keystore not found at:
    echo %KEYSTORE_PATH%
    echo.
    echo The keystore is created when you build an Android app.
    echo.
    echo Run these commands first:
    echo   npx expo prebuild --platform android
    echo   npx expo run:android
    echo.
    goto :end
)

echo Found keystore: %KEYSTORE_PATH%
echo.
echo Extracting SHA-1 fingerprint...
echo ========================================
echo.

if defined KEYTOOL_PATH (
    "%KEYTOOL_PATH%" -list -v -keystore "%KEYSTORE_PATH%" -alias androiddebugkey -storepass android -keypass android | findstr "SHA1:"
) else (
    keytool -list -v -keystore "%KEYSTORE_PATH%" -alias androiddebugkey -storepass android -keypass android | findstr "SHA1:"
)

echo.
echo ========================================
echo.
echo Copy the SHA1 value above and add it to Firebase:
echo.
echo 1. Go to: https://console.firebase.google.com/
echo 2. Select HomeEase project
echo 3. Click gear icon → Project Settings
echo 4. Scroll to "Your apps" → Android app
echo 5. Click "Add fingerprint"
echo 6. Paste SHA-1 value
echo 7. Click Save
echo 8. Download updated google-services.json
echo.
echo ========================================

:end
echo.
pause
