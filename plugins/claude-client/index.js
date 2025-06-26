const BasePlugin = require('../../lib/base-plugin');
const PluginInterface = require('../../lib/plugin-interface');

/**
 * Claude AI Client Plugin
 * 
 * Provides interface to Anthropic's Claude API through the plugin system.
 * Handles authentication, rate limiting, and Claude-specific features.
 */
class ClaudeClientPlugin extends BasePlugin {
  constructor(config = {}) {
    super(config);
    this.pluginType = PluginInterface.PLUGIN_TYPES.AI_CLIENT;
    this.capabilities = [
      PluginInterface.CAPABILITY_CATEGORIES.REASONING,
      PluginInterface.CAPABILITY_CATEGORIES.COMMUNICATION
    ];
    
    // Configuration
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.baseURL = config.baseURL || 'https://api.anthropic.com';
    this.defaultModel = config.defaultModel || 'claude-3-sonnet-20240229';
    this.maxRetries = config.maxRetries || 3;
    this.rateLimitBuffer = config.rateLimitBuffer || 1000; // ms buffer
    
    // Rate limiting state
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.rateLimitReset = 0;
  }

  async init() {
    await super.init();
    
    if (!this.apiKey) {
      throw new Error('Claude API key not provided');
    }
    
    this.log('info', 'Claude client initialized', {
      model: this.defaultModel,
      hasApiKey: !!this.apiKey
    });
  }

  getCapabilities() {
    return {
      methods: [
        'generate',
        'stream', 
        'summarizeContext',
        'estimateTokens',
        'getContextLimit',
        'getModelInfo'
      ],
      description: 'Anthropic Claude API client with context management',
      supportsImages: true,
      supportsTools: true,
      supportsStreaming: true,
      models: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229', 
        'claude-3-haiku-20240307'
      ]
    };
  }

  /**
   * Generate text response from Claude
   */
  async generate(prompt, options = {}) {
    const {
      model = this.defaultModel,
      maxTokens = 4000,
      temperature = 0.7,
      systemPrompt = null,
      images = null
    } = options;
    
    await this.waitForRateLimit();
    
    const messages = this.formatMessages(prompt, systemPrompt, images);
    
    const requestBody = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages
    };
    
    try {
      const response = await this.makeRequest('/v1/messages', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      this.updateRateLimit(response.headers);
      
      const result = {
        content: response.data.content[0].text,
        model: response.data.model,
        usage: response.data.usage,
        id: response.data.id
      };
      
      this.log('info', 'Generated response', {
        model,
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens
      });
      
      return result;
      
    } catch (error) {
      this.log('error', 'Generation failed', { error: error.message, model });
      throw error;
    }
  }

  /**
   * Stream response from Claude  
   */
  async stream(prompt, options = {}) {
    // Similar to generate but with streaming
    // For demo purposes, returning a promise that resolves with chunks
    const response = await this.generate(prompt, options);
    
    // Simulate streaming by chunking the response
    const chunks = this.chunkText(response.content, 50);
    
    return {
      async *[Symbol.asyncIterator]() {
        for (const chunk of chunks) {
          yield { content: chunk, done: false };
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
        }
        yield { content: '', done: true };
      }
    };
  }

  /**
   * Summarize context for handoffs
   */
  async summarizeContext(context) {
    const summaryPrompt = `Please provide a concise summary of this conversation that captures the key points, decisions made, and current state. This summary will be used to continue the conversation with a fresh context.

Conversation to summarize:
${JSON.stringify(context, null, 2)}`;

    const response = await this.generate(summaryPrompt, {
      model: 'claude-3-haiku-20240307', // Use efficient model for summaries
      maxTokens: 1000,
      temperature: 0.3
    });
    
    return response.content;
  }

  /**
   * Estimate token count for text
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token for Claude
    return Math.ceil(text.length / 4);
  }

  /**
   * Get context window limit for model
   */
  getContextLimit(model = this.defaultModel) {
    const limits = {
      'claude-3-opus-20240229': 200000,
      'claude-3-sonnet-20240229': 200000,
      'claude-3-haiku-20240307': 200000
    };
    return limits[model] || 200000;
  }

  /**
   * Get model information
   */
  getModelInfo(model = this.defaultModel) {
    const modelInfo = {
      'claude-3-opus-20240229': {
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        strengths: ['complex reasoning', 'analysis', 'creative writing'],
        costTier: 'high'
      },
      'claude-3-sonnet-20240229': {
        name: 'Claude 3 Sonnet', 
        contextWindow: 200000,
        strengths: ['balanced performance', 'coding', 'general tasks'],
        costTier: 'medium'
      },
      'claude-3-haiku-20240307': {
        name: 'Claude 3 Haiku',
        contextWindow: 200000,
        strengths: ['speed', 'simple tasks', 'summaries'],
        costTier: 'low'
      }
    };
    
    return modelInfo[model] || modelInfo[this.defaultModel];
  }

  /**
   * Check and wait for rate limits
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Simple rate limiting: ensure minimum time between requests
    if (timeSinceLastRequest < this.rateLimitBuffer) {
      const waitTime = this.rateLimitBuffer - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Get current rate limit status
   */
  getRateLimit() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      rateLimitBuffer: this.rateLimitBuffer
    };
  }

  // Helper methods
  formatMessages(prompt, systemPrompt, images) {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    if (typeof prompt === 'string') {
      const content = images ? this.formatWithImages(prompt, images) : prompt;
      messages.push({ role: 'user', content });
    } else if (Array.isArray(prompt)) {
      messages.push(...prompt);
    }
    
    return messages;
  }

  formatWithImages(text, images) {
    // Format text with images for Claude's multimodal input
    const content = [{ type: 'text', text }];
    
    if (images && Array.isArray(images)) {
      images.forEach(image => {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.mediaType || 'image/jpeg',
            data: image.data
          }
        });
      });
    }
    
    return content;
  }

  chunkText(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async makeRequest(endpoint, options) {
    // Mock HTTP request - in real implementation would use fetch/axios
    // For demo purposes, return mock response
    return {
      data: {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        model: this.defaultModel,
        content: [{ text: 'Mock response from Claude API' }],
        usage: { input_tokens: 100, output_tokens: 50 }
      },
      headers: new Map([
        ['anthropic-ratelimit-requests-remaining', '999'],
        ['anthropic-ratelimit-requests-reset', Date.now() + 60000]
      ])
    };
  }

  updateRateLimit(headers) {
    // Update rate limit tracking from response headers
    const remaining = headers.get('anthropic-ratelimit-requests-remaining');
    const reset = headers.get('anthropic-ratelimit-requests-reset');
    
    if (remaining) this.requestsRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset);
  }

  async healthCheck() {
    return {
      status: 'healthy',
      model: this.defaultModel,
      hasApiKey: !!this.apiKey,
      rateLimit: this.getRateLimit()
    };
  }
}

module.exports = ClaudeClientPlugin;