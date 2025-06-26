#!/usr/bin/env node

// Demo: PR Workflow Knowledge Graph
// Shows a focused use case with clear nodes and relationships

require('dotenv').config();
const neo4j = require('neo4j-driver');

async function createPRWorkflowGraph() {
  console.log('🔄 Creating Pull Request Workflow Knowledge Graph');
  console.log('================================================\n');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  
  const session = driver.session();
  
  try {
    // Clear existing demo data
    console.log('1. Clearing previous demo data...');
    await session.run(`
      MATCH (n:PRWorkflow) DETACH DELETE n
    `);
    console.log('✅ Clean slate ready\n');
    
    // Create workflow nodes
    console.log('2. Creating PR workflow nodes...');
    
    const nodes = [
      { id: 'pr_1', name: 'Create Feature Branch', description: 'Branch from main/master for new feature', order: 1 },
      { id: 'pr_2', name: 'Write Code', description: 'Implement feature with tests', order: 2 },
      { id: 'pr_3', name: 'Run Tests Locally', description: 'Ensure all tests pass before pushing', order: 3 },
      { id: 'pr_4', name: 'Push to GitHub', description: 'Push branch to remote repository', order: 4 },
      { id: 'pr_5', name: 'Create Pull Request', description: 'Open PR with description and reviewers', order: 5 },
      { id: 'pr_6', name: 'Code Review', description: 'Team reviews and provides feedback', order: 6 },
      { id: 'pr_7', name: 'Merge to Main', description: 'Squash and merge after approval', order: 7 }
    ];
    
    // Create all nodes
    for (const node of nodes) {
      await session.run(`
        CREATE (n:PRWorkflow {
          id: $id,
          name: $name,
          description: $description,
          order: $order,
          createdAt: datetime()
        })
      `, node);
      console.log(`   ✅ ${node.order}. ${node.name}`);
    }
    console.log('');
    
    // Create relationships
    console.log('3. Creating workflow relationships...');
    
    const relationships = [
      { from: 'pr_1', to: 'pr_2', type: 'LEADS_TO', note: 'Start coding after branch creation' },
      { from: 'pr_2', to: 'pr_3', type: 'REQUIRES', note: 'Code must be tested' },
      { from: 'pr_3', to: 'pr_4', type: 'ENABLES', note: 'Only push tested code' },
      { from: 'pr_4', to: 'pr_5', type: 'TRIGGERS', note: 'Branch must exist remotely' },
      { from: 'pr_5', to: 'pr_6', type: 'INITIATES', note: 'PR starts review process' },
      { from: 'pr_6', to: 'pr_7', type: 'APPROVES', note: 'Review approval allows merge' },
      // Alternative paths
      { from: 'pr_6', to: 'pr_2', type: 'REQUESTS_CHANGES', note: 'Review may require code changes' },
      { from: 'pr_3', to: 'pr_2', type: 'FAILS_BACK_TO', note: 'Test failures require fixes' }
    ];
    
    for (const rel of relationships) {
      await session.run(`
        MATCH (from:PRWorkflow {id: $from})
        MATCH (to:PRWorkflow {id: $to})
        CREATE (from)-[:${rel.type} {note: $note}]->(to)
      `, { from: rel.from, to: rel.to, note: rel.note });
      
      const fromNode = nodes.find(n => n.id === rel.from);
      const toNode = nodes.find(n => n.id === rel.to);
      console.log(`   ✅ ${fromNode.name} --[${rel.type}]--> ${toNode.name}`);
    }
    console.log('');
    
    // Query and visualize the workflow
    console.log('4. Querying workflow paths...\n');
    
    // Find the happy path
    console.log('📍 Happy Path (no review changes):');
    const happyPath = await session.run(`
      MATCH path = (start:PRWorkflow {id: 'pr_1'})-[:LEADS_TO|REQUIRES|ENABLES|TRIGGERS|INITIATES|APPROVES*]->(end:PRWorkflow {id: 'pr_7'})
      RETURN path
      LIMIT 1
    `);
    
    if (happyPath.records.length > 0) {
      const path = happyPath.records[0].get('path');
      path.segments.forEach((segment, i) => {
        const node = segment.start.properties;
        console.log(`   ${i + 1}. ${node.name}`);
        if (i < path.segments.length - 1) {
          console.log(`      ↓ ${segment.relationship.type}`);
        }
      });
      // Add the final node
      const lastSegment = path.segments[path.segments.length - 1];
      console.log(`   ${path.segments.length + 1}. ${lastSegment.end.properties.name}`);
    }
    console.log('');
    
    // Find nodes that can loop back
    console.log('🔄 Feedback Loops:');
    const loops = await session.run(`
      MATCH (n:PRWorkflow)-[r:REQUESTS_CHANGES|FAILS_BACK_TO]->(target:PRWorkflow)
      RETURN n.name as from, type(r) as relationship, target.name as to
    `);
    
    loops.records.forEach(record => {
      console.log(`   ${record.get('from')} --[${record.get('relationship')}]--> ${record.get('to')}`);
    });
    console.log('');
    
    // Generate visualization
    console.log('5. Workflow Visualization:\n');
    console.log('```mermaid');
    console.log('graph TD');
    
    // Add nodes with styling
    nodes.forEach(node => {
      const style = node.order === 1 ? ':::start' : node.order === 7 ? ':::end' : '';
      console.log(`    ${node.id}["${node.order}. ${node.name}<br/><i>${node.description}</i>"]${style}`);
    });
    console.log('');
    
    // Add relationships
    relationships.forEach(rel => {
      const style = rel.type === 'REQUESTS_CHANGES' || rel.type === 'FAILS_BACK_TO' ? '-.->|' : '-->|';
      console.log(`    ${rel.from} ${style}${rel.type}| ${rel.to}`);
    });
    
    // Add styling
    console.log('');
    console.log('    classDef start fill:#90EE90,stroke:#333,stroke-width:3px;');
    console.log('    classDef end fill:#87CEEB,stroke:#333,stroke-width:3px;');
    console.log('```\n');
    
    // Insights from the graph
    console.log('💡 Insights from the Knowledge Graph:');
    
    // Count relationships per node
    const insights = await session.run(`
      MATCH (n:PRWorkflow)
      OPTIONAL MATCH (n)-[out]->()
      OPTIONAL MATCH ()-[in]->(n)
      RETURN n.name as name, count(DISTINCT out) as outgoing, count(DISTINCT in) as incoming
      ORDER BY n.order
    `);
    
    console.log('\n   Node Connectivity:');
    insights.records.forEach(record => {
      const name = record.get('name');
      const outgoing = record.get('outgoing').toNumber();
      const incoming = record.get('incoming').toNumber();
      console.log(`   - ${name}: ${incoming} in, ${outgoing} out`);
    });
    
    console.log('\n✅ PR Workflow Knowledge Graph created successfully!');
    console.log('   This focused demo shows how knowledge graphs can model processes');
    console.log('   with clear relationships, alternative paths, and feedback loops.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

createPRWorkflowGraph();