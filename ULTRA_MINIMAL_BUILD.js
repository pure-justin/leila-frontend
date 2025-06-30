#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 ULTRA MINIMAL BUILD - Remove EVERYTHING except basics!\n');

// Backup current app directory
if (fs.existsSync('app') && !fs.existsSync('app.full-backup')) {
  fs.renameSync('app', 'app.full-backup');
  console.log('✅ Backed up app directory to app.full-backup');
}

// Create ultra minimal app structure
fs.mkdirSync('app', { recursive: true });

// Minimal layout
fs.writeFileSync('app/layout.tsx', `
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
`);

// Minimal page
fs.writeFileSync('app/page.tsx', `
export default function Home() {
  return (
    <main>
      <h1>Leila - Build Test</h1>
      <p>If you see this, the build worked!</p>
    </main>
  )
}
`);

// Minimal globals.css
fs.writeFileSync('app/globals.css', `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
`);

console.log('✅ Created ultra minimal app structure');
console.log('\n🚀 Now try: npm run build');