const fs = require('fs');
const path = require('path');

class ConfigValidator {
  constructor() {
    this.requiredEnvVars = [
      'ANTHROPIC_API_KEY'
    ];
    
    this.optionalEnvVars = [
      'CONDUIT_PORT',
      'LOG_LEVEL',
      'NODE_ENV',
      'MCP_CONFIG_PATH',
      'CLOUD_MEMORY_URL',
      'CLOUD_MEMORY_API_KEY',
      'SESSION_SECRET',
      'JWT_SECRET'
    ];
  }

  validateEnvironment() {
    const missing = [];
    const warnings = [];

    // Check required variables
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    // Check for insecure patterns
    for (const envVar of [...this.requiredEnvVars, ...this.optionalEnvVars]) {
      const value = process.env[envVar];
      if (value) {
        if (this.containsInsecurePattern(value)) {
          warnings.push(`${envVar} may contain insecure patterns`);
        }
      }
    }

    // Check .env file exists
    if (!fs.existsSync('.env') && process.env.NODE_ENV !== 'production') {
      warnings.push('No .env file found. Copy .env.example to .env and configure your secrets');
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings,
      securityChecks: this.performSecurityChecks()
    };
  }

  containsInsecurePattern(value) {
    const insecurePatterns = [
      /password/i,
      /example/i,
      /test/i,
      /localhost/i,
      /changeme/i,
      /your-.*-here/i
    ];

    return insecurePatterns.some(pattern => pattern.test(value));
  }

  performSecurityChecks() {
    const checks = {
      envFileInGitignore: this.checkGitignore(),
      noSecretsInCode: this.scanForHardcodedSecrets(),
      httpsUrls: this.checkHttpsUrls()
    };

    return checks;
  }

  checkGitignore() {
    try {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      return gitignore.includes('.env');
    } catch (error) {
      return false;
    }
  }

  scanForHardcodedSecrets() {
    // Basic scan for obvious hardcoded secrets in main files
    const filesToCheck = ['index.js', 'lib/plugin-system.js'];
    const secretPatterns = [
      /sk-ant-api/,
      /ghp_[a-zA-Z0-9]{36}/,
      /xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}/
    ];

    for (const file of filesToCheck) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            return false;
          }
        }
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    return true;
  }

  checkHttpsUrls() {
    const urls = [
      process.env.CLOUD_MEMORY_URL
    ].filter(Boolean);

    return urls.every(url => url.startsWith('https://'));
  }

  logValidationResults(results) {
    if (!results.valid) {
      console.error('❌ Configuration validation failed!');
      console.error('Missing required environment variables:');
      results.missing.forEach(envVar => {
        console.error(`  - ${envVar}`);
      });
      console.error('\nPlease check your .env file or environment configuration.');
    }

    if (results.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      results.warnings.forEach(warning => {
        console.warn(`  - ${warning}`);
      });
    }

    // Security checks
    const security = results.securityChecks;
    if (!security.envFileInGitignore) {
      console.error('🔒 SECURITY: .env file not in .gitignore!');
    }
    if (!security.noSecretsInCode) {
      console.error('🔒 SECURITY: Possible hardcoded secrets detected!');
    }
    if (!security.httpsUrls) {
      console.warn('🔒 SECURITY: Some URLs are not using HTTPS');
    }

    if (results.valid && results.warnings.length === 0) {
      console.log('✅ Configuration validation passed');
    }

    return results.valid;
  }
}

module.exports = ConfigValidator;