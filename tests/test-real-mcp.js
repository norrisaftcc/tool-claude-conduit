#!/usr/bin/env node

// Test real MCP server connection
const axios = require('axios');

const CONDUIT_URL = 'http://localhost:3001';

async function testRealMCP() {
  console.log('🧪 Testing Real MCP Server Connection');
  console.log('=====================================\n');
  
  try {
    // 1. Check server health
    console.log('1. Checking claude-conduit health...');
    const health = await axios.get(`${CONDUIT_URL}/health`);
    console.log('✅ Server is healthy:', health.data);
    console.log('');
    
    // 2. List available tools
    console.log('2. Listing available MCP tools...');
    const tools = await axios.get(`${CONDUIT_URL}/tools`);
    console.log('✅ Available MCP servers:', Object.keys(tools.data));
    
    // Show filesystem tools
    if (tools.data.filesystem) {
      console.log('\nFilesystem tools:');
      tools.data.filesystem.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }
    console.log('');
    
    // 3. Test filesystem read_file
    console.log('3. Testing filesystem read_file...');
    const readResult = await axios.post(`${CONDUIT_URL}/execute/filesystem/read_file`, {
      path: './package.json'
    });
    
    const content = readResult.data.result.text;
    const lines = content.split('\n').slice(0, 5).join('\n');
    console.log('✅ Successfully read package.json:');
    console.log(lines + '\n...\n');
    
    // 4. Test filesystem list_directory
    console.log('4. Testing filesystem list_directory...');
    const listResult = await axios.post(`${CONDUIT_URL}/execute/filesystem/list_directory`, {
      path: './plugins'
    });
    
    console.log('✅ Contents of ./plugins directory:');
    listResult.data.result.entries.forEach(entry => {
      const type = entry.type === 'directory' ? '📁' : '📄';
      console.log(`   ${type} ${entry.name}`);
    });
    console.log('');
    
    // 5. Test filesystem get_file_info
    console.log('5. Testing filesystem get_file_info...');
    const infoResult = await axios.post(`${CONDUIT_URL}/execute/filesystem/get_file_info`, {
      path: './index.js'
    });
    
    const info = infoResult.data.result;
    console.log('✅ File info for index.js:');
    console.log(`   Size: ${info.size} bytes`);
    console.log(`   Modified: ${new Date(info.modified).toLocaleString()}`);
    console.log(`   Created: ${new Date(info.created).toLocaleString()}`);
    console.log(`   Permissions: ${info.permissions}`);
    console.log('');
    
    // 6. Test brave-search if available
    if (tools.data['brave-search']) {
      console.log('6. Testing brave-search...');
      try {
        const searchResult = await axios.post(`${CONDUIT_URL}/execute/brave-search/search`, {
          query: 'Neo4j Node.js driver documentation'
        });
        
        console.log('✅ Search results:');
        const results = searchResult.data.result.results.slice(0, 3);
        results.forEach((result, i) => {
          console.log(`   ${i + 1}. ${result.title}`);
          console.log(`      ${result.url}`);
        });
      } catch (error) {
        console.log('⚠️  Brave search requires API key configuration');
      }
      console.log('');
    }
    
    console.log('🎉 Real MCP server integration is working!');
    console.log('   - Filesystem server: ✅');
    console.log('   - Tools discovery: ✅');
    console.log('   - Tool execution: ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.error('\nMake sure claude-conduit is running: npm start');
    process.exit(1);
  }
}

// Check if axios is installed
try {
  require('axios');
} catch (e) {
  console.log('Installing axios for HTTP requests...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
}

testRealMCP();