@echo off
echo ========================================
echo Fix Android Folder Lock Issue
echo ========================================
echo.

echo This script will help you fix the locked android folder.
echo.

echo Step 1: Close all programs that might be using the folder
echo.
echo Please close:
echo - Android Studio
echo - File Explorer windows showing the android folder
echo - Any text editors with android files open
echo - Command prompts or terminals in the android folder
echo.
pause

echo.
echo Step 2: Attempting to delete android folder...
echo.

if exist "android" (
    echo Removing android folder...
    rmdir /s /q android
    
    if exist "android" (
        echo.
        echo ERROR: Still cannot delete android folder!
        echo.
        echo Please manually:
        echo 1. Close ALL programs
        echo 2. Open Task Manager (Ctrl+Shift+Esc)
        echo 3. End any Java, Node, or Expo processes
        echo 4. Delete the android folder manually
        echo 5. Run this script again
        echo.
        pause
        exit /b 1
    ) else (
        echo ✅ Android folder deleted successfully!
    )
) else (
    echo ✅ Android folder doesn't exist (already clean)
)

echo.
echo Step 3: Running expo prebuild...
echo.
call npx expo prebuild --platform android

if errorlevel 1 (
    echo.
    echo ERROR: Prebuild failed!
    pause
    exit /b 1
)

echo.
echo ✅ Android project rebuilt successfully!
echo.
echo Step 4: You can now run the app
echo.
echo Run: npx expo run:android
echo.
pause
