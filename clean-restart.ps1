#!/usr/bin/env powershell
# Clean restart script for Wootility Manager Extension

Write-Host "🧹 Clean Restart for Wootility Manager Extension" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Stop any running processes
Write-Host "`n⏹️  Stopping any running npm processes..." -ForegroundColor Yellow
try {
    # Kill any node processes that might be running
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped existing processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No processes to stop" -ForegroundColor Blue
}

# Step 2: Clean build artifacts
Write-Host "`n🧹 Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Removed dist/" -ForegroundColor Green
}

if (Test-Path ".raycast") {
    Remove-Item -Recurse -Force ".raycast" 
    Write-Host "✅ Removed .raycast/" -ForegroundColor Green
}

# Step 3: Clean node modules and reinstall
Write-Host "`n📦 Reinstalling dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

# Install fresh dependencies
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Step 4: Check for icon issue
Write-Host "`n🖼️  Checking icon..." -ForegroundColor Yellow
if (-not (Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" -Force | Out-Null
}

# Create a simple placeholder icon if needed
if (-not (Test-Path "assets\command-icon.png")) {
    Write-Host "⚠️  Creating temporary icon placeholder..." -ForegroundColor Yellow
    
    # This is a workaround - we'll create an empty file
    # User will need to replace with actual icon
    "PLACEHOLDER" | Out-File -FilePath "assets\command-icon.png" -Encoding ASCII
    Write-Host "⚠️  Temporary icon created - replace with real 512x512 PNG" -ForegroundColor Yellow
}

# Step 5: Validate setup
Write-Host "`n🔧 Validating setup..." -ForegroundColor Yellow
npx tsc --noEmit --skipLibCheck
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript validation passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript has some issues (might be normal)" -ForegroundColor Yellow
}

# Step 6: Instructions for Raycast
Write-Host "`n🎯 Raycast Clean Steps:" -ForegroundColor Cyan
Write-Host "1. Close Raycast completely" -ForegroundColor White
Write-Host "2. Wait 5 seconds" -ForegroundColor White
Write-Host "3. Restart Raycast" -ForegroundColor White
Write-Host "4. Run this command in a NEW terminal: npm run dev" -ForegroundColor White
Write-Host "5. Search 'Wootility Manager' in Raycast" -ForegroundColor White

Write-Host "`n✅ Clean restart preparation complete!" -ForegroundColor Green
Write-Host "`nNext: Close Raycast, restart it, then run: npm run dev" -ForegroundColor Cyan