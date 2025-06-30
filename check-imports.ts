#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 IMPORT CHECKER STARTING...\n');

interface ImportMap {
  [key: string]: string[];
}

class ImportAnalyzer {
  private importMap: ImportMap = {};
  private visited = new Set<string>();
  private processing = new Set<string>();

  async analyzeProject() {
    console.log('📊 Building import map...');
    
    // Scan all TypeScript/React files
    await this.scanDirectory('./app');
    await this.scanDirectory('./components');
    await this.scanDirectory('./lib');
    
    console.log(`✅ Scanned ${Object.keys(this.importMap).length} files`);
    
    this.detectCircularDependencies();
    this.analyzeImportPatterns();
    this.checkForMissingFiles();
  }

  private async scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.isTargetFile(file.name)) {
        this.analyzeFile(fullPath);
      }
    }
  }

  private isTargetFile(filename: string): boolean {
    return /\.(ts|tsx|js|jsx)$/.test(filename) && !filename.endsWith('.d.ts');
  }

  private analyzeFile(filePath: string) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = this.extractImports(content, filePath);
      this.importMap[filePath] = imports;
      
      console.log(`📁 ${filePath}: ${imports.length} imports`);
      
      // Log problematic imports
      const problematic = imports.filter(imp => 
        imp.includes('service-images-local') ||
        imp.includes('service-images-expanded') ||
        imp.includes('service-images-optimized') ||
        imp.includes('professional-service-images')
      );
      
      if (problematic.length > 0) {
        console.log(`❌ PROBLEMATIC IMPORTS in ${filePath}:`);
        problematic.forEach(imp => console.log(`   - ${imp}`));
      }
      
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  }

  private extractImports(content: string, filePath: string): string[] {
    const imports: string[] = [];
    
    // Match various import patterns
    const patterns = [
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        
        if (this.isLocalImport(importPath)) {
          const resolvedPath = this.resolveImportPath(importPath, filePath);
          if (resolvedPath) {
            imports.push(resolvedPath);
          }
        }
      }
    }
    
    return imports;
  }

  private isLocalImport(importPath: string): boolean {
    return importPath.startsWith('./') || 
           importPath.startsWith('../') || 
           importPath.startsWith('@/');
  }

  private resolveImportPath(importPath: string, fromFile: string): string | null {
    let resolvedPath: string;
    
    if (importPath.startsWith('@/')) {
      // Handle alias imports
      resolvedPath = path.resolve(process.cwd(), importPath.replace('@/', './'));
    } else {
      // Handle relative imports
      resolvedPath = path.resolve(path.dirname(fromFile), importPath);
    }
    
    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    console.warn(`⚠️  Could not resolve import: ${importPath} from ${fromFile}`);
    return null;
  }

  private detectCircularDependencies() {
    console.log('\n🔄 CHECKING FOR CIRCULAR DEPENDENCIES...');
    
    const cycles: string[][] = [];
    
    const dfs = (file: string, path: string[] = []): boolean => {
      if (this.processing.has(file)) {
        const cycleStart = path.indexOf(file);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart).concat([file]);
          cycles.push(cycle);
          return true;
        }
      }
      
      if (this.visited.has(file)) return false;
      
      this.visited.add(file);
      this.processing.add(file);
      
      const imports = this.importMap[file] || [];
      for (const importPath of imports) {
        if (dfs(importPath, [...path, file])) {
          return true;
        }
      }
      
      this.processing.delete(file);
      return false;
    };
    
    for (const file of Object.keys(this.importMap)) {
      if (!this.visited.has(file)) {
        dfs(file);
      }
    }
    
    if (cycles.length > 0) {
      console.log(`🚨 FOUND ${cycles.length} CIRCULAR DEPENDENCIES:`);
      cycles.forEach((cycle, index) => {
        console.log(`\n${index + 1}. Cycle:`);
        cycle.forEach((file, i) => {
          const shortPath = file.replace(process.cwd(), '.');
          console.log(`   ${i === 0 ? '→' : ' '} ${shortPath}`);
        });
      });
    } else {
      console.log('✅ No circular dependencies found');
    }
  }

  private analyzeImportPatterns() {
    console.log('\n📈 IMPORT PATTERN ANALYSIS...');
    
    const importCount: { [key: string]: number } = {};
    const fileCount: { [key: string]: number } = {};
    
    Object.values(this.importMap).forEach(imports => {
      imports.forEach(importPath => {
        const shortPath = importPath.replace(process.cwd(), '.');
        importCount[shortPath] = (importCount[shortPath] || 0) + 1;
        
        const dir = path.dirname(shortPath);
        fileCount[dir] = (fileCount[dir] || 0) + 1;
      });
    });
    
    console.log('\n📊 Most imported files:');
    Object.entries(importCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([file, count]) => {
        console.log(`   ${count}x ${file}`);
      });
    
    console.log('\n📁 Most active directories:');
    Object.entries(fileCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([dir, count]) => {
        console.log(`   ${count} imports from ${dir}`);
      });
  }

  private checkForMissingFiles() {
    console.log('\n🔍 CHECKING FOR MISSING FILES...');
    
    let missingCount = 0;
    
    Object.entries(this.importMap).forEach(([file, imports]) => {
      imports.forEach(importPath => {
        if (!fs.existsSync(importPath)) {
          console.log(`❌ Missing: ${importPath} (imported by ${file.replace(process.cwd(), '.')})`);
          missingCount++;
        }
      });
    });
    
    if (missingCount === 0) {
      console.log('✅ All imports resolve to existing files');
    } else {
      console.log(`❌ Found ${missingCount} missing files`);
    }
  }
}

// Run the analyzer
const analyzer = new ImportAnalyzer();
analyzer.analyzeProject().catch(console.error);