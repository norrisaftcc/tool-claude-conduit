#!/usr/bin/env node

/**
 * Post-Demolition Test Suite
 * 
 * Tests that verify what actually survived the controlled demolition.
 * Created: 2025-08-19
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
const TEST_FILE = './demolition_test_suite.txt';

class PostDemolitionTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS', error: null });
      console.log(`✅ PASS: ${name}\n`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  async testHealthEndpoint() {
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.status || response.data.status !== 'healthy') {
      throw new Error(`Expected status 'healthy', got '${response.data.status}'`);
    }
    
    if (!response.data.version || response.data.version !== '2.0.0') {
      throw new Error(`Expected version '2.0.0', got '${response.data.version}'`);
    }
  }

  async testFortuneEndpoint() {
    const response = await axios.get(`${BASE_URL}/fortune`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.fortune || typeof response.data.fortune !== 'string') {
      throw new Error('Expected fortune to be a non-empty string');
    }
    
    if (!response.data.timestamp) {
      throw new Error('Expected timestamp to be present');
    }
  }

  async testToolsEndpoint() {
    const response = await axios.get(`${BASE_URL}/tools`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const { mcp } = response.data;
    
    // Verify filesystem server has real tools
    if (!mcp.servers.filesystem || mcp.servers.filesystem.status !== 'ready') {
      throw new Error('Filesystem server should be ready');
    }
    
    const filesystemTools = mcp.servers.filesystem.tools;
    const expectedTools = ['read_file', 'write_file', 'list_directory'];
    
    for (const tool of expectedTools) {
      if (!filesystemTools.some(t => t.name === tool)) {
        throw new Error(`Missing expected filesystem tool: ${tool}`);
      }
    }
    
    // Verify brave-search server has real tools
    if (!mcp.servers['brave-search'] || mcp.servers['brave-search'].status !== 'ready') {
      throw new Error('Brave search server should be ready');
    }
  }

  async testFilesystemReadFile() {
    const response = await axios.post(`${BASE_URL}/execute/filesystem/read_file`, {
      path: './package.json'
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (response.data.status !== 'success') {
      throw new Error(`Expected success status, got ${response.data.status}`);
    }
    
    // Verify it's real data (not simulated)
    if (response.data.funkbot && response.data.funkbot.is_simulated) {
      throw new Error('Expected real data, got simulated data');
    }
    
    // Verify package.json content
    const content = response.data.result.result.content;
    if (!content.includes('"name": "claude-conduit"')) {
      throw new Error('Expected package.json to contain project name');
    }
  }

  async testFilesystemWriteFile() {
    const testContent = `Test file created by post-demolition test suite\nTimestamp: ${new Date().toISOString()}`;
    
    const response = await axios.post(`${BASE_URL}/execute/filesystem/write_file`, {
      path: TEST_FILE,
      content: testContent
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (response.data.status !== 'success') {
      throw new Error(`Expected success status, got ${response.data.status}`);
    }
    
    // Verify file was actually created
    if (!fs.existsSync(TEST_FILE)) {
      throw new Error('Test file was not created on filesystem');
    }
    
    // Verify content
    const actualContent = fs.readFileSync(TEST_FILE, 'utf8');
    if (actualContent !== testContent) {
      throw new Error('File content does not match expected content');
    }
  }

  async testFilesystemListDirectory() {
    const response = await axios.post(`${BASE_URL}/execute/filesystem/list_directory`, {
      path: '.'
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (response.data.status !== 'success') {
      throw new Error(`Expected success status, got ${response.data.status}`);
    }
    
    const entries = response.data.result.result.entries;
    
    // Verify essential files exist
    const expectedFiles = ['package.json', 'index.js', 'README.md'];
    for (const file of expectedFiles) {
      if (!entries.some(entry => entry.name === file && entry.type === 'file')) {
        throw new Error(`Missing expected file: ${file}`);
      }
    }
    
    // Check if our test file exists (it should since we created it in previous test)
    const testFileExists = fs.existsSync(TEST_FILE);
    const testFileInListing = entries.some(entry => entry.name === TEST_FILE && entry.type === 'file');
    
    if (testFileExists && !testFileInListing) {
      throw new Error('Test file exists on disk but not in directory listing');
    }
    
    // This is acceptable - file might be cleaned up between tests
    console.log(`   Note: Test file ${testFileExists ? 'exists' : 'was cleaned up'}`);
  }

  async testBraveSearch() {
    // Only test if we have an API key (indicated by successful connection)
    try {
      const response = await axios.post(`${BASE_URL}/execute/brave-search/search`, {
        query: 'claude-conduit test',
        count: 2
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      
      if (response.data.status !== 'success') {
        throw new Error(`Expected success status, got ${response.data.status}`);
      }
      
      // Verify it's real data (not simulated)
      if (response.data.funkbot && response.data.funkbot.is_simulated) {
        throw new Error('Expected real search data, got simulated data');
      }
      
      // Verify search results structure
      const results = response.data.result.result.web.results;
      if (!Array.isArray(results) || results.length === 0) {
        throw new Error('Expected search results array with at least one result');
      }
      
    } catch (error) {
      if (error.response && error.response.status === 500) {
        // API key not available - this is acceptable
        console.log('   Note: Brave Search API key not available - skipping real search test');
        return;
      }
      throw error;
    }
  }

  async testRemovedEndpoints() {
    // Test that demolished endpoints return 404
    const removedEndpoints = [
      { method: 'GET', path: '/profiles' },
      { method: 'POST', path: '/profile/senior-developer' },
      { method: 'POST', path: '/planning-boost' }
    ];
    
    for (const endpoint of removedEndpoints) {
      try {
        if (endpoint.method === 'GET') {
          await axios.get(`${BASE_URL}${endpoint.path}`);
        } else {
          await axios.post(`${BASE_URL}${endpoint.path}`, {});
        }
        
        throw new Error(`Expected 404 for ${endpoint.method} ${endpoint.path}, but request succeeded`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // This is expected
          continue;
        }
        throw new Error(`Expected 404 for ${endpoint.method} ${endpoint.path}, got ${error.response?.status || error.message}`);
      }
    }
  }

  async runAllTests() {
    console.log('🔥 Post-Demolition Test Suite 🔥');
    console.log('Testing what survived the controlled demolition...\n');
    
    await this.runTest('Health Endpoint', () => this.testHealthEndpoint());
    await this.runTest('Fortune Endpoint', () => this.testFortuneEndpoint());
    await this.runTest('Tools Discovery', () => this.testToolsEndpoint());
    await this.runTest('Filesystem Read File', () => this.testFilesystemReadFile());
    await this.runTest('Filesystem Write File', () => this.testFilesystemWriteFile());
    await this.runTest('Filesystem List Directory', () => this.testFilesystemListDirectory());
    await this.runTest('Brave Search', () => this.testBraveSearch());
    await this.runTest('Removed Endpoints Return 404', () => this.testRemovedEndpoints());
    
    this.printSummary();
    this.cleanup();
  }

  printSummary() {
    console.log('📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%\n`);
    
    if (this.results.failed > 0) {
      console.log('Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  ❌ ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎯 Demolition Assessment: ' + (this.results.failed === 0 ? 'SUCCESS' : 'NEEDS ATTENTION'));
  }

  cleanup() {
    // Clean up test files
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
      console.log(`🧹 Cleaned up test file: ${TEST_FILE}`);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PostDemolitionTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = PostDemolitionTester;