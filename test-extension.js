#!/usr/bin/env node

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Console colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test state
let testResults = {
  phase1: { total: 0, passed: 0, failed: 0 },
  phase2: { total: 0, passed: 0, failed: 0 },
  phase3: { total: 0, passed: 0, failed: 0 },
  phase4: { total: 0, passed: 0, failed: 0 },
  phase5: { total: 0, passed: 0, failed: 0 }
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bold');
  console.log('='.repeat(60));
}

function subheader(message) {
  console.log('\n' + '-'.repeat(40));
  log(message, 'cyan');
  console.log('-'.repeat(40));
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, resolve);
  });
}

function confirmStep(description, instructions) {
  return new Promise(async (resolve) => {
    log(`\n📋 Step: ${description}`, 'yellow');
    if (instructions) {
      log(`Instructions: ${instructions}`, 'dim');
    }
    
    const result = await question('\nDid this step pass? (y/n/s to skip): ');
    
    switch (result.toLowerCase()) {
      case 'y':
      case 'yes':
        log('✅ PASSED', 'green');
        resolve('pass');
        break;
      case 'n':
      case 'no':
        log('❌ FAILED', 'red');
        const reason = await question('Please describe the issue: ');
        log(`Issue: ${reason}`, 'red');
        resolve('fail');
        break;
      case 's':
      case 'skip':
        log('⏭️  SKIPPED', 'yellow');
        resolve('skip');
        break;
      default:
        log('Invalid input. Please enter y, n, or s', 'red');
        resolve(await confirmStep(description, instructions));
    }
  });
}

// Test phases
async function phase1_SetupValidation() {
  header('🔧 PHASE 1: Setup Validation');
  
  const tests = [
    {
      name: 'Check Node.js and npm installation',
      instructions: 'Run: node --version && npm --version'
    },
    {
      name: 'Verify project structure',
      instructions: 'Check that src/, assets/, package.json exist'
    },
    {
      name: 'Install dependencies',
      instructions: 'Run: npm install (should complete without errors)'
    },
    {
      name: 'Validate package.json configuration',
      instructions: 'Run: node validate-setup.js'
    },
    {
      name: 'Check TypeScript compilation',
      instructions: 'Run: npm run lint (should pass with no errors)'
    }
  ];

  testResults.phase1.total = tests.length;
  
  for (const test of tests) {
    const result = await confirmStep(test.name, test.instructions);
    if (result === 'pass') testResults.phase1.passed++;
    if (result === 'fail') testResults.phase1.failed++;
  }

  log(`\n📊 Phase 1 Results: ${testResults.phase1.passed}/${testResults.phase1.total} passed`, 'cyan');
}

async function phase2_ExtensionLoading() {
  header('🚀 PHASE 2: Extension Loading');
  
  const tests = [
    {
      name: 'Start development mode',
      instructions: 'Run: npm run dev (should start without errors)'
    },
    {
      name: 'Open Raycast and find extension',
      instructions: 'Open Raycast, search for "Wootility Manager"'
    },
    {
      name: 'Verify all 4 commands appear',
      instructions: 'Should see: Manage Profiles, Quick Switch, RGB Control, Device Info'
    },
    {
      name: 'Check for loading errors',
      instructions: 'Open each command, verify no error messages appear'
    }
  ];

  testResults.phase2.total = tests.length;
  
  for (const test of tests) {
    const result = await confirmStep(test.name, test.instructions);
    if (result === 'pass') testResults.phase2.passed++;
    if (result === 'fail') testResults.phase2.failed++;
  }

  log(`\n📊 Phase 2 Results: ${testResults.phase2.passed}/${testResults.phase2.total} passed`, 'cyan');
}

async function phase3_MockDataTesting() {
  header('🧪 PHASE 3: Mock Data Testing');
  
  const tests = [
    {
      name: 'Test "Manage Profiles" command',
      instructions: 'Should show 2 mock devices (Wooting One, Wooting Two HE) with profiles'
    },
    {
      name: 'Test profile switching functionality',
      instructions: 'Click on inactive profile, should see loading toast and success message'
    },
    {
      name: 'Test "Quick Switch Profile" command',
      instructions: 'Try switching to Profile 2, should show HUD success message'
    },
    {
      name: 'Test "RGB Control" command',
      instructions: 'Should show 7 RGB effects, try applying "Rainbow Wave"'
    },
    {
      name: 'Test "Device Information" command',
      instructions: 'Should show device list, click device to see detailed info'
    }
  ];

  testResults.phase3.total = tests.length;
  
  for (const test of tests) {
    const result = await confirmStep(test.name, test.instructions);
    if (result === 'pass') testResults.phase3.passed++;
    if (result === 'fail') testResults.phase3.failed++;
  }

  log(`\n📊 Phase 3 Results: ${testResults.phase3.passed}/${testResults.phase3.total} passed`, 'cyan');
}

async function phase4_ErrorHandling() {
  header('🚨 PHASE 4: Error Handling');
  
  const tests = [
    {
      name: 'Test with Wootility not installed scenario',
      instructions: 'Should show helpful error messages, not crash'
    },
    {
      name: 'Test invalid profile numbers',
      instructions: 'Try Quick Switch with "5" or "abc", should show validation errors'
    },
    {
      name: 'Test no devices scenario',
      instructions: 'Should gracefully handle empty device list'
    },
    {
      name: 'Verify error messages are helpful',
      instructions: 'Error messages should provide clear next steps'
    }
  ];

  testResults.phase4.total = tests.length;
  
  for (const test of tests) {
    const result = await confirmStep(test.name, test.instructions);
    if (result === 'pass') testResults.phase4.passed++;
    if (result === 'fail') testResults.phase4.failed++;
  }

  log(`\n📊 Phase 4 Results: ${testResults.phase4.passed}/${testResults.phase4.total} passed`, 'cyan');
}

