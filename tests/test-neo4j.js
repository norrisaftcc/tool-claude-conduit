#!/usr/bin/env node

// Test Neo4j Knowledge Graph Plugin
require('dotenv').config();

const KnowledgeGraphPlugin = require('../plugins/knowledge-graph');

async function testNeo4jConnection() {
  console.log('🧪 Testing Neo4j Knowledge Graph Plugin');
  console.log('=====================================\n');
  
  try {
    // Initialize plugin
    console.log('1. Initializing plugin...');
    const plugin = new KnowledgeGraphPlugin();
    await plugin.init();
    console.log('✅ Plugin initialized successfully\n');
    
    // Test health check
    console.log('2. Testing health check...');
    const health = await plugin.healthCheck();
    console.log('✅ Health check result:', JSON.stringify(health, null, 2));
    console.log('');
    
    // Store some test knowledge
    console.log('3. Storing test knowledge...');
    const testKnowledge = {
      content: 'Claude Code is an AI-powered development tool that helps with software engineering tasks',
      type: 'concept',
      metadata: { source: 'test', category: 'ai-tools' },
      tags: ['ai', 'development', 'tools', 'claude']
    };
    
    const stored = await plugin.storeKnowledge(testKnowledge);
    console.log('✅ Knowledge stored:', {
      id: stored.id,
      type: stored.type,
      contentLength: stored.content.length
    });
    console.log('');
    
    // Query the knowledge
    console.log('4. Querying knowledge...');
    const queryResult = await plugin.queryKnowledge({
      query: 'Claude',
      limit: 5
    });
    console.log('✅ Query results:', queryResult.length, 'items found');
    queryResult.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.id}: ${item.content.substring(0, 50)}...`);
    });
    console.log('');
    
    // Test semantic search
    console.log('5. Testing semantic search...');
    const semanticResults = await plugin.semanticSearch({
      query: 'AI development tools',
      limit: 3
    });
    console.log('✅ Semantic search:', semanticResults.length, 'results');
    console.log('');
    
    // Test agentic RAG
    console.log('6. Testing agentic RAG...');
    const ragResult = await plugin.agenticRag({
      question: 'What is Claude Code and how does it help developers?',
      context: 'User is asking about AI development tools',
      maxRetrievals: 3
    });
    console.log('✅ Agentic RAG response:', {
      responseLength: ragResult.response.length,
      sources: ragResult.sources.length,
      confidence: ragResult.confidence
    });
    console.log('Response preview:', ragResult.response.substring(0, 100) + '...');
    console.log('');
    
    // Cleanup
    console.log('7. Cleaning up...');
    await plugin.cleanup();
    console.log('✅ Cleanup completed\n');
    
    console.log('🎉 All tests passed! Neo4j integration is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testNeo4jConnection();