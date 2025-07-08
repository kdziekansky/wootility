#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating Wootility Manager Extension Setup...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

let errors = 0;
let warnings = 0;

// Check if file exists
function checkFile(filePath, required = true) {
  if (fs.existsSync(filePath)) {
    log.success(`Found: ${filePath}`);
    return true;
  } else {
    if (required) {
      log.error(`Missing required file: ${filePath}`);
      errors++;
    } else {
      log.warning(`Optional file missing: ${filePath}`);
      warnings++;
    }
    return false;
  }
}

// Check directory structure
function checkDirectory(dirPath, required = true) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log.success(`Found directory: ${dirPath}`);
    return true;
  } else {
    if (required) {
      log.error(`Missing required directory: ${dirPath}`);
      errors++;
    } else {
      log.warning(`Optional directory missing: ${dirPath}`);
      warnings++;
    }
    return false;
  }
}

// Validate package.json content
function validatePackageJson() {
  log.header('\n📦 Validating package.json...');
  
  if (!checkFile('package.json')) return;

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'title', 'description', 'icon', 'author', 'commands'];
    requiredFields.forEach(field => {
      if (packageJson[field]) {
        log.success(`package.json has required field: ${field}`);
      } else {
        log.error(`package.json missing required field: ${field}`);
        errors++;
      }
    });

    // Check commands structure
    if (packageJson.commands && Array.isArray(packageJson.commands)) {
      log.success(`Found ${packageJson.commands.length} commands defined`);
      packageJson.commands.forEach((cmd, index) => {
        if (cmd.name && cmd.title && cmd.description && cmd.mode) {
          log.success(`Command ${index + 1} (${cmd.name}) properly configured`);
        } else {
          log.error(`Command ${index + 1} missing required fields`);
          errors++;
        }
      });
    }

    // Check dependencies
    if (packageJson.dependencies && packageJson.dependencies['@raycast/api']) {
      log.success('Raycast API dependency found');
    } else {
      log.error('Missing @raycast/api dependency');
      errors++;
    }

  } catch (error) {
    log.error(`Invalid package.json: ${error.message}`);
    errors++;
  }
}

// Validate directory structure
function validateStructure() {
  log.header('\n📁 Validating directory structure...');
  
  // Required directories
  checkDirectory('src');
  checkDirectory('src/hooks');
  checkDirectory('src/utils');
  
  // Optional directories
  checkDirectory('assets', false);
  checkDirectory('metadata', false);
  
  // Required files
  checkFile('src/manage-profiles.tsx');
  checkFile('src/quick-switch.tsx');
  checkFile('src/rgb-control.tsx');
  checkFile('src/device-info.tsx');
  checkFile('src/hooks/useProfiles.ts');
  checkFile('src/utils/wootility-api.ts');
  
  // Optional files
  checkFile('README.md', false);
  checkFile('tsconfig.json', false);
  checkFile('.eslintrc.js', false);
}

// Validate TypeScript compilation
function validateTypeScript() {
  log.header('\n🔧 Validating TypeScript...');
  
  if (!checkFile('tsconfig.json', false)) {
    log.warning('No tsconfig.json found, using default TypeScript settings');
    return;
  }

  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log.success('TypeScript compilation successful');
  } catch (error) {
    log.error('TypeScript compilation failed');
    log.error(error.stdout?.toString() || error.message);
    errors++;
  }
}

// Check Node.js and npm versions
function validateEnvironment() {
  log.header('\n🌍 Validating environment...');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log.success(`Node.js version: ${nodeVersion}`);
    
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.success(`npm version: ${npmVersion}`);
    
    // Check if dependencies are installed
    if (fs.existsSync('node_modules')) {
      log.success('node_modules directory found');
      
      // Check for key dependencies
      const keyDeps = ['@raycast/api', 'react', 'typescript'];
      keyDeps.forEach(dep => {
        if (fs.existsSync(path.join('node_modules', dep))) {
          log.success(`Dependency installed: ${dep}`);
        } else {
          log.warning(`Dependency not found: ${dep}`);
          warnings++;
        }
      });
    } else {
      log.warning('node_modules not found. Run: npm install');
      warnings++;
    }
    
  } catch (error) {
    log.error('Environment validation failed');
    log.error(error.message);
    errors++;
  }
}

