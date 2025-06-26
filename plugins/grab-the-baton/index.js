const BasePlugin = require('../../lib/base-plugin');
const PluginInterface = require('../../lib/plugin-interface');

/**
 * Grab the Baton Plugin
 * 
 * Handles context window management and model handoffs.
 * Simulates the /compact command behavior - when a model approaches
 * context limits, it summarizes context and prepares handoff to fresh instance.
 */
class GrabTheBatonPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.pluginType = PluginInterface.PLUGIN_TYPES.WORKFLOW;
    this.capabilities = [
      PluginInterface.CAPABILITY_CATEGORIES.WORKFLOW,
      PluginInterface.CAPABILITY_CATEGORIES.MEMORY,
      PluginInterface.CAPABILITY_CATEGORIES.COMMUNICATION
    ];
    
    // Configuration
    this.contextThreshold = config.contextThreshold || 0.85; // 85% of context window
    this.summaryModel = config.summaryModel || 'claude-3-haiku'; // Efficient model for summaries
    this.handoffStorage = new Map(); // In-memory storage for demo
  }

  async init() {
    await super.init();
    this.log('info', 'Grab the Baton plugin initialized', {
      contextThreshold: this.contextThreshold,
      summaryModel: this.summaryModel
    });
  }

  getCapabilities() {
    return {
      methods: [
        'checkContextUsage',
        'prepareHandoff', 
        'receiveHandoff',
        'executeWorkflow',
        'summarizeContext'
      ],
      description: 'Context window management and model handoff coordination',
      supportsStreaming: false,
      requiresAIClient: true
    };
  }

  /**
   * Check if current context is approaching limits
   */
  async checkContextUsage(context) {
    this.validateParams(context, ['messages', 'model']);
    
    const { messages, model, maxTokens } = context;
    
    // Estimate current token usage
    const currentTokens = this.estimateTokenUsage(messages);
    const modelLimit = maxTokens || this.getModelLimit(model);
    const usage = currentTokens / modelLimit;
    
    const result = {
      currentTokens,
      maxTokens: modelLimit,
      usagePercent: usage,
      shouldHandoff: usage >= this.contextThreshold,
      remainingTokens: modelLimit - currentTokens
    };
    
    this.log('info', 'Context usage check', result);
    return result;
  }

  /**
   * Prepare context for handoff to fresh model instance
   */
  async prepareHandoff(context) {
    this.validateParams(context, ['messages', 'currentTask']);
    
    const { messages, currentTask, metadata = {} } = context;
    
    // Create context summary
    const summary = await this.summarizeContext(messages);
    
    // Package handoff data
    const handoffData = {
      id: this.generateHandoffId(),
      timestamp: new Date().toISOString(),
      summary,
      currentTask,
      metadata,
      originalMessageCount: messages.length,
      handoffReason: 'context_window_limit'
    };
    
    // Store handoff data
    this.handoffStorage.set(handoffData.id, handoffData);
    
    this.log('info', 'Handoff prepared', {
      handoffId: handoffData.id,
      originalMessages: messages.length,
      summaryLength: summary.length
    });
    
    return handoffData;
  }

  /**
   * Receive handoff from previous model instance
   */
  async receiveHandoff(handoffData) {
    this.validateParams(handoffData, ['id', 'summary', 'currentTask']);
    
    const { id, summary, currentTask, metadata } = handoffData;
    
    // Create new context with summary
    const newContext = {
      messages: [
        {
          role: 'system',
          content: `You are continuing work from a previous context. Here's what happened before:\n\n${summary}\n\nCurrent task: ${currentTask}`
        }
      ],
      currentTask,
      metadata: {
        ...metadata,
        handoffReceived: true,
        handoffId: id,
        timestamp: new Date().toISOString()
      }
    };
    
    this.log('info', 'Handoff received', {
      handoffId: id,
      currentTask,
      newContextReady: true
    });
    
    return newContext;
  }

  /**
   * Main workflow execution
   */
  async executeWorkflow(context, params = {}) {
    const { action = 'check' } = params;
    
    switch (action) {
      case 'check':
        return await this.checkContextUsage(context);
      case 'prepare':
        return await this.prepareHandoff(context);
      case 'receive':
        return await this.receiveHandoff(params.handoffData);
      default:
        throw new Error(`Unknown workflow action: ${action}`);
    }
  }

  /**
   * Summarize conversation context for handoff
   */
  async summarizeContext(messages) {
    // In a real implementation, this would call an AI model
    // For now, create a simple summary
    
    const totalMessages = messages.length;
    const lastFewMessages = messages.slice(-5);
    
    let summary = `Conversation summary (${totalMessages} total messages):\n\n`;
    
    // Add context about conversation flow
    if (totalMessages > 10) {
      summary += `This was an extended conversation. `;
    }
    
    // Summarize recent messages
    summary += `Recent discussion:\n`;
    lastFewMessages.forEach((msg, idx) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const content = msg.content.slice(0, 200) + (msg.content.length > 200 ? '...' : '');
      summary += `${role}: ${content}\n`;
    });
    
    summary += `\nKey points to continue with the next model instance.`;
    
    return summary;
  }

  // Helper methods
  estimateTokenUsage(messages) {
    // Rough token estimation (4 chars ≈ 1 token)
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  getModelLimit(model) {
    const limits = {
      'claude-3-opus': 200000,
      'claude-3-sonnet': 200000, 
      'claude-3-haiku': 200000,
      'gpt-4': 8192,
      'gpt-4-32k': 32768,
      'gpt-3.5-turbo': 4096
    };
    return limits[model] || 4096;
  }

  generateHandoffId() {
    return `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async healthCheck() {
    return {
      status: 'healthy',
      handoffsInProgress: this.handoffStorage.size,
      contextThreshold: this.contextThreshold
    };
  }
}

module.exports = GrabTheBatonPlugin;