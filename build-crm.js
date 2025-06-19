const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building CRM for Firebase Hosting...');

// Create a temporary next.config.js for CRM
const crmConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out-crm',
  basePath: '',
  images: {
    domains: ['heyleila.com', 'crm.heyleila.com', 'api.heyleila.com', 'storage.googleapis.com', 'firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/((?!crm).*)',
        destination: '/crm/$1',
      },
    ];
  },
}

module.exports = nextConfig`;

// Backup original config
const originalConfig = fs.readFileSync('next.config.js', 'utf8');
fs.writeFileSync('next.config.backup.js', originalConfig);

// Write CRM config
fs.writeFileSync('next.config.js', crmConfig);

try {
  // Build the CRM
  console.log('Building Next.js app for CRM...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy the CRM dashboard as the main index
  const fs = require('fs');
  const path = require('path');
  
  // Copy crm/dashboard.html to index.html
  if (fs.existsSync('out-crm/crm/dashboard.html')) {
    const dashboardHtml = fs.readFileSync('out-crm/crm/dashboard.html', 'utf8');
    fs.writeFileSync('out-crm/index.html', dashboardHtml);
    console.log('✅ Set CRM dashboard as homepage');
  } else {
    // Fallback simple redirect
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Leila CRM</title>
  <script>window.location.href = '/crm/dashboard.html';</script>
</head>
<body>
  <p>Loading CRM...</p>
</body>
</html>`;
    fs.writeFileSync('out-crm/index.html', indexHtml);
  }
  
  console.log('CRM build completed successfully!');
  console.log('Output directory: out-crm');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore original config
  fs.writeFileSync('next.config.js', originalConfig);
  fs.unlinkSync('next.config.backup.js');
}