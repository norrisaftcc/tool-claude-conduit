#!/usr/bin/env node

// Check what's actually in the Neo4j database
require('dotenv').config();
const neo4j = require('neo4j-driver');

async function checkConnections() {
  console.log('🔍 Checking Neo4j Graph Connections');
  console.log('===================================\n');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  
  const session = driver.session();
  
  try {
    // 1. Count all nodes by label
    console.log('1. Node counts by label:');
    const labels = await session.run(`
      MATCH (n)
      RETURN DISTINCT labels(n) as labels, count(n) as count
    `);
    
    labels.records.forEach(record => {
      console.log(`   ${record.get('labels').join(', ')}: ${record.get('count').toNumber()} nodes`);
    });
    console.log('');
    
    // 2. Count all relationships
    console.log('2. Total relationships in database:');
    const relCount = await session.run(`
      MATCH ()-[r]->()
      RETURN count(r) as count, collect(DISTINCT type(r)) as types
    `);
    
    if (relCount.records.length > 0) {
      const count = relCount.records[0].get('count').toNumber();
      const types = relCount.records[0].get('types');
      console.log(`   Total relationships: ${count}`);
      console.log(`   Relationship types: ${types.join(', ') || 'none'}`);
    }
    console.log('');
    
    // 3. Show sample nodes
    console.log('3. Sample nodes:');
    const nodes = await session.run(`
      MATCH (n)
      RETURN n
      LIMIT 5
    `);
    
    nodes.records.forEach((record, i) => {
      const node = record.get('n');
      console.log(`   Node ${i + 1}:`, node.properties);
    });
    console.log('');
    
    // 4. Show all relationships with their nodes
    console.log('4. All relationships with connected nodes:');
    const rels = await session.run(`
      MATCH (a)-[r]->(b)
      RETURN a.name as from, type(r) as type, b.name as to
      LIMIT 20
    `);
    
    if (rels.records.length === 0) {
      console.log('   ❌ No relationships found!');
      
      // Let's debug why
      console.log('\n5. Debugging - Let\'s try creating a simple relationship:');
      
      // Create two test nodes
      await session.run(`
        CREATE (a:TestNode {name: 'Node A'})
        CREATE (b:TestNode {name: 'Node B'})
        CREATE (a)-[:TEST_RELATIONSHIP {created: datetime()}]->(b)
      `);
      console.log('   ✅ Created test nodes and relationship');
      
      // Check if we can query it
      const testRel = await session.run(`
        MATCH (a:TestNode)-[r:TEST_RELATIONSHIP]->(b:TestNode)
        RETURN a.name as from, type(r) as type, b.name as to
      `);
      
      if (testRel.records.length > 0) {
        console.log('   ✅ Test relationship query works:');
        const rec = testRel.records[0];
        console.log(`      ${rec.get('from')} --[${rec.get('type')}]--> ${rec.get('to')}`);
      }
      
    } else {
      console.log(`   Found ${rels.records.length} relationships:`);
      rels.records.forEach(record => {
        console.log(`   ${record.get('from')} --[${record.get('type')}]--> ${record.get('to')}`);
      });
    }
    
    // 6. Try a different query approach for PRWorkflow
    console.log('\n6. Checking PRWorkflow specifically:');
    const prNodes = await session.run(`
      MATCH (n:PRWorkflow)
      RETURN count(n) as count
    `);
    
    if (prNodes.records.length > 0) {
      const count = prNodes.records[0].get('count').toNumber();
      console.log(`   PRWorkflow nodes: ${count}`);
      
      // Check relationships between PRWorkflow nodes
      const prRels = await session.run(`
        MATCH (a:PRWorkflow)-[r]->(b:PRWorkflow)
        RETURN count(r) as count
      `);
      
      if (prRels.records.length > 0) {
        const relCount = prRels.records[0].get('count').toNumber();
        console.log(`   PRWorkflow relationships: ${relCount}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

checkConnections();