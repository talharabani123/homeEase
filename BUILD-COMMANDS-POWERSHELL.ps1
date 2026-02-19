# Firebase OTP - Build and Test (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase OTP - Build and Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Deleting old Android folder..." -ForegroundColor Yellow
if (Test-Path "android") {
    Remove-Item -Recurse -Force android
    Write-Host "Done!" -ForegroundColor Green
} else {
    Write-Host "Android folder not found (already clean)" -ForegroundColor Green
}
Write-Host ""

Write-Host "Step 2: Rebuilding Android project..." -ForegroundColor Yellow
npx expo prebuild --platform android
Write-Host "Done!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Running on device..." -ForegroundColor Yellow
Write-Host "Make sure your device is connected via USB!" -ForegroundColor Cyan
Write-Host ""
npx expo run:android

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now test:" -ForegroundColor Yellow
Write-Host "1. Sign Up with your phone number" -ForegroundColor White
Write-Host "2. You should receive real OTP via SMS" -ForegroundColor White
Write-Host "3. Enter OTP and verify" -ForegroundColor White
Write-Host "4. Login success!" -ForegroundColor Green
Write-Host ""
