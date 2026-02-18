@echo off
echo ========================================
echo Expo Timeout Error - Quick Fix Script
echo ========================================
echo.

echo Step 1: Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Step 2: Clearing Expo cache...
call npx expo start --clear --reset-cache
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Scan the QR code with Expo Go app
echo 2. If still not working, try: npx expo start --tunnel
echo.
pause
