#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Testing single API route\n');

// Create minimal API directory
fs.mkdirSync('app/api/test', { recursive: true });

// Create a simple test route
const testRoute = `
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
`;

fs.writeFileSync('app/api/test/route.ts', testRoute);

// Test build
try {
  console.log('Testing with simple test route...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Simple API route works!');
  
  // Now try geocode route
  console.log('\nTrying geocode route...');
  fs.cpSync('app.full-backup/api/geocode', 'app/api/geocode', { recursive: true });
  
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Geocode route works!');
  
} catch (error) {
  console.log('\n❌ Build failed with error');
  
  // Check what's in the route
  if (fs.existsSync('app/api/geocode/route.ts')) {
    const content = fs.readFileSync('app/api/geocode/route.ts', 'utf8');
    console.log('\nFirst 20 lines of geocode route:');
    console.log(content.split('\n').slice(0, 20).join('\n'));
  }
}

// Clean up
if (fs.existsSync('app/api')) {
  fs.rmSync('app/api', { recursive: true, force: true });
}