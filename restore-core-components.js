#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Restoring Core Components\n');

// Essential components needed by most pages
const coreComponents = [
  'components/ServiceCard.tsx',
  'components/Footer.tsx',
  'components/GlassNav.tsx',
  'components/MobileNav.tsx',
  'components/ErrorBoundary.tsx',
  'components/LazyImage.tsx',
  'components/ServiceImage.tsx',
  'components/AuthPromptModal.tsx',
  'components/RecaptchaProvider.tsx'
];

// Essential lib files
const coreLibs = [
  'lib/firebase.ts',
  'lib/firebase-api.ts',
  'lib/utils.ts',
  'lib/services.ts',
  'lib/comprehensive-services-catalog.ts',
  'lib/service-images.ts',
  'contexts/AuthContext.tsx',
  'hooks/useAuth.ts'
];

// Essential styles
const coreStyles = [
  'app.full-backup/globals.css'
];

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Restored ${path.basename(dest)}`);
    return true;
  } else {
    console.log(`⚠️  Source not found: ${src}`);
    return false;
  }
}

// Copy core components from backups if they exist
console.log('📦 Restoring Core Components:');
console.log('=' .repeat(40));

// Check various backup locations
const backupDirs = [
  'cleanup-backup-2025-06-30T00-54-30-229Z',
  'nuclear-backup-2025-06-30T01-03-04-212Z'
];

for (const component of coreComponents) {
  let restored = false;
  
  // First check if it already exists
  if (fs.existsSync(component)) {
    console.log(`✓ Already exists: ${component}`);
    continue;
  }
  
  // Try emergency backup
  const emergencyBackup = component + '.emergency-backup';
  if (fs.existsSync(emergencyBackup)) {
    copyFile(emergencyBackup, component);
    restored = true;
  }
  
  // Try other backup directories
  if (!restored) {
    for (const backupDir of backupDirs) {
      const backupPath = path.join(backupDir, path.basename(component));
      if (fs.existsSync(backupPath)) {
        copyFile(backupPath, component);
        restored = true;
        break;
      }
    }
  }
}

// Restore core libs (these should mostly exist)
console.log('\n📚 Checking Core Libraries:');
console.log('=' .repeat(40));

for (const lib of coreLibs) {
  if (fs.existsSync(lib)) {
    console.log(`✓ Already exists: ${lib}`);
  } else {
    console.log(`❌ Missing: ${lib} - needs restoration`);
  }
}

// Restore globals.css
console.log('\n🎨 Restoring Styles:');
console.log('=' .repeat(40));

if (fs.existsSync('app.full-backup/globals.css')) {
  copyFile('app.full-backup/globals.css', 'app/globals.css');
}

// Update the main layout to import globals.css
console.log('\n📝 Updating Layout:');
const layoutContent = `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;

fs.writeFileSync('app/layout.tsx', layoutContent);
console.log('✅ Updated layout with globals.css import');

console.log('\n✅ Core components restoration complete!');
console.log('Run gradual-restore.js next to restore pages.');