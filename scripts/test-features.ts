#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';

interface TestResult {
  feature: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: TestResult[] = [];

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkDirectory(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function testVoiceAssistant() {
  console.log('🎤 Testing Voice Assistant...');
  
  const files = [
    'hooks/useVoiceRecognition.ts',
    'components/voice/VoiceAssistant.tsx',
    'lib/voice/voiceCommands.ts',
    'lib/voice/textToSpeech.ts'
  ];

  for (const file of files) {
    if (await checkFileExists(file)) {
      results.push({
        feature: `Voice Assistant - ${file}`,
        status: 'pass',
        message: 'File exists'
      });
    } else {
      results.push({
        feature: `Voice Assistant - ${file}`,
        status: 'fail',
        message: 'File not found'
      });
    }
  }
}

async function testRealtimeTracking() {
  console.log('📍 Testing Real-time Tracking...');
  
  const files = [
    'hooks/useRealtimeTracking.ts',
    'components/tracking/LiveMap.tsx',
    'components/tracking/TrackingStatus.tsx',
    'app/tracking/[bookingId]/page.tsx'
  ];

  for (const file of files) {
    if (await checkFileExists(file)) {
      results.push({
        feature: `Real-time Tracking - ${file}`,
        status: 'pass',
        message: 'File exists'
      });
    } else {
      results.push({
        feature: `Real-time Tracking - ${file}`,
        status: 'fail',
        message: 'File not found'
      });
    }
  }

  // Check for map icons
  const icons = [
    'public/images/icons/home-marker.svg',
    'public/images/icons/contractor-vehicle.svg'
  ];

  for (const icon of icons) {
    if (await checkFileExists(icon)) {
      results.push({
        feature: `Map Icons - ${icon}`,
        status: 'pass',
        message: 'Icon exists'
      });
    } else {
      results.push({
        feature: `Map Icons - ${icon}`,
        status: 'fail',
        message: 'Icon not found'
      });
    }
  }
}

async function testWallet() {
  console.log('💳 Testing Wallet Feature...');
  
  if (await checkFileExists('app/wallet/page.tsx')) {
    results.push({
      feature: 'Wallet Page',
      status: 'pass',
      message: 'Wallet page exists'
    });
  } else {
    results.push({
      feature: 'Wallet Page',
      status: 'fail',
      message: 'Wallet page not found'
    });
  }
}

async function testReviews() {
  console.log('⭐ Testing Reviews System...');
  
  const files = [
    'components/reviews/ReviewForm.tsx',
    'components/reviews/ReviewsList.tsx',
    'app/reviews/page.tsx'
  ];

  for (const file of files) {
    if (await checkFileExists(file)) {
      results.push({
        feature: `Reviews - ${file}`,
        status: 'pass',
        message: 'File exists'
      });
    } else {
      results.push({
        feature: `Reviews - ${file}`,
        status: 'fail',
        message: 'File not found'
      });
    }
  }
}

async function testImageMonitoring() {
  console.log('🖼️ Testing Image Monitoring...');
  
  if (await checkFileExists('components/ImageMonitor.tsx')) {
    results.push({
      feature: 'Image Monitor',
      status: 'pass',
      message: 'Image monitor exists'
    });
  } else {
    results.push({
      feature: 'Image Monitor',
      status: 'fail',
      message: 'Image monitor not found'
    });
  }

  // Check for default images
  if (await checkFileExists('public/images/default-avatar.svg')) {
    results.push({
      feature: 'Default Avatar',
      status: 'pass',
      message: 'Default avatar exists'
    });
  } else {
    results.push({
      feature: 'Default Avatar',
      status: 'warning',
      message: 'Default avatar not found - fallback may fail'
    });
  }
}

async function testNavigation() {
  console.log('🧭 Testing Navigation Updates...');
  
  try {
    const navContent = await fs.readFile('components/GlassNav.tsx', 'utf-8');
    
    const routes = [
      { path: '/bookings', name: 'Bookings' },
      { path: '/wallet', name: 'Wallet' },
      { path: '/reviews', name: 'Reviews' }
    ];

    for (const route of routes) {
      if (navContent.includes(route.path)) {
        results.push({
          feature: `Navigation - ${route.name}`,
          status: 'pass',
          message: 'Route added to navigation'
        });
      } else {
        results.push({
          feature: `Navigation - ${route.name}`,
          status: 'fail',
          message: 'Route not found in navigation'
        });
      }
    }
  } catch (error) {
    results.push({
      feature: 'Navigation',
      status: 'fail',
      message: 'Could not read navigation file'
    });
  }
}

async function testDependencies() {
  console.log('📦 Testing Dependencies...');
  
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const requiredDeps = [
      '@googlemaps/js-api-loader',
      '@stripe/react-stripe-js',
      '@stripe/stripe-js',
      'framer-motion',
      'date-fns'
    ];

    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        results.push({
          feature: `Dependency - ${dep}`,
          status: 'pass',
          message: `Version: ${packageJson.dependencies[dep]}`
        });
      } else {
        results.push({
          feature: `Dependency - ${dep}`,
          status: 'fail',
          message: 'Not installed'
        });
      }
    }
  } catch (error) {
    results.push({
      feature: 'Dependencies',
      status: 'fail',
      message: 'Could not read package.json'
    });
  }
}

async function runAllTests() {
  console.log('🧪 Running Feature Tests...\n');

  await testVoiceAssistant();
  await testRealtimeTracking();
  await testWallet();
  await testReviews();
  await testImageMonitoring();
  await testNavigation();
  await testDependencies();

  console.log('\n📊 Test Results:\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.feature}: ${result.message}`);
  });

  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`📊 Total: ${results.length}`);

  const successRate = Math.round((passed / results.length) * 100);
  console.log(`\n🎯 Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log('\n❗ Some tests failed. Please check the errors above.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️ All tests passed with warnings.');
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

runAllTests().catch(console.error);