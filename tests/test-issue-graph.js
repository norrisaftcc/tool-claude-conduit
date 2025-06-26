#!/usr/bin/env node

// Test storing GitHub issues in Neo4j Knowledge Graph
require('dotenv').config();

const KnowledgeGraphPlugin = require('./plugins/knowledge-graph');

// GitHub issues data structure
const issues = [
  // Core Infrastructure
  { id: 'issue_9', number: 9, title: 'Clean up and prioritize todo list', type: 'documentation', priority: 'high' },
  { id: 'issue_10', number: 10, title: 'Design agent coordination schema in Neo4j', type: 'architecture', priority: 'high' },
  { id: 'issue_11', number: 11, title: 'Implement task dependency tracking', type: 'enhancement', priority: 'high' },
  { id: 'issue_12', number: 12, title: 'Create agent capability mapping system', type: 'enhancement', priority: 'medium' },
  { id: 'issue_13', number: 13, title: 'Build shared context storage', type: 'enhancement', priority: 'high' },
  { id: 'issue_14', number: 14, title: 'Design standalone human-facing API', type: 'architecture', priority: 'high' },
  
  // Persona Issues (Good First Issues)
  { id: 'issue_15', number: 15, title: 'Create LIBBY persona - librarian', type: 'persona', priority: 'high', goodFirstIssue: true },
  { id: 'issue_16', number: 16, title: 'Create FELIX persona - filesystem cat', type: 'persona', priority: 'high', goodFirstIssue: true },
  { id: 'issue_17', number: 17, title: 'Add SCOUT search persona', type: 'persona', priority: 'high', goodFirstIssue: true },
  
  // Existing Issues
  { id: 'issue_3', number: 3, title: 'Implement basic Claude API client plugin', type: 'enhancement', priority: 'high' },
  { id: 'issue_4', number: 4, title: 'Get Friday persona working end-to-end', type: 'enhancement', priority: 'high' },
  { id: 'issue_5', number: 5, title: 'Connect to real MCP server', type: 'enhancement', priority: 'high' }
];

// Define relationships between issues
const relationships = [
  // Agent coordination depends on these
  { from: 'issue_10', to: 'issue_11', type: 'enables', description: 'Schema design enables dependency tracking' },
  { from: 'issue_10', to: 'issue_12', type: 'enables', description: 'Schema design enables capability mapping' },
  { from: 'issue_10', to: 'issue_13', type: 'enables', description: 'Schema design enables shared context' },
  
  // Personas depend on infrastructure
  { from: 'issue_12', to: 'issue_15', type: 'required_for', description: 'Capability mapping needed for Libby' },
  { from: 'issue_12', to: 'issue_16', type: 'required_for', description: 'Capability mapping needed for Felix' },
  { from: 'issue_12', to: 'issue_17', type: 'required_for', description: 'Capability mapping needed for Scout' },
  
  // API depends on all core components
  { from: 'issue_11', to: 'issue_14', type: 'required_for', description: 'Task tracking needed for API' },
  { from: 'issue_12', to: 'issue_14', type: 'required_for', description: 'Capability mapping needed for API' },
  { from: 'issue_13', to: 'issue_14', type: 'required_for', description: 'Shared context needed for API' },
  
  // MCP and plugin connections
  { from: 'issue_5', to: 'issue_16', type: 'enables', description: 'MCP filesystem enables Felix' },
  { from: 'issue_5', to: 'issue_17', type: 'enables', description: 'MCP scout enables Scout persona' },
  { from: 'issue_3', to: 'issue_4', type: 'required_for', description: 'Claude client needed for Friday' }
];

async function storeIssuesInGraph() {
  console.log('🧪 Storing GitHub Issues in Knowledge Graph');
  console.log('=========================================\n');
  
  try {
    // Initialize plugin
    console.log('1. Initializing knowledge graph plugin...');
    const plugin = new KnowledgeGraphPlugin();
    await plugin.init();
    console.log('✅ Plugin initialized\n');
    
    // Store issues as nodes
    console.log('2. Storing issues as knowledge nodes...');
    for (const issue of issues) {
      const knowledge = {
        content: issue.title,
        type: 'github_issue',
        metadata: {
          issueNumber: issue.number,
          issueType: issue.type,
          priority: issue.priority,
          goodFirstIssue: issue.goodFirstIssue || false
        },
        tags: [issue.type, `priority_${issue.priority}`]
      };
      
      if (issue.goodFirstIssue) {
        knowledge.tags.push('good_first_issue');
      }
      
      const stored = await plugin.storeKnowledge(knowledge);
      console.log(`   ✅ Issue #${issue.number}: ${issue.title.substring(0, 40)}...`);
      
      // Store the node ID for relationships
      issue.nodeId = stored.id;
    }
    console.log('');
    
    // Create relationships
    console.log('3. Creating issue relationships...');
    for (const rel of relationships) {
      const fromIssue = issues.find(i => i.id === rel.from);
      const toIssue = issues.find(i => i.id === rel.to);
      
      if (fromIssue && toIssue) {
        await plugin.createRelationship({
          fromNodeId: fromIssue.nodeId,
          toNodeId: toIssue.nodeId,
          type: rel.type,
          metadata: { description: rel.description }
        });
        console.log(`   ✅ #${fromIssue.number} ${rel.type} #${toIssue.number}`);
      }
    }
    console.log('');
    
    // Query and display the graph structure
    console.log('4. Querying graph structure...\n');
    
    // Find good first issues
    console.log('Good First Issues for Team Members:');
    const goodFirstIssues = await plugin.queryKnowledge({
      query: 'good_first_issue',
      limit: 10
    });
    goodFirstIssues.forEach(issue => {
      console.log(`   - ${issue.content}`);
    });
    console.log('');
    
    // Find architecture issues
    console.log('Architecture & Infrastructure Issues:');
    const archIssues = await plugin.queryKnowledge({
      query: 'architecture',
      limit: 10
    });
    archIssues.forEach(issue => {
      console.log(`   - ${issue.content}`);
    });
    console.log('');
    
    // Demonstrate graph traversal
    console.log('5. Issue Dependency Analysis:');
    console.log('   Finding what needs to be done before implementing the API...');
    
    // In a real implementation, we'd traverse from issue_14 backwards
    // For now, we'll query relationships
    const apiDependencies = relationships
      .filter(r => r.to === 'issue_14')
      .map(r => {
        const issue = issues.find(i => i.id === r.from);
        return `   - Issue #${issue.number}: ${issue.title}`;
      });
    
    apiDependencies.forEach(dep => console.log(dep));
    console.log('');
    
    // Generate a visual representation
    console.log('6. Graph Visualization (Mermaid format):');
    console.log('```mermaid');
    console.log('graph TD');
    
    // Add nodes
    issues.forEach(issue => {
      const style = issue.goodFirstIssue ? ':::goodFirst' : '';
      console.log(`    ${issue.id}["#${issue.number}: ${issue.title.substring(0, 30)}..."]${style}`);
    });
    
    // Add relationships
    relationships.forEach(rel => {
      console.log(`    ${rel.from} -->|${rel.type}| ${rel.to}`);
    });
    
    console.log('    classDef goodFirst fill:#90EE90,stroke:#333,stroke-width:2px;');
    console.log('```\n');
    
    // Cleanup
    console.log('7. Cleaning up...');
    await plugin.cleanup();
    console.log('✅ Cleanup completed\n');
    
    console.log('🎉 Issue knowledge graph created successfully!');
    console.log('   The graph shows how issues relate and depend on each other.');
    console.log('   Team members can start with the green "good first issues".');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

storeIssuesInGraph();