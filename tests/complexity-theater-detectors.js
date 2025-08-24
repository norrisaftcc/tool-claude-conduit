/**
 * COMPLEXITY THEATER DETECTION UTILITIES
 * 
 * Specialized detectors for specific anti-patterns that lead to
 * architectural fiction and complexity theater.
 * 
 * Each detector is designed to catch a specific smell before
 * it becomes a systemic problem.
 */

const fs = require('fs');
const path = require('path');

class ComplexityTheaterDetectors {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * DETECTOR 1: Plugin System Overkill
   * 
   * Flags when you build elaborate plugin systems for a small number of plugins.
   * Rule: Plugin system complexity should scale with plugin count.
   */
  detectPluginSystemOverkill() {
    const pluginSystemFiles = this.findPluginSystemFiles();
    const actualPlugins = this.findActualPlugins();
    const pluginSystemComplexity = this.calculatePluginSystemComplexity(pluginSystemFiles);
    
    const overkillRatio = pluginSystemComplexity / Math.max(actualPlugins.length, 1);
    
    return {
      detector: 'Plugin System Overkill',
      severity: overkillRatio > 100 ? 'CRITICAL' : overkillRatio > 50 ? 'HIGH' : 'LOW',
      ratio: overkillRatio,
      evidence: {
        pluginSystemFiles: pluginSystemFiles.length,
        actualPlugins: actualPlugins.length,
        systemComplexity: pluginSystemComplexity,
        examples: actualPlugins.slice(0, 3),
        redFlags: pluginSystemFiles.filter(file => 
          this.hasAbstractClasses(file) || this.hasFactoryPatterns(file)
        )
      },
      recommendation: actualPlugins.length < 5 ? 
        'Consider simple module imports instead of plugin architecture' :
        'Plugin system complexity is justified by plugin count'
    };
  }

  /**
   * DETECTOR 2: Abstract Factory for Nothing
   * 
   * Identifies factory patterns that create abstractions without products.
   */
  detectAbstractFactoryForNothing() {
    const factories = this.findFactoryPatterns();
    const problems = [];
    
    for (const factory of factories) {
      const products = this.findFactoryProducts(factory);
      const abstractionComplexity = this.calculateAbstractionComplexity(factory.file);
      
      if (products.length === 0 && abstractionComplexity > 20) {
        problems.push({
          factory: factory.name,
          file: factory.file,
          complexity: abstractionComplexity,
          products: products.length,
          evidence: 'Factory pattern with no concrete products'
        });
      }
    }
    
    return {
      detector: 'Abstract Factory for Nothing',
      severity: problems.length > 0 ? 'HIGH' : 'LOW',
      problems: problems,
      recommendation: problems.length > 0 ?
        'Remove factory patterns until you have products to create' :
        'Factory patterns appear justified'
    };
  }

  /**
   * DETECTOR 3: Configuration Overkill
   * 
   * Flags when configuration complexity exceeds functional complexity.
   */
  detectConfigurationOverkill() {
    const configFiles = this.findConfigurationFiles();
    const configComplexity = this.calculateConfigurationComplexity(configFiles);
    const functionalComplexity = this.calculateFunctionalComplexity();
    
    const overkillRatio = configComplexity / Math.max(functionalComplexity, 1);
    
    return {
      detector: 'Configuration Overkill',
      severity: overkillRatio > 2 ? 'HIGH' : overkillRatio > 1 ? 'MEDIUM' : 'LOW',
      ratio: overkillRatio,
      evidence: {
        configFiles: configFiles.length,
        configComplexity: configComplexity,
        functionalComplexity: functionalComplexity,
        suspiciousConfigs: configFiles.filter(config => 
          this.isConfigForNonexistentFeature(config)
        )
      },
      recommendation: overkillRatio > 2 ?
        'Configuration is more complex than the functionality it configures' :
        'Configuration complexity appears reasonable'
    };
  }

  /**
   * DETECTOR 4: Documentation Fiction
   * 
   * Identifies when documentation describes impressive capabilities
   * that don't exist in the implementation.
   */
  detectDocumentationFiction() {
    const claims = this.extractCapabilityClaims();
    const implementations = this.verifyClaimImplementations(claims);
    const fictionPercentage = this.calculateFictionPercentage(claims, implementations);
    
    const fictions = claims.filter(claim => !implementations[claim.id]);
    
    return {
      detector: 'Documentation Fiction',
      severity: fictionPercentage > 50 ? 'CRITICAL' : fictionPercentage > 25 ? 'HIGH' : 'LOW',
      fictionPercentage: fictionPercentage,
      evidence: {
        totalClaims: claims.length,
        implementedClaims: Object.keys(implementations).length,
        fictionCount: fictions.length,
        examples: fictions.slice(0, 5),
        commonFictions: this.categorizeDocumentationFictions(fictions)
      },
      recommendation: fictionPercentage > 25 ?
        'Documentation should reflect actual capabilities, not aspirational ones' :
        'Documentation accuracy is acceptable'
    };
  }

