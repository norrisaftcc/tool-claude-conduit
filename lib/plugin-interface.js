const BasePlugin = require('./base-plugin');

/**
 * Plugin Interface Design for Claude Conduit
 * 
 * This defines the standard interface that all plugins must implement.
 * Supports different plugin types: AI clients, workflows, MCP integrations, storage
 */

class PluginInterface {
  static PLUGIN_TYPES = {
    AI_CLIENT: 'ai_client',        // Claude, OpenAI, Gemini, etc.
    WORKFLOW: 'workflow',          // grab-the-baton, planning-boost, etc.
    MCP_INTEGRATION: 'mcp',        // taskmaster-ai, scout, filesystem
    STORAGE: 'storage',            // memory-rag, knowledge-graph
    UTILITY: 'utility'             // config, logging, monitoring
  };

  static CAPABILITY_CATEGORIES = {
    REASONING: 'reasoning',        // Complex analysis, planning
    RESEARCH: 'research',          // Information gathering, search
    MEMORY: 'memory',             // Context storage, retrieval
    COMMUNICATION: 'communication', // Formatting, explanation
    WORKFLOW: 'workflow',          // Process management, handoffs
    DEBUGGING: 'debugging',        // Error analysis, troubleshooting
    EDUCATION: 'education'         // Teaching, guidance, Socratic method
  };

  /**
   * Standard Plugin Methods (all plugins must implement)
   */
  static REQUIRED_METHODS = [
    'init',           // Initialize plugin
    'execute',        // Main execution method
    'getCapabilities', // Return plugin capabilities
    'cleanup'         // Cleanup resources
  ];

  /**
   * Optional Plugin Methods
   */
  static OPTIONAL_METHODS = [
    'healthCheck',    // Plugin health status
    'getMetrics',     // Usage metrics
    'handleError',    // Error recovery
    'validateConfig', // Configuration validation
    'warmup',         // Pre-execution preparation
    'cooldown'        // Post-execution cleanup
  ];

  /**
   * AI Client Plugin Interface
   */
  static AI_CLIENT_INTERFACE = {
    // Core AI operations
    generate: 'async (prompt, options) => response',
    stream: 'async (prompt, options) => streamResponse',
    
    // Context management
    summarizeContext: 'async (context) => summary',
    estimateTokens: '(text) => tokenCount',
    getContextLimit: '() => maxTokens',
    
    // Model capabilities
    getModelInfo: '() => modelDetails',
    supportsImages: '() => boolean',
    supportsTools: '() => boolean',
    
    // Rate limiting
    getRateLimit: '() => rateInfo',
    waitForRateLimit: 'async () => void'
  };

  /**
   * Workflow Plugin Interface  
   */
  static WORKFLOW_INTERFACE = {
    // Workflow execution
    executeWorkflow: 'async (context, params) => result',
    
    // State management
    saveState: 'async (state) => void',
    loadState: 'async (stateId) => state',
    
    // Workflow control
    pause: 'async () => void',
    resume: 'async (stateId) => void',
    abort: 'async () => void',
    
    // Handoff support (for grab-the-baton)
    prepareHandoff: 'async (context) => handoffData',
    receiveHandoff: 'async (handoffData) => newContext'
  };

  /**
   * Storage Plugin Interface
   */
  static STORAGE_INTERFACE = {
    // CRUD operations
    store: 'async (key, data, metadata) => void',
    retrieve: 'async (key) => data',
    update: 'async (key, data) => void',
    delete: 'async (key) => void',
    
    // Query operations
    search: 'async (query, options) => results',
    list: 'async (prefix, options) => keys',
    
    // Memory-specific
    addMemory: 'async (memory, context) => void',
    recallMemory: 'async (query, context) => memories',
    forgetMemory: 'async (memoryId) => void'
  };

  /**
   * Plugin Registration and Discovery
   */
  static validatePlugin(plugin) {
    const errors = [];
    
    // Check required methods
    for (const method of this.REQUIRED_METHODS) {
      if (typeof plugin[method] !== 'function') {
        errors.push(`Missing required method: ${method}`);
      }
    }
    
    // Check plugin type
    if (!plugin.pluginType || !Object.values(this.PLUGIN_TYPES).includes(plugin.pluginType)) {
      errors.push('Invalid or missing pluginType');
    }
    
    // Check capabilities
    if (!plugin.capabilities || !Array.isArray(plugin.capabilities)) {
      errors.push('Missing or invalid capabilities array');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Plugin Factory - creates plugin instances based on type
   */
  static createPlugin(pluginConfig) {
    const { type, name, config } = pluginConfig;
    
    switch (type) {
      case this.PLUGIN_TYPES.AI_CLIENT:
        return this.createAIClientPlugin(name, config);
      case this.PLUGIN_TYPES.WORKFLOW:
        return this.createWorkflowPlugin(name, config);
      case this.PLUGIN_TYPES.STORAGE:
        return this.createStoragePlugin(name, config);
      default:
        throw new Error(`Unknown plugin type: ${type}`);
    }
  }

  /**
   * Persona to Plugin Mapping
   * Maps personas to required plugin capabilities
   */
  static getPersonaRequirements(personaName) {
    const personaMap = {
      'senior-developer': [
        this.CAPABILITY_CATEGORIES.REASONING,
        this.CAPABILITY_CATEGORIES.RESEARCH, 
        this.CAPABILITY_CATEGORIES.MEMORY,
        this.CAPABILITY_CATEGORIES.WORKFLOW
      ],
      'friday': [
        this.CAPABILITY_CATEGORIES.RESEARCH,
        this.CAPABILITY_CATEGORIES.MEMORY,
        this.CAPABILITY_CATEGORIES.COMMUNICATION
      ],
      'vita': [
        this.CAPABILITY_CATEGORIES.EDUCATION,
        this.CAPABILITY_CATEGORIES.REASONING,
        this.CAPABILITY_CATEGORIES.MEMORY
      ],
      'planning-boost': [
        this.CAPABILITY_CATEGORIES.REASONING,
        this.CAPABILITY_CATEGORIES.WORKFLOW
      ],
      'grab-the-baton': [
        this.CAPABILITY_CATEGORIES.WORKFLOW,
        this.CAPABILITY_CATEGORIES.MEMORY,
        this.CAPABILITY_CATEGORIES.COMMUNICATION
      ]
    };
    
    return personaMap[personaName] || [];
  }
}

module.exports = PluginInterface;