#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface SecurityIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

async function auditSecurity() {
  console.log('🔒 Starting security audit...\n');
  
  const issues: SecurityIssue[] = [];
  
  // Check for hardcoded API keys
  console.log('1. Checking for hardcoded API keys...');
  const apiKeyPatterns = [
    /sk_live_[a-zA-Z0-9]{24,}/g,
    /pk_live_[a-zA-Z0-9]{24,}/g,
    /AIza[a-zA-Z0-9_-]{35}/g,
    /[0-9a-f]{32}/g, // Generic 32-char hex (potential API key)
    /Bearer\s+[a-zA-Z0-9_-]{20,}/g,
  ];
  
  const sourceFiles = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', '.next/**', 'scripts/**', 'dist/**'],
  });
  
  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      apiKeyPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('process.env') && !line.includes('serverConfig') && !line.includes('clientConfig')) {
          issues.push({
            file,
            line: index + 1,
            issue: 'Potential hardcoded API key detected',
            severity: 'high',
            recommendation: 'Move to environment variables and use secure config',
          });
        }
      });
    });
  }
  
  // Check for exposed environment variables
  console.log('2. Checking for exposed environment variables...');
  const serverOnlyVars = [
    'STRIPE_SECRET_KEY',
    'GEMINI_API_KEY',
    'OPENAI_API_KEY',
    'SENDGRID_API_KEY',
    'TWILIO_AUTH_TOKEN',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_URL',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
  ];
  
  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      serverOnlyVars.forEach(envVar => {
        if (line.includes(`process.env.${envVar}`) && file.includes('app/') && !file.includes('api/')) {
          issues.push({
            file,
            line: index + 1,
            issue: `Server-only environment variable "${envVar}" used in client code`,
            severity: 'high',
            recommendation: 'Use serverConfig from secure-config.ts instead',
          });
        }
      });
    });
  }
  
  // Check for missing NEXT_PUBLIC prefix
  console.log('3. Checking for client environment variables...');
  for (const file of sourceFiles) {
    if (!file.includes('app/api/') && !file.includes('lib/config/')) {
      const content = readFileSync(file, 'utf-8');
      const envMatches = content.match(/process\.env\.([A-Z_]+)/g);
      
      if (envMatches) {
        envMatches.forEach(match => {
          const varName = match.replace('process.env.', '');
          if (!varName.startsWith('NEXT_PUBLIC_') && !serverOnlyVars.includes(varName)) {
            const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
            issues.push({
              file,
              line: lineNum,
              issue: `Client environment variable "${varName}" missing NEXT_PUBLIC_ prefix`,
              severity: 'medium',
              recommendation: 'Add NEXT_PUBLIC_ prefix or use clientConfig',
            });
          }
        });
      }
    }
  }
  
  // Check for insecure API endpoints
  console.log('4. Checking API endpoint security...');
  const apiFiles = await glob('app/api/**/route.{ts,js}');
  
  for (const file of apiFiles) {
    const content = readFileSync(file, 'utf-8');
    
    // Check if using secure handler
    if (!content.includes('secureApiHandler') && !file.includes('webhooks')) {
      issues.push({
        file,
        line: 1,
        issue: 'API route not using secure handler',
        severity: 'medium',
        recommendation: 'Use secureApiHandler from @/lib/api/secure-handler',
      });
    }
    
    // Check for missing authentication
    if (content.includes('requireAuth: false') && 
        (file.includes('payment') || file.includes('booking') || file.includes('user'))) {
      issues.push({
        file,
        line: 1,
        issue: 'Sensitive API route without authentication',
        severity: 'high',
        recommendation: 'Set requireAuth: true for sensitive endpoints',
      });
    }
  }
  
  // Check middleware configuration
  console.log('5. Checking middleware security...');
  const middlewarePath = 'middleware.ts';
  try {
    const middlewareContent = readFileSync(middlewarePath, 'utf-8');
    
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Content-Security-Policy',
      'Strict-Transport-Security',
    ];
    
    requiredHeaders.forEach(header => {
      if (!middlewareContent.includes(header)) {
        issues.push({
          file: middlewarePath,
          line: 1,
          issue: `Missing security header: ${header}`,
          severity: 'medium',
          recommendation: 'Add security header to middleware',
        });
      }
    });
  } catch (error) {
    issues.push({
      file: 'middleware.ts',
      line: 1,
      issue: 'No middleware.ts file found',
      severity: 'high',
      recommendation: 'Create middleware.ts with security headers',
    });
  }
  
  // Generate report
  console.log('\n📊 Security Audit Report\n');
  console.log(`Total issues found: ${issues.length}\n`);
  
  const highSeverity = issues.filter(i => i.severity === 'high');
  const mediumSeverity = issues.filter(i => i.severity === 'medium');
  const lowSeverity = issues.filter(i => i.severity === 'low');
  
  console.log(`🔴 High severity: ${highSeverity.length}`);
  console.log(`🟡 Medium severity: ${mediumSeverity.length}`);
  console.log(`🟢 Low severity: ${lowSeverity.length}\n`);
  
  // Display issues by severity
  if (highSeverity.length > 0) {
    console.log('🔴 HIGH SEVERITY ISSUES:\n');
    highSeverity.forEach(issue => {
      console.log(`File: ${issue.file}:${issue.line}`);
      console.log(`Issue: ${issue.issue}`);
      console.log(`Recommendation: ${issue.recommendation}\n`);
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log('🟡 MEDIUM SEVERITY ISSUES:\n');
    mediumSeverity.forEach(issue => {
      console.log(`File: ${issue.file}:${issue.line}`);
      console.log(`Issue: ${issue.issue}`);
      console.log(`Recommendation: ${issue.recommendation}\n`);
    });
  }
  
  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: issues.length,
      high: highSeverity.length,
      medium: mediumSeverity.length,
      low: lowSeverity.length,
    },
    issues: issues,
  };
  
  writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Detailed report saved to security-audit-report.json');
  
  // Exit with error if high severity issues found
  if (highSeverity.length > 0) {
    console.log('\n❌ Security audit failed with high severity issues!');
    process.exit(1);
  }
  
  console.log('\n✅ Security audit completed!');
}

// Run the audit
auditSecurity().catch(console.error);