  /**
   * DETECTOR 5: FunkBot Protocol Abuse
   * 
   * Detects when simulation/mock protocols become permanent fixtures
   * rather than temporary development aids.
   */
  detectFunkBotProtocolAbuse() {
    const funkBotUsage = this.findFunkBotProtocolUsage();
    const abuseIndicators = this.analyzeFunkBotAbuse(funkBotUsage);
    
    return {
      detector: 'FunkBot Protocol Abuse',
      severity: abuseIndicators.score > 0.7 ? 'CRITICAL' : 
                abuseIndicators.score > 0.4 ? 'HIGH' : 'LOW',
      abuseScore: abuseIndicators.score,
      evidence: {
        totalUsage: funkBotUsage.length,
        permanentLooking: abuseIndicators.permanentLooking,
        productionCode: abuseIndicators.productionCode,
        systematicUsage: abuseIndicators.systematicUsage,
        examples: funkBotUsage.slice(0, 3)
      },
      recommendation: abuseIndicators.score > 0.4 ?
        'FunkBot/simulation markers should be temporary development aids, not permanent features' :
        'FunkBot usage appears temporary and appropriate'
    };
  }

  /**
   * DETECTOR 6: Interface Inflation
   * 
   * Identifies when interfaces/abstractions grow without corresponding
   * concrete implementations.
   */
  detectInterfaceInflation() {
    const interfaces = this.findInterfaceDefinitions();
    const implementations = this.findInterfaceImplementations();
    const inflationProblems = [];
    
    for (const iface of interfaces) {
      const impls = implementations.filter(impl => impl.implements === iface.name);
      const methodCount = this.countInterfaceMethods(iface);
      
      if (impls.length === 0 && methodCount > 3) {
        inflationProblems.push({
          interface: iface.name,
          file: iface.file,
          methods: methodCount,
          implementations: impls.length,
          evidence: 'Interface with no implementations'
        });
      }
    }
    
    return {
      detector: 'Interface Inflation',
      severity: inflationProblems.length > 2 ? 'HIGH' : inflationProblems.length > 0 ? 'MEDIUM' : 'LOW',
      problems: inflationProblems,
      evidence: {
        totalInterfaces: interfaces.length,
        implementedInterfaces: interfaces.length - inflationProblems.length,
        inflatedInterfaces: inflationProblems.length
      },
      recommendation: inflationProblems.length > 0 ?
        'Create interfaces after you have implementations, not before' :
        'Interface usage appears reasonable'
    };
  }

  /**
   * DETECTOR 7: Persona Theater
   * 
   * Specifically detects the "persona system" anti-pattern where
   * elaborate AI personas are created but backed by nothing.
   */
  detectPersonaTheater() {
    const personas = this.findPersonaDefinitions();
    const workingPersonas = this.findWorkingPersonas(personas);
    const theaterIndicators = this.analyzePersonaTheater(personas, workingPersonas);
    
    return {
      detector: 'Persona Theater',
      severity: theaterIndicators.score > 0.8 ? 'CRITICAL' : 
                theaterIndicators.score > 0.5 ? 'HIGH' : 'LOW',
      theaterScore: theaterIndicators.score,
      evidence: {
        totalPersonas: personas.length,
        workingPersonas: workingPersonas.length,
        fakePersonas: personas.length - workingPersonas.length,
        examples: personas.filter(p => !workingPersonas.includes(p)).slice(0, 3),
        commonProblems: theaterIndicators.problems
      },
      recommendation: theaterIndicators.score > 0.5 ?
        'Remove persona definitions until underlying plugins are implemented' :
        'Persona system appears to have real backing'
    };
  }

  // Helper methods for each detector

  findPluginSystemFiles() {
    const files = this.findJSFiles();
    return files.filter(file => 
      file.includes('plugin') && 
      (file.includes('system') || file.includes('manager') || file.includes('loader'))
    );
  }

