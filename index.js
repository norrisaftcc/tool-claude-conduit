#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const ConfigValidator = require('./lib/config-validator');
const MCPClient = require('./lib/mcp-client');

const app = express();
const PORT = process.env.CONDUIT_PORT || 3001;
const mcpClient = new MCPClient();

app.use(cors());
app.use(express.json());

const fortunes = [
  "FLOW: Following Logical Work Order creates clarity in complexity.",
  "VIBE: Verify, and Inspirational Behaviors Emerge - transparency teaches.",
  "SAFE: Structure that serves learning, Always better outcomes, Frees creativity, Excellence inevitable.",
  "Notice how breaking down complex tasks reveals simpler patterns.",
  "Feel the confidence that comes from systematic verification.",
  "Watch yourself improving through deliberate practice and reflection.",
  "The best teaching happens when students observe authentic problem-solving.",
  "Debugging is just hypothesis testing with immediate feedback.",
  "Clean code is a love letter to your future self and your teammates.",
  "SOLID principles: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion.",
  "Agile means adapting to change, not avoiding planning.",
  "Code reviews are conversations, not competitions.",
  "Tests are specifications that never lie about what the code actually does.",
  "Refactoring is cleaning as you go, not procrastinating until later.",
  "Documentation is a conversation with future developers, including yourself."
];

function getRandomFortune() {
  return fortunes[Math.floor(Math.random() * fortunes.length)];
}

function loadMCPConfig() {
  try {
    const configPath = process.env.MCP_CONFIG_PATH || 
      path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'claude', 'claude_desktop_config.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.mcpServers || {};
    }
  } catch (error) {
    console.warn('Could not load MCP config:', error.message);
  }
  return {};
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    port: PORT
  });
});

app.get('/fortune', (req, res) => {
  res.json({
    fortune: getRandomFortune(),
    timestamp: new Date().toISOString()
  });
});

app.get('/tools', async (req, res) => {
  try {
    const mcpTools = mcpClient.getAvailableTools();
    const mcpStatus = await mcpClient.healthCheck();
    
    res.json({
      status: 'success',
      mcp: {
        servers: mcpTools,
        health: mcpStatus
      },
      totalCount: Object.keys(mcpTools).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve tools',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETED: All profile and planning-boost endpoints (FunkBot stubs removed)

app.post('/execute/:server/:tool', async (req, res) => {
  const { server, tool } = req.params;
  const payload = req.body;
  
  try {
    // Try MCP server execution first
    const result = await mcpClient.executeTool(server, tool, payload);
    
    // FunkBot Protocol 🎷🤖: Surface simulation metadata
    const response = {
      status: 'success',
      result,
      server,
      tool,
      executedVia: 'mcp',
      timestamp: new Date().toISOString()
    };

    // Add FunkBot Protocol 🎷🤖 metadata if present
    if (result.funkbot) {
      response.funkbot = result.funkbot;
      
      // Add response headers for transparent simulation state
      if (result.funkbot.is_simulated) {
        res.set({
          'X-Claude-Conduit-Mode': 'simulation',
          'X-Claude-Conduit-Warning': 'mock-data',
          'X-Claude-Conduit-Server-Status': result.funkbot.server_status || 'degraded'
        });
      }
    }
    
    res.json(response);
    
  } catch (mcpError) {
    res.status(404).json({
      error: 'Execution failed',
      message: mcpError.message,
      server,
      tool,
      suggestion: 'Check available servers/tools with GET /tools',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Claude Conduit',
    version: '2.0.0',
    description: 'HTTP bridge connecting Claude Code to MCP servers with plugin ecosystem',
    philosophy: 'VIBE: Verify, and Inspirational Behaviors Emerge - transparent development teaches',
    methodology: 'FLOW: Following Logical Work Order for systematic progress',
    endpoints: {
      health: 'GET /health',
      fortune: 'GET /fortune', 
      tools: 'GET /tools',
      execute: 'POST /execute/:server/:tool'
    },
    defaultProfile: 'senior-developer',
    timestamp: new Date().toISOString()
  });
});

// Validate configuration before starting
const configValidator = new ConfigValidator();
const configValid = configValidator.logValidationResults(configValidator.validateEnvironment());

if (!configValid && process.env.NODE_ENV === 'production') {
  console.error('Cannot start in production with invalid configuration');
  process.exit(1);
}

// Initialize MCP client
async function initializeServer() {
  try {
    await mcpClient.init();
    console.log('✅ MCP client initialized successfully');
  } catch (error) {
    console.warn('⚠️  MCP client initialization failed:', error.message);
    console.warn('Server will continue without MCP functionality');
  }
}

const server = app.listen(PORT, async () => {
  console.log(`Claude Conduit v2.0.0 running on http://localhost:${PORT}`);
  console.log('Plugin Ecosystem Architecture:');
  console.log('  GET  /health           - Server health check');
  console.log('  GET  /fortune          - Educational FLOW/VIBE wisdom');
  console.log('  GET  /tools            - Available MCP servers and plugins');
  console.log('  POST /execute/:server/:tool - Execute MCP server tools');
  console.log('');
  console.log('PHILOSOPHY: VIBE - Verify, and Inspirational Behaviors Emerge');
  console.log('METHODOLOGY: FLOW - Following Logical Work Order');
  console.log('Fortune:', getRandomFortune());
  console.log('');
  
  // Initialize MCP client after server starts
  await initializeServer();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await mcpClient.shutdown();
  server.close(() => {
    console.log('Claude Conduit server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await mcpClient.shutdown();
  server.close(() => {
    console.log('Claude Conduit server closed');
    process.exit(0);
  });
});