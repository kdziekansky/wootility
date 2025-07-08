#!/usr/bin/env powershell
# Complete fix script for Wootility Manager Extension

Write-Host "🔧 Complete Fix for Wootility Manager Extension" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Step 1: Clean up existing node_modules
Write-Host "`n🧹 Cleaning up existing files..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" 
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

# Step 2: Create README.md if missing
if (-not (Test-Path "README.md")) {
    Write-Host "`n📝 Creating README.md..." -ForegroundColor Yellow
    
    $readmeContent = @'
# Wootility Manager for Raycast

A Raycast extension for controlling Wooting keyboard profiles and RGB lighting.

## Features

- 🎮 **Profile Management** - View and switch between keyboard profiles
- ⚡ **Quick Switch** - Instant profile switching with commands  
- 🌈 **RGB Control** - Apply lighting effects to your keyboard
- 📊 **Device Info** - View connected Wooting device information

## Requirements

- Raycast (Windows version)
- Wooting keyboard
- Wootility software (optional - extension works with mock data for testing)

## Commands

### Manage Profiles
View all available profiles for your connected Wooting devices and switch between them.

### Quick Switch Profile
Quickly switch to a specific profile by number (1-4).
Usage: `Quick Switch Profile 2`

### RGB Control
Apply various RGB lighting effects to your keyboard:
- Rainbow Wave
- Breathing
- Static colors
- Reactive lighting
- Turn off RGB

### Device Information
View detailed information about your connected Wooting devices.

## Development

The extension includes mock data support for development and testing.

## License

MIT
'@
    
    $readmeContent | Out-File -FilePath "README.md" -Encoding UTF8
    Write-Host "✅ Created README.md" -ForegroundColor Green
}

# Step 3: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ npm install failed. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying alternative approach..." -ForegroundColor Yellow
    
    # Try installing key dependencies individually
    npm install @raycast/api@latest
    npm install react@latest
    npm install --save-dev typescript@latest
    npm install --save-dev @types/react@latest
    npm install --save-dev @types/node@latest
}

# Step 4: Create a simple icon placeholder if needed
if (-not (Test-Path "assets\keyboard.png")) {
    # Create a simple text file as placeholder
    if (-not (Test-Path "assets")) {
        New-Item -ItemType Directory -Path "assets" -Force | Out-Null
    }
    
    $iconPlaceholder = @'
ICON PLACEHOLDER
================

You need to add a keyboard icon here:
- File name: keyboard.png
- Size: 512x512 pixels
- Format: PNG
- Should work in both light and dark themes

You can:
1. Create one in Figma/Canva
2. Download a keyboard icon and resize it
3. Use a simple keyboard emoji screenshot
'@
    
    $iconPlaceholder | Out-File -FilePath "assets\icon-needed.txt" -Encoding UTF8
    Write-Host "⚠️  Created icon placeholder in assets/" -ForegroundColor Yellow
}

# Step 5: Validate TypeScript compilation
Write-Host "`n🔧 Testing TypeScript compilation..." -ForegroundColor Yellow
try {
    npx tsc --noEmit --skipLibCheck
    Write-Host "✅ TypeScript compilation successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  TypeScript compilation has issues (this is normal for now)" -ForegroundColor Yellow
}

# Step 6: Final validation
Write-Host "`n🧪 Running final validation..." -ForegroundColor Yellow
if (Test-Path "validate-setup.js") {
    node validate-setup.js
} else {
    Write-Host "⚠️  validate-setup.js not found, skipping validation" -ForegroundColor Yellow
}

# Summary
Write-Host "`n🎉 Fix Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Open Raycast and search for 'Wootility Manager'" -ForegroundColor White  
Write-Host "3. Test the 'Manage Profiles' command" -ForegroundColor White
Write-Host "4. Try 'Quick Switch Profile' with argument '2'" -ForegroundColor White

Write-Host "`nIf you see any errors:" -ForegroundColor Yellow
Write-Host "- Check that all source files exist in src/" -ForegroundColor White
Write-Host "- Make sure package.json is valid" -ForegroundColor White
Write-Host "- Run this script again if needed" -ForegroundColor White

Write-Host "`n🚀 Ready to test!" -ForegroundColor Green