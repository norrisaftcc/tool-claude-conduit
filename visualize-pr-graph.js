#!/usr/bin/env node

// Visualize PR workflow graph in ASCII
require('dotenv').config();
const neo4j = require('neo4j-driver');

async function visualizePRGraph() {
  console.log('📊 PR Workflow Graph Visualization');
  console.log('==================================\n');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  
  const session = driver.session();
  
  try {
    // Get all relationships
    const result = await session.run(`
      MATCH (a:PRWorkflow)-[r]->(b:PRWorkflow)
      RETURN a.name as from, a.order as fromOrder, 
             type(r) as relType, 
             b.name as to, b.order as toOrder
      ORDER BY a.order, b.order
    `);
    
    console.log('Found', result.records.length, 'relationships:\n');
    
    // Group by source node
    const graph = {};
    result.records.forEach(record => {
      const from = record.get('from');
      const to = record.get('to');
      const relType = record.get('relType');
      
      if (!graph[from]) {
        graph[from] = [];
      }
      graph[from].push({ to, relType });
    });
    
    // Display as tree
    console.log('Graph Structure:');
    console.log('----------------');
    Object.entries(graph).forEach(([from, connections]) => {
      console.log(`\n📌 ${from}`);
      connections.forEach(conn => {
        const arrow = conn.relType.includes('FAIL') || conn.relType.includes('REQUEST') ? '↩️' : '→';
        console.log(`   ${arrow} [${conn.relType}] ${conn.to}`);
      });
    });
    
    // Show the linear path
    console.log('\n\nMain Flow Path:');
    console.log('---------------');
    const path = await session.run(`
      MATCH path = (start:PRWorkflow {order: 1})-[*]->(end:PRWorkflow {order: 7})
      WHERE ALL(r IN relationships(path) WHERE type(r) IN ['LEADS_TO', 'REQUIRES', 'ENABLES', 'TRIGGERS', 'INITIATES', 'APPROVES'])
      RETURN path
      LIMIT 1
    `);
    
    if (path.records.length > 0) {
      const p = path.records[0].get('path');
      const nodes = [];
      
      // Extract all nodes from path
      p.segments.forEach((segment, i) => {
        if (i === 0) {
          nodes.push(segment.start.properties.name);
        }
        nodes.push(segment.end.properties.name);
      });
      
      console.log(nodes.join(' → '));
    }
    
    // Summary statistics
    console.log('\n\nGraph Statistics:');
    console.log('-----------------');
    const stats = await session.run(`
      MATCH (n:PRWorkflow)
      OPTIONAL MATCH (n)-[out]->(m:PRWorkflow)
      OPTIONAL MATCH (o:PRWorkflow)-[in]->(n)
      RETURN n.name as node, 
             count(DISTINCT out) as outgoing, 
             count(DISTINCT in) as incoming,
             collect(DISTINCT type(out)) as outTypes
      ORDER BY n.order
    `);
    
    stats.records.forEach(record => {
      const node = record.get('node');
      const outgoing = record.get('outgoing').toNumber();
      const incoming = record.get('incoming').toNumber();
      const types = record.get('outTypes').filter(t => t !== null);
      
      console.log(`${node}:`);
      console.log(`  → Outgoing: ${outgoing} ${types.length > 0 ? `(${types.join(', ')})` : ''}`);
      console.log(`  ← Incoming: ${incoming}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

visualizePRGraph();