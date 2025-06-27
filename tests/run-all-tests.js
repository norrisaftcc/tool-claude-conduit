#!/usr/bin/env node

/**
 * Test Runner for Claude Conduit
 * Runs all test suites and provides a summary
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Claude Conduit Test Suite');
console.log('============================\n');

const tests = [
  {
    name: 'Neo4j Knowledge Graph',
    file: 'test-neo4j.js',
    description: 'Tests Neo4j database connectivity and operations'
  },
  {
    name: 'Graph Query Operations',
    file: 'test-graph-query.js',
    description: 'Tests knowledge graph query functionality'
  },
  {
    name: 'Issue Graph Integration',
    file: 'test-issue-graph.js',
    description: 'Tests GitHub issue to knowledge graph conversion'
  },
  {
    name: 'Real MCP Integration',
    file: 'test-real-mcp.js',
    description: 'Tests Model Context Protocol server integration'
  }
];

let passed = 0;
let failed = 0;

async function runTest(test) {
  console.log(`📝 Running: ${test.name}`);
  console.log(`   ${test.description}`);
  console.log('   ' + '-'.repeat(50));
  
  return new Promise((resolve) => {
    const testPath = path.join(__dirname, test.file);
    const proc = spawn('node', [testPath], {
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`   ✅ ${test.name} passed!\n`);
        passed++;
      } else {
        console.log(`   ❌ ${test.name} failed with code ${code}\n`);
        failed++;
      }
      resolve(code);
    });
  });
}

async function runAllTests() {
  console.log(`Found ${tests.length} test suites to run.\n`);
  
  for (const test of tests) {
    await runTest(test);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total:  ${tests.length}`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Check for required environment variables
function checkEnvironment() {
  const required = ['NEO4J_URI', 'NEO4J_USERNAME', 'NEO4J_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file or set these variables.');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check environment before running tests
checkEnvironment();

// Run all tests
runAllTests().catch(console.error);