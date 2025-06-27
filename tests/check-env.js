#!/usr/bin/env node

/**
 * Environment Checker for Claude Conduit Tests
 * Verifies all required configuration is in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Claude Conduit Environment Check');
console.log('===================================\n');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Found .env file\n');
} else {
  console.log('❌ No .env file found in project root\n');
}

// Configuration checks
const checks = [
  {
    category: 'Neo4j Database',
    vars: [
      { name: 'NEO4J_URI', required: true, description: 'Neo4j connection URI' },
      { name: 'NEO4J_USERNAME', required: true, description: 'Neo4j username' },
      { name: 'NEO4J_PASSWORD', required: true, description: 'Neo4j password', sensitive: true }
    ]
  },
  {
    category: 'Server Configuration',
    vars: [
      { name: 'CONDUIT_PORT', required: false, description: 'Server port (default: 3001)' },
      { name: 'LOG_LEVEL', required: false, description: 'Logging level' },
      { name: 'NODE_ENV', required: false, description: 'Node environment' }
    ]
  },
  {
    category: 'Claude API (Optional)',
    vars: [
      { name: 'ANTHROPIC_API_KEY', required: false, description: 'Claude API key', sensitive: true }
    ]
  }
];

let hasErrors = false;

// Check each category
checks.forEach(({ category, vars }) => {
  console.log(`📋 ${category}`);
  console.log('-'.repeat(40));
  
  vars.forEach(({ name, required, description, sensitive }) => {
    const value = process.env[name];
    const status = value ? '✅' : (required ? '❌' : '⚪');
    
    if (value) {
      const displayValue = sensitive ? '********' : value;
      console.log(`${status} ${name}: ${displayValue}`);
    } else {
      console.log(`${status} ${name}: Not set${required ? ' (REQUIRED)' : ' (optional)'}`);
      if (required) hasErrors = true;
    }
    console.log(`   ${description}`);
  });
  console.log();
});

// Check Neo4j connectivity
if (process.env.NEO4J_URI && process.env.NEO4J_PASSWORD) {
  console.log('🔗 Testing Neo4j Connection...');
  const neo4j = require('neo4j-driver');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME || 'neo4j', process.env.NEO4J_PASSWORD)
  );
  
  driver.verifyConnectivity()
    .then(() => {
      console.log('✅ Neo4j connection successful!\n');
      driver.close();
      printSummary();
    })
    .catch(err => {
      console.log('❌ Neo4j connection failed:', err.message, '\n');
      hasErrors = true;
      driver.close();
      printSummary();
    });
} else {
  printSummary();
}

function printSummary() {
  console.log('='.repeat(50));
  if (hasErrors) {
    console.log('❌ Environment check failed!');
    console.log('\nTo fix:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Fill in the required values');
    console.log('3. Run this check again');
    process.exit(1);
  } else {
    console.log('✅ Environment is properly configured!');
    console.log('\nYou can now run the tests with:');
    console.log('  npm test');
    console.log('  node tests/run-all-tests.js');
    console.log('  node tests/test-neo4j.js');
    process.exit(0);
  }
}