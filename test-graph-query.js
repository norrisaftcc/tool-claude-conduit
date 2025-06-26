#!/usr/bin/env node

// Test advanced Neo4j queries to see the graph structure
require('dotenv').config();
const neo4j = require('neo4j-driver');

async function exploreGraph() {
  console.log('🔍 Exploring Knowledge Graph Structure');
  console.log('=====================================\n');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  
  const session = driver.session();
  
  try {
    // 1. Count nodes and relationships
    console.log('1. Graph Statistics:');
    const stats = await session.run(`
      MATCH (n:Knowledge) 
      WITH count(n) as nodeCount
      MATCH ()-[r]->()
      RETURN nodeCount, count(r) as relationshipCount
    `);
    
    if (stats.records.length > 0) {
      const record = stats.records[0];
      console.log(`   Nodes: ${record.get('nodeCount')}`);
      console.log(`   Relationships: ${record.get('relationshipCount')}`);
    }
    console.log('');
    
    // 2. Show all nodes with their types
    console.log('2. All Knowledge Nodes:');
    const nodes = await session.run(`
      MATCH (n:Knowledge)
      RETURN n.id as id, n.content as content, n.type as type, n.tags as tags
      ORDER BY n.createdAt DESC
      LIMIT 20
    `);
    
    nodes.records.forEach(record => {
      const content = record.get('content');
      const type = record.get('type');
      const tags = record.get('tags');
      console.log(`   [${type}] ${content.substring(0, 50)}...`);
      if (tags && tags.length > 0) {
        console.log(`      Tags: ${tags.join(', ')}`);
      }
    });
    console.log('');
    
    // 3. Show relationships
    console.log('3. Graph Relationships:');
    const relationships = await session.run(`
      MATCH (from:Knowledge)-[r]->(to:Knowledge)
      RETURN from.content as fromContent, type(r) as relType, to.content as toContent
      LIMIT 20
    `);
    
    if (relationships.records.length === 0) {
      console.log('   No relationships found. Checking why...');
      
      // Debug: Check if relationships exist at all
      const anyRels = await session.run(`
        MATCH ()-[r]->()
        RETURN count(r) as count, collect(DISTINCT type(r)) as types
      `);
      
      if (anyRels.records.length > 0) {
        const count = anyRels.records[0].get('count').toNumber();
        const types = anyRels.records[0].get('types');
        console.log(`   Found ${count} relationships of types: ${types.join(', ')}`);
      }
    } else {
      relationships.records.forEach(record => {
        const from = record.get('fromContent').substring(0, 30);
        const relType = record.get('relType');
        const to = record.get('toContent').substring(0, 30);
        console.log(`   ${from}... --[${relType}]--> ${to}...`);
      });
    }
    console.log('');
    
    // 4. Find nodes by tags
    console.log('4. Finding nodes by tags:');
    const taggedNodes = await session.run(`
      MATCH (n:Knowledge)
      WHERE 'good_first_issue' IN n.tags
      RETURN n.content as content
    `);
    
    console.log('   Good first issues:');
    taggedNodes.records.forEach(record => {
      console.log(`   - ${record.get('content')}`);
    });
    console.log('');
    
    // 5. Graph traversal example
    console.log('5. Dependency Analysis (What depends on agent capability mapping?):');
    const dependencies = await session.run(`
      MATCH (start:Knowledge {content: 'Create agent capability mapping system'})-[*]->(dependent:Knowledge)
      RETURN DISTINCT dependent.content as content
      LIMIT 10
    `);
    
    if (dependencies.records.length > 0) {
      dependencies.records.forEach(record => {
        console.log(`   - ${record.get('content')}`);
      });
    } else {
      console.log('   No dependencies found via traversal.');
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

exploreGraph();