async function phase5_RealHardwareTesting() {
  header('⌨️  PHASE 5: Real Hardware Testing');
  
  const hasHardware = await question('\nDo you have a Wooting keyboard and Wootility installed? (y/n): ');
  
  if (hasHardware.toLowerCase() !== 'y') {
    log('⏭️  Skipping hardware testing - no physical hardware available', 'yellow');
    log('Note: Extension should work with mock data for development', 'blue');
    return;
  }

  const tests = [
    {
      name: 'Install and setup Wootility',
      instructions: 'Download from wooting.io, install, and run once'
    },
    {
      name: 'Connect Wooting keyboard',
      instructions: 'Connect via USB, verify detected in Wootility'
    },
    {
      name: 'Test real profile switching',
      instructions: 'Switch profiles in extension, verify keyboard behavior changes'
    },
    {
      name: 'Test RGB effects (if supported)',
      instructions: 'Apply RGB effects, verify lighting changes on keyboard'
    },
    {
      name: 'Verify device information accuracy',
      instructions: 'Check device info matches what Wootility shows'
    }
  ];

  testResults.phase5.total = tests.length;
  
  for (const test of tests) {
    const result = await confirmStep(test.name, test.instructions);
    if (result === 'pass') testResults.phase5.passed++;
    if (result === 'fail') testResults.phase5.failed++;
  }

  log(`\n📊 Phase 5 Results: ${testResults.phase5.passed}/${testResults.phase5.total} passed`, 'cyan');
}

async function generateTestReport() {
  header('📄 TEST REPORT');
  
  const totalTests = Object.values(testResults).reduce((sum, phase) => sum + phase.total, 0);
  const totalPassed = Object.values(testResults).reduce((sum, phase) => sum + phase.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, phase) => sum + phase.failed, 0);
  
  log('\nTest Results Summary:', 'bold');
  log(`Phase 1 (Setup): ${testResults.phase1.passed}/${testResults.phase1.total} passed`);
  log(`Phase 2 (Loading): ${testResults.phase2.passed}/${testResults.phase2.total} passed`);
  log(`Phase 3 (Mock Data): ${testResults.phase3.passed}/${testResults.phase3.total} passed`);
  log(`Phase 4 (Error Handling): ${testResults.phase4.passed}/${testResults.phase4.total} passed`);
  log(`Phase 5 (Hardware): ${testResults.phase5.passed}/${testResults.phase5.total} passed`);
  
  log(`\nOverall: ${totalPassed}/${totalTests} tests passed`, 'bold');
  
  if (totalFailed === 0) {
    log('\n🎉 ALL TESTS PASSED! Extension is ready for use.', 'green');
    log('Next steps:', 'cyan');
    log('1. Create screenshots for Raycast Store');
    log('2. Polish any remaining features');
    log('3. Consider publishing to Raycast Store');
  } else {
    log(`\n⚠️  ${totalFailed} tests failed. Please address issues before proceeding.`, 'yellow');
    log('Recommended actions:', 'cyan');
    log('1. Review failed tests and fix issues');
    log('2. Re-run testing for failed phases');
    log('3. Check console logs for detailed error information');
  }
  
  // Save report to file
  const reportDate = new Date().toISOString().split('T')[0];
  const reportContent = `# Wootility Manager Extension - Test Report
Generated: ${new Date().toISOString()}

## Test Results Summary
- Phase 1 (Setup): ${testResults.phase1.passed}/${testResults.phase1.total} passed
- Phase 2 (Loading): ${testResults.phase2.passed}/${testResults.phase2.total} passed
- Phase 3 (Mock Data): ${testResults.phase3.passed}/${testResults.phase3.total} passed
- Phase 4 (Error Handling): ${testResults.phase4.passed}/${testResults.phase4.total} passed
- Phase 5 (Hardware): ${testResults.phase5.passed}/${testResults.phase5.total} passed

## Overall: ${totalPassed}/${totalTests} tests passed

${totalFailed === 0 ? '✅ ALL TESTS PASSED!' : `❌ ${totalFailed} tests failed`}

## Next Steps
${totalFailed === 0 
  ? '- Create screenshots\n- Polish features\n- Consider publishing'
  : '- Fix failed tests\n- Re-run testing\n- Check error logs'
}
`;

  fs.writeFileSync(`test-report-${reportDate}.md`, reportContent);
  log(`\n📄 Test report saved to: test-report-${reportDate}.md`, 'green');
}

async function main() {
  log('🧪 Wootility Manager Extension - Interactive Testing', 'bold');
  log('This script will guide you through comprehensive testing of the extension.\n', 'dim');
  
  const proceed = await question('Ready to begin testing? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    log('Testing cancelled.', 'yellow');
    process.exit(0);
  }

  try {
    await phase1_SetupValidation();
    await phase2_ExtensionLoading();
    await phase3_MockDataTesting();
    await phase4_ErrorHandling();
    await phase5_RealHardwareTesting();
    await generateTestReport();
  } catch (error) {
    log(`\n❌ Testing interrupted: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Testing interrupted by user', 'yellow');
  rl.close();
  process.exit(0);
});

// Run the test suite
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});