  findActualPlugins() {
    const pluginDir = path.join(this.projectRoot, 'plugins');
    if (!fs.existsSync(pluginDir)) return [];
    
    try {
      return fs.readdirSync(pluginDir)
        .filter(item => {
          const itemPath = path.join(pluginDir, item);
          return fs.statSync(itemPath).isDirectory() && 
                 fs.existsSync(path.join(itemPath, 'index.js'));
        })
        .map(dir => ({ name: dir, path: path.join(pluginDir, dir) }));
    } catch {
      return [];
    }
  }

  calculatePluginSystemComplexity(files) {
    let complexity = 0;
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        complexity += content.split('\n').length;
        complexity += (content.match(/class|function|interface/g) || []).length * 5;
        complexity += (content.match(/abstract|extends|implements/g) || []).length * 10;
      } catch {
        // Skip unreadable files
      }
    }
    
    return complexity;
  }

  hasAbstractClasses(file) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('abstract') || content.match(/class.*Base|class.*Abstract/);
    } catch {
      return false;
    }
  }

  hasFactoryPatterns(file) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('Factory') || content.match(/create[A-Z]/);
    } catch {
      return false;
    }
  }

  findFactoryPatterns() {
    const files = this.findJSFiles();
    const factories = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for factory patterns
        const factoryMatches = content.match(/class\s+(\w*Factory\w*)|(\w*Factory\w*)\s*=/g);
        if (factoryMatches) {
          factories.push({
            name: factoryMatches[0],
            file: file,
            type: 'class_factory'
          });
        }
        
        const createMatches = content.match(/create[A-Z]\w+/g);
        if (createMatches) {
          factories.push({
            name: createMatches[0],
            file: file,
            type: 'create_method'
          });
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return factories;
  }

  findFactoryProducts(factory) {
    // Look for what the factory actually creates
    try {
      const content = fs.readFileSync(factory.file, 'utf8');
      const products = [];
      
      // Look for new ClassName() patterns
      const newMatches = content.match(/new\s+([A-Z]\w+)/g);
      if (newMatches) {
        products.push(...newMatches.map(match => match.replace('new ', '')));
      }
      
      return [...new Set(products)]; // Remove duplicates
    } catch {
      return [];
    }
  }

  calculateAbstractionComplexity(file) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let complexity = 0;
      
      complexity += (content.match(/abstract|interface|extends|implements/g) || []).length * 3;
      complexity += (content.match(/class|function/g) || []).length;
      complexity += content.split('\n').length * 0.1;
      
      return complexity;
    } catch {
      return 0;
    }
  }

  findConfigurationFiles() {
    const extensions = ['.json', '.yaml', '.yml', '.toml', '.config.js'];
    const files = [];
    
    for (const ext of extensions) {
      files.push(...this.findFilesByExtension(ext));
    }
    
    return files.filter(file => 
      !file.includes('node_modules') && 
      !file.includes('package-lock.json')
    );
  }

  calculateConfigurationComplexity(configFiles) {
    let complexity = 0;
    
    for (const file of configFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        if (file.endsWith('.json')) {
          const json = JSON.parse(content);
          complexity += this.calculateObjectComplexity(json);
        } else {
          complexity += content.split('\n').length;
        }
      } catch {
        // Skip unparseable files
      }
    }
    
    return complexity;
  }

  calculateObjectComplexity(obj, depth = 0) {
    if (depth > 10) return 1; // Prevent infinite recursion
    
    let complexity = 0;
    
    if (Array.isArray(obj)) {
      complexity += obj.length;
      for (const item of obj) {
        if (typeof item === 'object') {
          complexity += this.calculateObjectComplexity(item, depth + 1);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      complexity += Object.keys(obj).length;
      for (const value of Object.values(obj)) {
        if (typeof value === 'object') {
          complexity += this.calculateObjectComplexity(value, depth + 1);
        }
      }
    }
    
    return complexity;
  }

  calculateFunctionalComplexity() {
    const jsFiles = this.findJSFiles();
    let complexity = 0;
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Count actual functional code
        complexity += (content.match(/function|=>/g) || []).length;
        complexity += (content.match(/if|for|while|switch/g) || []).length;
        complexity += (content.match(/app\.(get|post|put|delete)/g) || []).length * 2;
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return complexity;
  }

  isConfigForNonexistentFeature(configFile) {
    try {
      const content = fs.readFileSync(configFile, 'utf8');
      
      // Look for config keys that reference non-existent features
      const suspiciousPatterns = [
        'plugin.*not.*implemented',
        'simulated',
        'mock',
        'fake',
        'todo',
        'placeholder'
      ];
      
      return suspiciousPatterns.some(pattern => 
        content.toLowerCase().includes(pattern)
      );
    } catch {
      return false;
    }
  }

  extractCapabilityClaims() {
    const docs = this.findDocumentationFiles();
    const claims = [];
    
    for (const doc of docs) {
      try {
        const content = fs.readFileSync(doc, 'utf8');
        
        // Extract capability claims from documentation
        const capabilityPatterns = [
          /(?:can|will|enables?|provides?|supports?)\s+([^.!?\n]+)/gi,
          /[-*]\s*([A-Z][^:\n]+)/g,
          /##\s+([^#\n]+)/g,
          /\*\*([^*]+capabilities?[^*]+)\*\*/gi
        ];
        
        let claimId = 0;
        for (const pattern of capabilityPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            claims.push({
              id: `${doc}-${claimId++}`,
              claim: match[1].trim(),
              file: doc,
              type: 'capability'
            });
          }
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return claims;
  }

  verifyClaimImplementations(claims) {
    const implementations = {};
    const jsFiles = this.findJSFiles();
    
    for (const claim of claims) {
      const keywords = this.extractKeywords(claim.claim);
      let hasImplementation = false;
      
      for (const file of jsFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8').toLowerCase();
          
          // Check if any keywords appear in actual implementation
          if (keywords.some(keyword => 
            content.includes(keyword) && 
            !this.isMockImplementation(content, keyword)
          )) {
            hasImplementation = true;
            break;
          }
        } catch {
          // Skip unreadable files
        }
      }
      
      if (hasImplementation) {
        implementations[claim.id] = true;
      }
    }
    
    return implementations;
  }

  extractKeywords(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5); // Take first 5 meaningful words
  }

  isMockImplementation(content, keyword) {
    const mockIndicators = ['mock', 'fake', 'simulated', '🎷🤖', '🐰', 'stub'];
    const keywordContext = this.getContextAroundKeyword(content, keyword, 100);
    
    return mockIndicators.some(indicator => 
      keywordContext.includes(indicator)
    );
  }

  getContextAroundKeyword(content, keyword, contextSize) {
    const index = content.indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - contextSize);
    const end = Math.min(content.length, index + keyword.length + contextSize);
    
    return content.substring(start, end);
  }

  calculateFictionPercentage(claims, implementations) {
    if (claims.length === 0) return 0;
    
    const implementedCount = Object.keys(implementations).length;
    return ((claims.length - implementedCount) / claims.length) * 100;
  }

  categorizeDocumentationFictions(fictions) {
    const categories = {
      'AI/ML capabilities': 0,
      'Plugin systems': 0,
      'Data storage': 0,
      'Advanced features': 0,
      'Other': 0
    };
    
    for (const fiction of fictions) {
      const claim = fiction.claim.toLowerCase();
      
      if (claim.includes('ai') || claim.includes('agent') || claim.includes('intelligent')) {
        categories['AI/ML capabilities']++;
      } else if (claim.includes('plugin') || claim.includes('extension')) {
        categories['Plugin systems']++;
      } else if (claim.includes('storage') || claim.includes('database') || claim.includes('memory')) {
        categories['Data storage']++;
      } else if (claim.includes('advanced') || claim.includes('sophisticated')) {
        categories['Advanced features']++;
      } else {
        categories['Other']++;
      }
    }
    
    return categories;
  }

  findFunkBotProtocolUsage() {
    const files = this.findJSFiles();
    const usage = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('🎷🤖') || content.includes('funkbot') || 
            content.includes('🐰') || content.includes('SIMULATED')) {
          usage.push({
            file: file,
            type: this.identifyFunkBotType(content),
            lineCount: content.split('\n').length,
            markers: this.countFunkBotMarkers(content)
          });
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return usage;
  }

  identifyFunkBotType(content) {
    if (content.includes('🎷🤖')) return 'jazz_robot';
    if (content.includes('🐰')) return 'rabbit_confession';
    if (content.includes('SIMULATED')) return 'simulation_marker';
    if (content.includes('funkbot')) return 'funkbot_protocol';
    return 'unknown';
  }

  countFunkBotMarkers(content) {
    let count = 0;
    count += (content.match(/🎷🤖/g) || []).length;
    count += (content.match(/🐰/g) || []).length;
    count += (content.match(/SIMULATED/g) || []).length;
    count += (content.match(/funkbot/gi) || []).length;
    return count;
  }

  analyzeFunkBotAbuse(usage) {
    let abuseScore = 0;
    let permanentLooking = 0;
    let productionCode = 0;
    let systematicUsage = 0;
    
    for (const use of usage) {
      // Check if it looks permanent (more than 10 lines with markers)
      if (use.lineCount > 10 && use.markers > 5) {
        permanentLooking++;
        abuseScore += 0.3;
      }
      
      // Check if it's in production-looking code
      if (!use.file.includes('test') && !use.file.includes('demo')) {
        productionCode++;
        abuseScore += 0.2;
      }
      
      // Check for systematic usage (multiple files)
      systematicUsage = usage.length;
      if (systematicUsage > 3) {
        abuseScore += 0.1 * systematicUsage;
      }
    }
    
    return {
      score: Math.min(1.0, abuseScore),
      permanentLooking,
      productionCode,
      systematicUsage
    };
  }

  findInterfaceDefinitions() {
    const files = this.findJSFiles();
    const interfaces = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for interface-like patterns in JavaScript
        const interfaceMatches = content.match(/class\s+(\w+Interface|\w+Base)/g);
        if (interfaceMatches) {
          for (const match of interfaceMatches) {
            interfaces.push({
              name: match.replace('class ', ''),
              file: file,
              type: 'class_interface'
            });
          }
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return interfaces;
  }

  findInterfaceImplementations() {
    const files = this.findJSFiles();
    const implementations = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for extends patterns
        const extendsMatches = content.match(/class\s+\w+\s+extends\s+(\w+)/g);
        if (extendsMatches) {
          for (const match of extendsMatches) {
            const parts = match.split(/\s+/);
            implementations.push({
              name: parts[1],
              implements: parts[3],
              file: file
            });
          }
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return implementations;
  }

  countInterfaceMethods(iface) {
    try {
      const content = fs.readFileSync(iface.file, 'utf8');
      
      // Count method definitions in the interface
      const methodMatches = content.match(/^\s*(\w+)\s*\(/gm);
      return methodMatches ? methodMatches.length : 0;
    } catch {
      return 0;
    }
  }

  findPersonaDefinitions() {
    const files = this.findJSFiles();
    const personas = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for persona definitions
        if (content.includes('profiles.set') || content.includes('persona')) {
          const personaMatches = content.match(/profiles\.set\(['"`]([^'"`]+)/g);
          if (personaMatches) {
            for (const match of personaMatches) {
              personas.push({
                name: match.replace(/profiles\.set\(['"`]/, ''),
                file: file,
                type: 'profile_definition'
              });
            }
          }
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return personas;
  }

  findWorkingPersonas(personas) {
    const working = [];
    
    for (const persona of personas) {
      try {
        const content = fs.readFileSync(persona.file, 'utf8');
        
        // Check if persona has real backing (no simulation markers)
        if (!content.includes('SIMULATED') && 
            !content.includes('🐰') && 
            !content.includes('🎷🤖')) {
          working.push(persona);
        }
        
      } catch {
        // Skip unreadable files
      }
    }
    
    return working;
  }

  analyzePersonaTheater(personas, workingPersonas) {
    const problems = [];
    const fakeCount = personas.length - workingPersonas.length;
    
    if (fakeCount > 0) {
      problems.push(`${fakeCount} personas with no real backing`);
    }
    
    if (personas.length > 5 && workingPersonas.length < 2) {
      problems.push('Elaborate persona system with minimal functionality');
    }
    
    const score = personas.length > 0 ? fakeCount / personas.length : 0;
    
    return {
      score,
      problems
    };
  }

  // Utility methods
  findJSFiles() {
    return this.findFilesByExtension('.js')
      .filter(file => !file.includes('node_modules'));
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

  /**
   * Run all detectors and return comprehensive analysis
   */
  detectAll() {
    return {
      pluginSystemOverkill: this.detectPluginSystemOverkill(),
      abstractFactoryForNothing: this.detectAbstractFactoryForNothing(),
      configurationOverkill: this.detectConfigurationOverkill(),
      documentationFiction: this.detectDocumentationFiction(),
      funkBotProtocolAbuse: this.detectFunkBotProtocolAbuse(),
      interfaceInflation: this.detectInterfaceInflation(),
      personaTheater: this.detectPersonaTheater()
    };
  }
}

module.exports = ComplexityTheaterDetectors;