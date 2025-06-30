#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Testing Web App Functionality\n');

const tests = [
  {
    name: 'Build Test',
    command: 'npm run build',
    successCheck: (output) => output.includes('Compiled successfully')
  },
  {
    name: 'API Health Check',
    command: 'timeout 10 bash -c "npm run dev > /dev/null 2>&1 & sleep 3 && curl -s http://localhost:3000/api/health"',
    successCheck: (output) => output.includes('"status":"healthy"')
  },
  {
    name: 'Home Page Check',
    command: 'timeout 10 bash -c "npm run dev > /dev/null 2>&1 & sleep 3 && curl -s http://localhost:3000 | grep \\"Welcome to Leila\\""',
    successCheck: (output) => output.includes('Welcome to Leila')
  },
  {
    name: 'Booking Page Check',
    command: 'timeout 10 bash -c "npm run dev > /dev/null 2>&1 & sleep 3 && curl -s http://localhost:3000/book | grep \\"Book a Service\\""',
    successCheck: (output) => output.includes('Book a Service')
  }
];

let passedTests = 0;
let totalTests = tests.length;

for (const test of tests) {
  console.log(`🔍 Running: ${test.name}`);
  
  try {
    const output = execSync(test.command, { encoding: 'utf8', timeout: 15000 });
    
    if (test.successCheck(output)) {
      console.log(`✅ ${test.name}: PASSED\n`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name}: FAILED - unexpected output\n`);
      console.log(`Output: ${output.slice(0, 200)}...\n`);
    }
  } catch (error) {
    console.log(`❌ ${test.name}: FAILED - ${error.message}\n`);
  }
  
  // Clean up any running processes
  try {
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
  } catch (e) {}
}

console.log('📊 Test Results:');
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 ALL TESTS PASSED! Web app is functional!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Web app needs fixes.');
  process.exit(1);
}