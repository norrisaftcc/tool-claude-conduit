#!/usr/bin/env node

/**
 * COMPETENCE TEST SUITE
 * 
 * Automated detection of when codebases drift from competence into complexity theater.
 * Designed to catch architectural fiction before it becomes a 290,000-line disaster.
 * 
 * This suite fails HARD when:
 * - Abstraction-to-implementation ratio exceeds thresholds
 * - Lines-of-code to functionality ratio is unhealthy
 * - Mock responses aren't clearly marked as temporary
 * - "Phantom features" exist (documented but not implemented)
 * - Complexity theater indicators are detected
 * 
 * Based on forensic analysis of tool-claude-conduit catastrophe.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CompetenceTestSuite {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      metrics: {}
    };
    this.thresholds = {
      // Critical failure thresholds
      abstractionToImplementationRatio: 0.3, // Max 30% abstractions without implementations
      locToFunctionalityRatio: 500,          // Max 500 LOC per working feature
      mockResponsePercentage: 20,            // Max 20% mock responses
      phantomFeaturePercentage: 10,          // Max 10% phantom features
      complexityTheaterScore: 0.4,           // Max 40% complexity theater indicators
      
      // Warning thresholds (50% of critical)
      warningMultiplier: 0.5
    };
  }

  async run() {
    console.log('🔍 COMPETENCE TEST SUITE - Detecting Complexity Theater');
    console.log('━'.repeat(60));
    
    try {
      // Core competence tests
      await this.testAbstractionToImplementationRatio();
      await this.testLinesOfCodeToFunctionalityRatio();
      await this.testMockResponseDetection();
      await this.testPhantomFeatureDetection();
      await this.testComplexityTheaterIndicators();
      
      // Generate final report
      this.generateReport();
      
      // Exit with appropriate code
      const hasFailures = this.results.failed.length > 0;
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Competence test suite crashed:', error.message);
      process.exit(1);
    }
  }

  /**
   * TEST 1: Abstraction-to-Implementation Ratio
   * 
   * Detects when you have too many interfaces, abstract classes, 
   * and factory patterns without concrete implementations.
   */
  async testAbstractionToImplementationRatio() {
    console.log('\n📊 Testing Abstraction-to-Implementation Ratio...');
    
    const abstractions = this.findAbstractions();
    const implementations = this.findImplementations();
    
    const ratio = abstractions.length / Math.max(implementations.length, 1);
    this.results.metrics.abstractionToImplementationRatio = ratio;
    
    const testName = 'Abstraction-to-Implementation Ratio';
    const threshold = this.thresholds.abstractionToImplementationRatio;
    
    if (ratio > threshold) {
      this.results.failed.push({
        test: testName,
        value: ratio,
        threshold: threshold,
        message: `${(ratio * 100).toFixed(1)}% abstractions vs implementations. Too much architecture astronauting!`,
        details: {
          abstractions: abstractions.length,
          implementations: implementations.length,
          abstractionFiles: abstractions.slice(0, 5), // Show first 5
          evidenceOfProblems: [
            'Plugin system with no plugins',
            'Factory pattern for non-existent products',
            'Interface definitions without implementations'
          ]
        }
      });
    } else if (ratio > threshold * this.thresholds.warningMultiplier) {
      this.results.warnings.push({
        test: testName,
        value: ratio,
        message: `Moderate abstraction levels detected. Monitor for architecture creep.`
      });
    } else {
      this.results.passed.push({
        test: testName,
        value: ratio,
        message: 'Healthy abstraction-to-implementation balance.'
      });
    }
  }

  /**
   * TEST 2: Lines-of-Code to Functionality Ratio
   * 
   * Measures how much code exists per actual working feature.
   * High ratios indicate complexity theater.
   */
  async testLinesOfCodeToFunctionalityRatio() {
    console.log('\n📏 Testing Lines-of-Code to Functionality Ratio...');
    
    const totalLoc = this.countLinesOfCode();
    const workingFeatures = this.countWorkingFeatures();
    
    const ratio = totalLoc / Math.max(workingFeatures, 1);
    this.results.metrics.locToFunctionalityRatio = ratio;
    
    const testName = 'LOC-to-Functionality Ratio';
    const threshold = this.thresholds.locToFunctionalityRatio;
    
    if (ratio > threshold) {
      this.results.failed.push({
        test: testName,
        value: ratio,
        threshold: threshold,
        message: `${ratio.toFixed(0)} lines of code per working feature. Massive complexity theater detected!`,
        details: {
          totalLoc: totalLoc,
          workingFeatures: workingFeatures,
          evidenceOfBloat: [
            'Elaborate plugin systems for 3 plugins',
            'Complex persona profiles that do nothing',
            'Multi-layer abstractions serving no purpose'
          ]
        }
      });
    } else if (ratio > threshold * this.thresholds.warningMultiplier) {
      this.results.warnings.push({
        test: testName,
        value: ratio,
        message: `Moderate code-to-feature ratio. Watch for feature bloat.`
      });
    } else {
      this.results.passed.push({
        test: testName,
        value: ratio,
        message: 'Healthy code-to-functionality ratio.'
      });
    }
  }

  /**
   * TEST 3: Mock Response Detection
   * 
   * Flags mock responses that aren't clearly marked as temporary,
   * especially those that have been in the codebase for extended periods.
   */
  async testMockResponseDetection() {
    console.log('\n🎭 Testing Mock Response Detection...');
    
    const mockResponses = this.findMockResponses();
    const totalEndpoints = this.countTotalEndpoints();
    
    const percentage = (mockResponses.length / Math.max(totalEndpoints, 1)) * 100;
    this.results.metrics.mockResponsePercentage = percentage;
    
    const testName = 'Mock Response Detection';
    const threshold = this.thresholds.mockResponsePercentage;
    
    if (percentage > threshold) {
      this.results.failed.push({
        test: testName,
        value: percentage,
        threshold: threshold,
        message: `${percentage.toFixed(1)}% of endpoints return mock data. This is demo-ware, not software!`,
        details: {
          mockEndpoints: mockResponses.length,
          totalEndpoints: totalEndpoints,
          suspiciousMocks: mockResponses.filter(mock => 
            mock.hasEmojiAdmission || mock.hasFunkBotProtocol || mock.isPermanentLooking
          ).slice(0, 5),
          redFlags: [
            'FunkBot Protocol admissions (🎷🤖)',
            'Rabbit emoji confessions (🐰)',
            'SIMULATED markers in production code'
          ]
        }
      });
    } else if (percentage > threshold * this.thresholds.warningMultiplier) {
      this.results.warnings.push({
        test: testName,
        value: percentage,
        message: `Some mock responses detected. Ensure they're temporary.`
      });
    } else {
      this.results.passed.push({
        test: testName,
        value: percentage,
        message: 'Mock responses within acceptable limits.'
      });
    }
  }

  /**
   * TEST 4: Phantom Feature Detection
   * 
   * Identifies features that are documented, referenced, or promised
   * but don't actually exist in the implementation.
   */
  async testPhantomFeatureDetection() {
    console.log('\n👻 Testing Phantom Feature Detection...');
    
    const documentedFeatures = this.findDocumentedFeatures();
    const implementedFeatures = this.findImplementedFeatures();
    const phantomFeatures = this.findPhantomFeatures(documentedFeatures, implementedFeatures);
    
    const percentage = (phantomFeatures.length / Math.max(documentedFeatures.length, 1)) * 100;
    this.results.metrics.phantomFeaturePercentage = percentage;
    
    const testName = 'Phantom Feature Detection';
    const threshold = this.thresholds.phantomFeaturePercentage;
    
    if (percentage > threshold) {
      this.results.failed.push({
        test: testName,
        value: percentage,
        threshold: threshold,
        message: `${percentage.toFixed(1)}% of documented features don't exist. Ghost feature epidemic!`,
        details: {
          documentedFeatures: documentedFeatures.length,
          implementedFeatures: implementedFeatures.length,
          phantomFeatures: phantomFeatures.length,
          examples: phantomFeatures.slice(0, 5),
          commonPatterns: [
            'Persona profiles referencing non-existent plugins',
            'API endpoints that return hardcoded responses',
            'Configuration for systems that aren\'t implemented'
          ]
        }
      });
    } else if (percentage > threshold * this.thresholds.warningMultiplier) {
      this.results.warnings.push({
        test: testName,
        value: percentage,
        message: `Some phantom features detected. Verify documentation accuracy.`
      });
    } else {
      this.results.passed.push({
        test: testName,
        value: percentage,
        message: 'Documentation matches implementation well.'
      });
    }
  }

  /**
   * TEST 5: Complexity Theater Indicators
   * 
   * Composite score based on multiple indicators of complexity theater:
   * - Overly complex directory structures
   * - Too many configuration files
   * - Abstract classes with no concrete implementations
   * - Documentation that sounds impressive but describes nothing
   */
  async testComplexityTheaterIndicators() {
    console.log('\n🎭 Testing Complexity Theater Indicators...');
    
    const indicators = this.calculateComplexityTheaterScore();
    const score = indicators.totalScore;
    
    this.results.metrics.complexityTheaterScore = score;
    
    const testName = 'Complexity Theater Indicators';
    const threshold = this.thresholds.complexityTheaterScore;
    
    if (score > threshold) {
      this.results.failed.push({
        test: testName,
        value: score,
        threshold: threshold,
        message: `${(score * 100).toFixed(1)}% complexity theater score. This is architectural fiction!`,
        details: {
          indicators: indicators.details,
          worstOffenders: indicators.worstOffenders,
          redFlags: [
            'Plugin system for 3 plugins',
            '10 personas pointing to nothing',
            'FunkBot Protocol admitting simulation',
            'Complex abstractions serving no purpose'
          ]
        }
      });
    } else if (score > threshold * this.thresholds.warningMultiplier) {
      this.results.warnings.push({
        test: testName,
        value: score,
        message: `Moderate complexity theater indicators. Monitor architecture decisions.`
      });
    } else {
      this.results.passed.push({
        test: testName,
        value: score,
        message: 'Architecture serves actual functionality.'
      });
    }
  }

  // Helper methods for finding abstractions
  findAbstractions() {
    const abstractions = [];
    
    // Look for abstract patterns in code
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Abstract class patterns
        if (content.includes('class') && content.includes('extends')) {
          abstractions.push({ file, type: 'abstract_class', evidence: 'extends pattern' });
        }
        
        // Interface patterns
        if (content.includes('interface') || content.match(/class.*Interface/)) {
          abstractions.push({ file, type: 'interface', evidence: 'interface pattern' });
        }
        
        // Factory patterns
        if (content.includes('Factory') || content.match(/create[A-Z]/)) {
          abstractions.push({ file, type: 'factory', evidence: 'factory pattern' });
        }
        
        // Plugin system abstractions
        if (content.includes('plugin') && content.includes('abstract')) {
          abstractions.push({ file, type: 'plugin_abstract', evidence: 'plugin abstraction' });
        }
        
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return abstractions;
  }

  findImplementations() {
    const implementations = [];
    
    // Look for concrete implementations
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Skip test files and node_modules
        if (file.includes('test') || file.includes('node_modules')) continue;
        
        // Look for actual working code (methods that do real work)
        const hasRealImplementation = 
          content.includes('fs.') ||          // File operations
          content.includes('http') ||         // HTTP operations
          content.includes('require(') ||     // Module imports
          content.includes('async') ||        // Async operations
          content.includes('await') ||        // Await operations
          content.includes('return') && !content.includes('return {'); // Real returns, not mock objects
        
        if (hasRealImplementation && !this.isMockFile(content)) {
          implementations.push({ file, type: 'concrete_implementation' });
        }
        
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return implementations;
  }

  findMockResponses() {
    const mocks = [];
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // FunkBot Protocol markers
        if (content.includes('🎷🤖') || content.includes('funkbot')) {
          mocks.push({
            file,
            type: 'funkbot_protocol',
            hasFunkBotProtocol: true,
            evidence: 'FunkBot Protocol markers found'
          });
        }
        
        // Simulation admissions
        if (content.includes('🐰') || content.includes('SIMULATED')) {
          mocks.push({
            file,
            type: 'simulation_admission',
            hasEmojiAdmission: true,
            evidence: 'Simulation emoji or SIMULATED text found'
          });
        }
        
        // Hardcoded mock data
        if (content.match(/return\s*\{\s*mock|return\s*\[\s*\{.*mock/)) {
          mocks.push({
            file,
            type: 'hardcoded_mock',
            isPermanentLooking: true,
            evidence: 'Hardcoded mock return statements'
          });
        }
        
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return mocks;
  }

  findDocumentedFeatures() {
    const features = [];
    const docFiles = this.findDocumentationFiles();
    
    for (const file of docFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for feature lists, bullet points, capabilities
        const featurePatterns = [
          /[-*]\s+([A-Z][^:\n]+)/g,           // Bullet points
          /##\s+([^#\n]+)/g,                   // H2 headers
          /###\s+([^#\n]+)/g,                  // H3 headers
          /\*\*([^*]+)\*\*/g,                  // Bold text (often features)
        ];
        
        for (const pattern of featurePatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            features.push({
              feature: match[1].trim(),
              file: file,
              type: 'documented'
            });
          }
        }
        
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return features;
  }

  findImplementedFeatures() {
    const features = [];
    
    // Look for actual working endpoints and functionality
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Express routes that actually do work
        const routeMatches = content.match(/app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)/g);
        if (routeMatches) {
          for (const route of routeMatches) {
            // Check if route has real implementation (not just mock)
            if (!this.isMockRoute(content, route)) {
              features.push({
                feature: route,
                file: file,
                type: 'implemented_endpoint'
              });
            }
          }
        }
        
        // Plugin implementations
        if (file.includes('plugins/') && !this.isMockFile(content)) {
          features.push({
            feature: path.basename(path.dirname(file)),
            file: file,
            type: 'implemented_plugin'
          });
        }
        
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return features;
  }

  findPhantomFeatures(documented, implemented) {
    const implementedNames = new Set(
      implemented.map(f => f.feature.toLowerCase().replace(/[^a-z]/g, ''))
    );
    
    return documented.filter(doc => {
      const normalizedDoc = doc.feature.toLowerCase().replace(/[^a-z]/g, '');
      return !implementedNames.has(normalizedDoc) && normalizedDoc.length > 3;
    });
  }

  calculateComplexityTheaterScore() {
    const indicators = {
      directoryComplexity: this.calculateDirectoryComplexity(),
      configurationOverhead: this.calculateConfigurationOverhead(),
      abstractionOverhead: this.calculateAbstractionOverhead(),
      documentationFiction: this.calculateDocumentationFiction(),
      fakeFeatureMarkers: this.calculateFakeFeatureMarkers()
    };
    
    // Weight the indicators
    const weights = {
      directoryComplexity: 0.1,
      configurationOverhead: 0.15,
      abstractionOverhead: 0.25,
      documentationFiction: 0.25,
      fakeFeatureMarkers: 0.25
    };
    
    const totalScore = Object.keys(indicators).reduce((sum, key) => {
      return sum + (indicators[key] * weights[key]);
    }, 0);
    
    return {
      totalScore,
      details: indicators,
      worstOffenders: Object.entries(indicators)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, score]) => ({ name, score }))
    };
  }

  calculateDirectoryComplexity() {
    // Score based on unnecessary directory nesting and empty directories
    const dirs = this.findDirectories();
    const emptyDirs = dirs.filter(dir => this.isEmptyDirectory(dir));
    const deepNesting = dirs.filter(dir => dir.split(path.sep).length > 4);
    
    return Math.min(1.0, (emptyDirs.length + deepNesting.length) / Math.max(dirs.length, 1));
  }

  calculateConfigurationOverhead() {
    // Score based on config files vs actual functionality
    const configFiles = this.findConfigFiles();
    const workingFeatures = this.countWorkingFeatures();
    
    return Math.min(1.0, configFiles.length / Math.max(workingFeatures, 1) / 2);
  }

  calculateAbstractionOverhead() {
    // Already calculated in abstraction-to-implementation ratio
    return Math.min(1.0, this.results.metrics.abstractionToImplementationRatio || 0);
  }

  calculateDocumentationFiction() {
    // Score based on phantom features percentage
    return Math.min(1.0, (this.results.metrics.phantomFeaturePercentage || 0) / 100);
  }

  calculateFakeFeatureMarkers() {
    // Score based on FunkBot protocol usage and simulation markers
    const jsFiles = this.findJSFiles();
    let fakeMarkers = 0;
    let totalFiles = 0;
    
    for (const file of jsFiles) {
      if (file.includes('node_modules') || file.includes('test')) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        totalFiles++;
        
        if (content.includes('🎷🤖') || content.includes('🐰') || 
            content.includes('SIMULATED') || content.includes('funkbot')) {
          fakeMarkers++;
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return totalFiles > 0 ? fakeMarkers / totalFiles : 0;
  }

  // Utility methods
  findJSFiles() {
    return this.findFilesByExtension('.js').filter(file => 
      !file.includes('node_modules')
    );
  }

  findDocumentationFiles() {
    return [
      ...this.findFilesByExtension('.md'),
      ...this.findFilesByExtension('.txt')
    ].filter(file => !file.includes('node_modules'));
  }

  findFilesByExtension(ext, dir = this.projectRoot) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.findFilesByExtension(ext, fullPath));
        } else if (stat.isFile() && fullPath.endsWith(ext)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  findDirectories(dir = this.projectRoot) {
    const dirs = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          dirs.push(fullPath);
          dirs.push(...this.findDirectories(fullPath));
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return dirs;
  }

  findConfigFiles() {
    const configExtensions = ['.json', '.yaml', '.yml', '.toml', '.config.js'];
    const configFiles = [];
    
    for (const ext of configExtensions) {
      configFiles.push(...this.findFilesByExtension(ext));
    }
    
    return configFiles.filter(file => 
      !file.includes('node_modules') && 
      !file.includes('package-lock.json')
    );
  }

  countLinesOfCode() {
    let totalLines = 0;
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        totalLines += content.split('\n').length;
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return totalLines;
  }

  countWorkingFeatures() {
    // Count actual working functionality
    const implementations = this.findImplementations();
    const workingEndpoints = this.findImplementedFeatures()
      .filter(f => f.type === 'implemented_endpoint').length;
    const workingPlugins = this.findImplementedFeatures()
      .filter(f => f.type === 'implemented_plugin').length;
    
    return Math.max(1, workingEndpoints + workingPlugins);
  }

  countTotalEndpoints() {
    let endpoints = 0;
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const routeMatches = content.match(/app\.(get|post|put|delete)/g);
        if (routeMatches) {
          endpoints += routeMatches.length;
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    return Math.max(1, endpoints);
  }

  isMockFile(content) {
    return content.includes('mock') || 
           content.includes('fake') || 
           content.includes('stub') ||
           content.includes('🎷🤖') ||
           content.includes('🐰') ||
           content.includes('SIMULATED');
  }

  isMockRoute(content, route) {
    // Check if the route implementation contains mock indicators
    const routeIndex = content.indexOf(route);
    if (routeIndex === -1) return false;
    
    // Look at the next 500 characters after the route definition
    const routeImplementation = content.substring(routeIndex, routeIndex + 500);
    
    return this.isMockFile(routeImplementation);
  }

  isEmptyDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      return items.length === 0;
    } catch (error) {
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '━'.repeat(60));
    console.log('🔍 COMPETENCE TEST SUITE RESULTS');
    console.log('━'.repeat(60));
    
    // Summary metrics
    console.log('\n📊 METRICS SUMMARY:');
    for (const [metric, value] of Object.entries(this.results.metrics)) {
      const threshold = this.thresholds[metric];
      const status = value > threshold ? '❌ FAIL' : 
                    value > threshold * this.thresholds.warningMultiplier ? '⚠️  WARN' : '✅ PASS';
      
      if (typeof value === 'number') {
        const displayValue = value < 1 ? `${(value * 100).toFixed(1)}%` : value.toFixed(0);
        console.log(`  ${status} ${metric}: ${displayValue}`);
      }
    }
    
    // Failed tests
    if (this.results.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.failed.forEach(failure => {
        console.log(`\n  💥 ${failure.test}`);
        console.log(`     Value: ${typeof failure.value === 'number' ? failure.value.toFixed(2) : failure.value}`);
        console.log(`     Threshold: ${failure.threshold}`);
        console.log(`     ${failure.message}`);
        
        if (failure.details) {
          console.log(`     Evidence:`);
          Object.entries(failure.details).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              console.log(`       ${key}: ${value.length} items`);
            } else if (typeof value === 'number') {
              console.log(`       ${key}: ${value}`);
            }
          });
        }
      });
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => {
        console.log(`  ${warning.test}: ${warning.message}`);
      });
    }
    
    // Passed tests
    if (this.results.passed.length > 0) {
      console.log('\n✅ PASSED TESTS:');
      this.results.passed.forEach(pass => {
        console.log(`  ${pass.test}: ${pass.message}`);
      });
    }
    
    // Final verdict
    console.log('\n' + '━'.repeat(60));
    if (this.results.failed.length > 0) {
      console.log('🚨 COMPETENCE TEST SUITE: FAILED');
      console.log('   Complexity theater detected! This codebase has drifted');
      console.log('   from competence into architectural fiction.');
      console.log('   Immediate remediation required.');
    } else if (this.results.warnings.length > 0) {
      console.log('⚠️  COMPETENCE TEST SUITE: PASSED WITH WARNINGS');
      console.log('   Monitor for early signs of complexity theater.');
    } else {
      console.log('✅ COMPETENCE TEST SUITE: PASSED');
      console.log('   Codebase maintains healthy competence levels.');
    }
    console.log('━'.repeat(60));
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  const suite = new CompetenceTestSuite();
  suite.run().catch(error => {
    console.error('Test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = CompetenceTestSuite;