// Check for common issues
function checkCommonIssues() {
  log.header('\n🔍 Checking for common issues...');
  
  // Check for .DS_Store files (macOS)
  if (fs.existsSync('.DS_Store')) {
    log.warning('Found .DS_Store file - consider adding to .gitignore');
    warnings++;
  }
  
  // Check for large files in assets
  if (fs.existsSync('assets')) {
    const files = fs.readdirSync('assets');
    files.forEach(file => {
      const filePath = path.join('assets', file);
      const stats = fs.statSync(filePath);
      if (stats.size > 1024 * 1024) { // 1MB
        log.warning(`Large asset file: ${file} (${Math.round(stats.size / 1024)}KB)`);
        warnings++;
      }
    });
  }
  
  // Check for TODO comments in source files
  const sourceFiles = [
    'src/manage-profiles.tsx',
    'src/quick-switch.tsx', 
    'src/rgb-control.tsx',
    'src/device-info.tsx',
    'src/utils/wootility-api.ts'
  ];
  
  sourceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const todoCount = (content.match(/TODO|FIXME|XXX/gi) || []).length;
      if (todoCount > 0) {
        log.warning(`Found ${todoCount} TODO/FIXME comments in ${file}`);
        warnings++;
      }
    }
  });
}

// Wootility-specific checks
function validateWootilityIntegration() {
  log.header('\n⌨️  Validating Wootility integration...');
  
  // Check for common Wootility paths
  const wootilityPaths = [
    'C:\\Program Files\\WootingUtility\\WootingUtility.exe',
    'C:\\Program Files (x86)\\WootingUtility\\WootingUtility.exe',
    'C:\\Program Files\\Wooting\\Wootility\\Wootility.exe'
  ];
  
  let wootilityFound = false;
  wootilityPaths.forEach(wootPath => {
    if (fs.existsSync(wootPath)) {
      log.success(`Found Wootility at: ${wootPath}`);
      wootilityFound = true;
    }
  });
  
  if (!wootilityFound) {
    log.warning('Wootility not found in common locations');
    log.info('Extension will use mock data for testing');
    warnings++;
  }
  
  // Check Profile Switcher config
  const configPath = path.join(process.env.APPDATA || '', 'WootingProfileSwitcher', 'config.json');
  if (fs.existsSync(configPath)) {
    log.success('Found WootingProfileSwitcher config');
  } else {
    log.info('No WootingProfileSwitcher config found - this is normal');
  }
}

// Main validation function
function main() {
  console.log(`${colors.bold}Wootility Manager Extension - Setup Validation${colors.reset}`);
  console.log('=' * 50);
  
  validateEnvironment();
  validateStructure();
  validatePackageJson();
  validateTypeScript();
  validateWootilityIntegration();
  checkCommonIssues();
  
  // Summary
  log.header('\n📊 Validation Summary');
  console.log('=' * 30);
  
  if (errors === 0 && warnings === 0) {
    log.success('🎉 All checks passed! Extension is ready for development.');
  } else if (errors === 0) {
    log.warning(`⚠️  Validation completed with ${warnings} warning(s).`);
    log.info('Extension should work but consider addressing warnings.');
  } else {
    log.error(`❌ Validation failed with ${errors} error(s) and ${warnings} warning(s).`);
    log.error('Please fix errors before proceeding.');
  }
  
  console.log('\nNext steps:');
  if (errors === 0) {
    console.log('1. Run: npm run dev');
    console.log('2. Open Raycast and search for your extension');
    console.log('3. Test all commands thoroughly');
  } else {
    console.log('1. Fix the errors listed above');
    console.log('2. Run this validation script again');
    console.log('3. Proceed with development once all errors are resolved');
  }
  
  process.exit(errors > 0 ? 1 : 0);
}

// Run validation
main();