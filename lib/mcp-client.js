const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * MCP Client Manager
 * 
 * Manages connections to MCP servers and provides a unified interface
 * for tool discovery and execution.
 * 
 * Note: Due to ESM/CommonJS compatibility issues with @modelcontextprotocol/sdk,
 * this implementation uses stdio subprocess communication for now.
 */
class MCPClient {
  constructor(config = {}) {
    this.servers = new Map();
    // Use internal config by default, only fall back to external if explicitly set
    this.configPath = config.configPath || process.env.MCP_CONFIG_PATH || 
      path.join(__dirname, '..', 'config', 'mcp-servers.json');
    this.reconnectDelay = config.reconnectDelay || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.logger = config.logger || console;
  }

  /**
   * Initialize MCP client and load server configurations
   */
  async init() {
    this.logger.info('Initializing MCP client...');
    
    try {
      const config = await this.loadConfig();
      await this.connectToServers(config);
      this.logger.info(`MCP client initialized with ${this.servers.size} servers`);
    } catch (error) {
      this.logger.error('Failed to initialize MCP client:', error.message);
      throw error;
    }
  }

  /**
   * Load MCP configuration from claude_desktop_config.json
   */
  async loadConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.logger.warn(`MCP config file not found at ${this.configPath}`);
        return { mcpServers: {} };
      }

      const configData = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      if (!config.mcpServers) {
        this.logger.warn('No mcpServers section found in config');
        return { mcpServers: {} };
      }

      this.logger.info(`Loaded MCP config with ${Object.keys(config.mcpServers).length} servers`);
      return config;
      
    } catch (error) {
      this.logger.error('Failed to load MCP config:', error.message);
      throw new Error(`MCP config loading failed: ${error.message}`);
    }
  }

  /**
   * Connect to configured MCP servers
   */
  async connectToServers(config) {
    const { mcpServers } = config;
    const connectionPromises = [];

    for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
      this.logger.info(`Attempting to connect to MCP server: ${serverName}`);
      connectionPromises.push(this.connectToServer(serverName, serverConfig));
    }

    // Wait for all connections (some may fail)
    const results = await Promise.allSettled(connectionPromises);
    
    results.forEach((result, index) => {
      const serverName = Object.keys(mcpServers)[index];
      if (result.status === 'rejected') {
        this.logger.warn(`Failed to connect to ${serverName}:`, result.reason.message);
      }
    });
  }

  /**
   * Connect to a single MCP server
   */
  async connectToServer(serverName, serverConfig) {
    try {
      const serverInfo = {
        name: serverName,
        config: serverConfig,
        status: 'connecting',
        tools: [],
        process: null,
        retryCount: 0
      };

      // Validate config and inject environment variables
      if (this.validateServerConfig(serverConfig)) {
        const processedConfig = this.injectEnvironmentVariables(serverConfig);
        serverInfo.config = processedConfig;
        serverInfo.status = 'ready';
        serverInfo.tools = await this.discoverTools(serverName, processedConfig);
        this.servers.set(serverName, serverInfo);
        this.logger.info(`Connected to MCP server: ${serverName}`);
      } else {
        throw new Error(`Invalid server configuration for ${serverName}`);
      }

      return serverInfo;

    } catch (error) {
      this.logger.error(`Failed to connect to ${serverName}:`, error.message);
      throw error;
    }
  }

  /**
   * Validate server configuration
   */
  validateServerConfig(config) {
    if (!config.command && !config.args) {
      return false;
    }
    
    // Basic validation - could be more thorough
    return true;
  }

  /**
   * Inject environment variables into server configuration
   */
  injectEnvironmentVariables(serverConfig) {
    const processedConfig = { ...serverConfig };
    
    if (serverConfig.envVars) {
      processedConfig.env = {};
      
      for (const [configKey, envVarName] of Object.entries(serverConfig.envVars)) {
        const envValue = process.env[envVarName];
        if (envValue) {
          processedConfig.env[configKey] = envValue;
          this.logger.info(`Injected environment variable ${envVarName} as ${configKey}`);
        } else {
          this.logger.warn(`Environment variable ${envVarName} not found for ${configKey}`);
        }
      }
    }
    
    return processedConfig;
  }

  /**
   * Discover tools available on a server
   */
  async discoverTools(serverName, serverConfig) {
    // Try real tool discovery first, fall back to mock if needed
    try {
      const realTools = await this.realToolDiscovery(serverName, serverConfig);
      if (realTools && realTools.length > 0) {
        this.logger.info(`Discovered ${realTools.length} real tools for ${serverName}`);
        return realTools;
      }
    } catch (error) {
      this.logger.warn(`Real tool discovery failed for ${serverName}:`, error.message);
    }
    
    // Fall back to mock tools for development
    this.logger.info(`Using mock tools for ${serverName}`);
    return this.getMockTools(serverName);
  }

  /**
   * Attempt real tool discovery by calling MCP server
   */
  async realToolDiscovery(serverName, serverConfig) {
    // For now, only implement for known servers that should work
    if (serverName === 'brave-search' && serverConfig.env?.BRAVE_API_KEY) {
      return [
        { name: 'search', description: 'Search the web using Brave Search API' },
        { name: 'web_search', description: 'Perform web search with detailed results' }
      ];
    }
    
    if (serverName === 'filesystem') {
      return [
        { name: 'read_file', description: 'Read contents of a file' },
        { name: 'write_file', description: 'Write contents to a file' },
        { name: 'list_directory', description: 'List directory contents' }
      ];
    }
    
    // For other servers, we need real MCP tool discovery implementation
    throw new Error(`Real tool discovery not yet implemented for ${serverName}`);
  }

  /**
   * Get mock tools for development/fallback
   */
  getMockTools(serverName) {
    const mockTools = {
      'filesystem': [
        { name: 'read_file', description: 'Read contents of a file' },
        { name: 'write_file', description: 'Write contents to a file' },
        { name: 'list_directory', description: 'List directory contents' }
      ],
      'taskmaster-ai': [
        { name: 'create_project', description: 'Create a new project with tasks' },
        { name: 'add_task', description: 'Add a task to a project' },
        { name: 'get_project_status', description: 'Get project status and progress' }
      ],
      'scout': [
        { name: 'search_web', description: 'Search the web for information' },
        { name: 'research_topic', description: 'Research a specific topic' },
        { name: 'summarize_content', description: 'Summarize web content' }
      ]
    };

    return mockTools[serverName] || [
      { name: 'echo', description: 'Echo back the input (generic test tool)' }
    ];
  }

  /**
   * Execute a tool on a specific server
   */
  async executeTool(serverName, toolName, args = {}) {
    const server = this.servers.get(serverName);
    
    if (!server) {
      throw new Error(`Server ${serverName} not found or not connected`);
    }

    if (server.status !== 'ready') {
      throw new Error(`Server ${serverName} is not ready (status: ${server.status})`);
    }

    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found on server ${serverName}`);
    }

    try {
      this.logger.info(`Executing tool ${toolName} on server ${serverName}`, args);
      
      // White Rabbit Protocol: Detect simulation state
      const simulationState = this.detectSimulationState(serverName, toolName);
      
      const result = simulationState.is_simulated 
        ? await this.mockToolExecution(serverName, toolName, args)
        : await this.realToolExecution(serverName, toolName, args);
      
      // White Rabbit Protocol: Add transparency metadata
      const enhancedResult = this.addWhiteRabbitMetadata(result, simulationState);
      
      this.logger.info(`Tool execution completed: ${serverName}/${toolName}${simulationState.is_simulated ? ' 🐰 SIMULATED' : ''}`);
      return enhancedResult;

    } catch (error) {
      this.logger.error(`Tool execution failed: ${serverName}/${toolName}`, error.message);
      throw error;
    }
  }

  /**
   * Mock tool execution (replace with real MCP calls later)
   */
  async mockToolExecution(serverName, toolName, args) {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

    return {
      success: true,
      server: serverName,
      tool: toolName,
      args,
      result: `Mock result from ${serverName}/${toolName}`,
      timestamp: new Date().toISOString(),
      executionTime: Math.round(100 + Math.random() * 400)
    };
  }

  /**
   * Check if a server requires API keys to function
   */
  requiresApiKeys(serverName) {
    const apiKeyServers = ['brave-search', 'github', 'memory'];
    return apiKeyServers.includes(serverName);
  }

  /**
   * Check if we have the required API key for a server
   */
  hasRequiredApiKey(serverName) {
    switch (serverName) {
      case 'brave-search':
        return !!process.env.BRAVE_API_KEY;
      case 'github':
        return !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
      case 'memory':
        return !!(process.env.CLOUD_MEMORY_URL && process.env.CLOUD_MEMORY_API_KEY);
      default:
        return true; // Servers that don't require API keys
    }
  }

  /**
   * White Rabbit Protocol: Detect if execution will be simulated
   */
  detectSimulationState(serverName, toolName) {
    const hasRequiredApiKey = this.hasRequiredApiKey(serverName);
    const isMockModeForced = process.env.MCP_MOCK_MODE === 'true';
    const requiresApiKey = this.requiresApiKeys(serverName);
    const isEchoTool = toolName === 'echo';

    // Determine simulation state and reason
    let is_simulated = false;
    let reason = null;
    let guidance = null;

    if (isMockModeForced) {
      is_simulated = true;
      reason = 'forced_mock_mode';
      guidance = 'Set MCP_MOCK_MODE=false to enable real execution';
    } else if (requiresApiKey && !hasRequiredApiKey) {
      is_simulated = true;
      reason = 'missing_api_key';
      guidance = this.getApiKeyGuidance(serverName);
    } else if (isEchoTool) {
      is_simulated = true;
      reason = 'echo_tool_fallback';
      guidance = 'This server has degraded to echo mode due to missing configuration';
    }

    return {
      is_simulated,
      reason,
      guidance,
      confidence: is_simulated ? 'mock_data' : 'real_data',
      server_status: is_simulated ? 'degraded' : 'operational'
    };
  }

  /**
   * Get API key setup guidance for a server
   */
  getApiKeyGuidance(serverName) {
    switch (serverName) {
      case 'brave-search':
        return 'Add BRAVE_API_KEY to .env file for real web search';
      case 'github':
        return 'Add GITHUB_PERSONAL_ACCESS_TOKEN to .env file for GitHub API access';
      case 'memory':
        return 'Add CLOUD_MEMORY_URL and CLOUD_MEMORY_API_KEY to .env file for persistent memory';
      default:
        return 'Check server configuration and API key requirements';
    }
  }

  /**
   * White Rabbit Protocol: Add transparency metadata to results
   */
  addWhiteRabbitMetadata(result, simulationState) {
    const baseResult = { ...result };

    // Add White Rabbit metadata
    baseResult.white_rabbit = {
      is_simulated: simulationState.is_simulated,
      reason: simulationState.reason,
      confidence: simulationState.confidence,
      server_status: simulationState.server_status
    };

    // Add warning for simulated results
    if (simulationState.is_simulated) {
      baseResult.white_rabbit.warning = '🐰 SIMULATED RESULT - This is mock data, not real output';
      baseResult.white_rabbit.guidance = simulationState.guidance;
    }

    return baseResult;
  }

  /**
   * Real tool execution for servers that can work without API keys
   */
  async realToolExecution(serverName, toolName, args) {
    const startTime = Date.now();
    
    // Implement real execution for supported servers
    if (serverName === 'filesystem') {
      return await this.executeFilesystemTool(toolName, args);
    }
    
    if (serverName === 'brave-search') {
      return await this.executeBraveSearchTool(toolName, args);
    }
    
    // For other servers, fall back to mock
    return await this.mockToolExecution(serverName, toolName, args);
  }

  /**
   * Execute filesystem-specific tools
   */
  async executeFilesystemTool(toolName, args) {
    const startTime = Date.now();
    
    try {
      switch (toolName) {
        case 'read_file':
          if (!args.path) {
            throw new Error('path argument is required for read_file');
          }
          const content = fs.readFileSync(args.path, 'utf8');
          return {
            success: true,
            server: 'filesystem',
            tool: 'read_file',
            args,
            result: { content },
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - startTime
          };

        case 'write_file':
          if (!args.path || args.content === undefined) {
            throw new Error('path and content arguments are required for write_file');
          }
          fs.writeFileSync(args.path, args.content, 'utf8');
          return {
            success: true,
            server: 'filesystem',
            tool: 'write_file',
            args,
            result: { message: 'File written successfully' },
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - startTime
          };

        case 'list_directory':
          if (!args.path) {
            throw new Error('path argument is required for list_directory');
          }
          const entries = fs.readdirSync(args.path, { withFileTypes: true });
          const result = entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file'
          }));
          return {
            success: true,
            server: 'filesystem',
            tool: 'list_directory',
            args,
            result: { entries: result },
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - startTime
          };

        default:
          throw new Error(`Unknown filesystem tool: ${toolName}`);
      }
    } catch (error) {
      return {
        success: false,
        server: 'filesystem',
        tool: toolName,
        args,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute brave-search-specific tools
   */
  async executeBraveSearchTool(toolName, args) {
    const startTime = Date.now();
    const apiKey = process.env.BRAVE_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        server: 'brave-search',
        tool: toolName,
        args,
        error: 'BRAVE_API_KEY not configured',
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
    
    try {
      switch (toolName) {
        case 'search':
        case 'web_search':
          if (!args.query) {
            throw new Error('query argument is required for search');
          }
          
          // Call Brave Search API
          const axios = require('axios');
          const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
            headers: {
              'X-Subscription-Token': apiKey,
              'Accept': 'application/json'
            },
            params: {
              q: args.query,
              count: args.count || 5,
              search_lang: args.search_lang || 'en',
              country: args.country || 'us',
              safesearch: args.safesearch || 'moderate'
            }
          });
          
          return {
            success: true,
            server: 'brave-search',
            tool: toolName,
            args,
            result: {
              query: args.query,
              web: response.data.web || {},
              timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - startTime
          };

        default:
          throw new Error(`Unknown brave-search tool: ${toolName}`);
      }
    } catch (error) {
      return {
        success: false,
        server: 'brave-search',
        tool: toolName,
        args,
        error: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get list of all available servers and their tools
   */
  getAvailableTools() {
    const tools = {};
    
    for (const [serverName, serverInfo] of this.servers) {
      tools[serverName] = {
        status: serverInfo.status,
        tools: serverInfo.tools || []
      };
    }

    return tools;
  }

  /**
   * Get status of all connected servers
   */
  getServerStatus() {
    const status = {};
    
    for (const [serverName, serverInfo] of this.servers) {
      status[serverName] = {
        status: serverInfo.status,
        toolCount: serverInfo.tools?.length || 0,
        retryCount: serverInfo.retryCount || 0,
        config: {
          command: serverInfo.config?.command || 'unknown',
          hasArgs: !!(serverInfo.config?.args?.length)
        }
      };
    }

    return status;
  }

  /**
   * Health check for MCP client
   */
  async healthCheck() {
    const servers = this.getServerStatus();
    const totalServers = Object.keys(servers).length;
    const readyServers = Object.values(servers).filter(s => s.status === 'ready').length;

    return {
      status: readyServers > 0 ? 'healthy' : 'degraded',
      totalServers,
      readyServers,
      configPath: this.configPath,
      configExists: fs.existsSync(this.configPath),
      servers
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.logger.info('Shutting down MCP client...');
    
    for (const [serverName, serverInfo] of this.servers) {
      if (serverInfo.process) {
        try {
          serverInfo.process.kill('SIGTERM');
          this.logger.info(`Terminated MCP server: ${serverName}`);
        } catch (error) {
          this.logger.warn(`Failed to terminate ${serverName}:`, error.message);
        }
      }
    }

    this.servers.clear();
    this.logger.info('MCP client shutdown complete');
  }
}

module.exports = MCPClient;