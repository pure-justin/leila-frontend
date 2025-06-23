#!/usr/bin/env node

/**
 * Quick asset generation script for development
 * Usage: npm run generate-asset "house cleaning" serviceCard
 */

import { execSync } from 'child_process';
import * as path from 'path';

const [subject, assetType] = process.argv.slice(2);

if (!subject) {
  console.error('❌ Please provide a subject (e.g., "house cleaning")');
  console.log('\nUsage: npm run generate-asset "subject" [assetType]');
  console.log('\nAsset types: serviceCard, serviceHero, serviceThumbnail, categoryBanner, icon, illustration, pattern, texture');
  process.exit(1);
}

const command = assetType
  ? `npx ts-node scripts/ai-graphic-designer.ts generate -s "${subject}" -t ${assetType} -o ../../shared-assets/images/ai-generated`
  : `npx ts-node scripts/ai-graphic-designer.ts interactive -o ../../shared-assets/images/ai-generated`;

console.log(`🎨 Generating asset for "${subject}"${assetType ? ` (${assetType})` : ''}...`);

try {
  execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (error) {
  console.error('❌ Failed to generate asset');
  process.exit(1);
}