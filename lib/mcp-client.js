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
    // Mock tool discovery for now
    // Real implementation would call the server's list_tools method
    
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
      
      // Mock execution for now
      const result = await this.mockToolExecution(serverName, toolName, args);
      
      this.logger.info(`Tool execution completed: ${serverName}/${toolName}`);
      return result;

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