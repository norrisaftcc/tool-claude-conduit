class BasePlugin {
  constructor(config = {}) {
    this.config = config;
    this.name = this.constructor.name;
    this.version = '1.0.0';
    this.initialized = false;
  }

  async init() {
    // Override in subclasses for initialization
    this.initialized = true;
    console.log(`${this.name} plugin initialized`);
  }

  async cleanup() {
    // Override in subclasses for cleanup
    this.initialized = false;
    console.log(`${this.name} plugin cleaned up`);
  }

  getInfo() {
    return {
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      config: this.config
    };
  }

  // Standard interface methods that plugins should implement
  async execute(method, params = {}) {
    throw new Error(`Execute method not implemented in ${this.name}`);
  }

  getCapabilities() {
    return {
      methods: [],
      description: 'Base plugin - override getCapabilities()'
    };
  }

  // Helper method for logging with plugin context
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`, 
                Object.keys(data).length > 0 ? data : '');
  }

  // Helper for validation
  validateParams(params, required = []) {
    const missing = required.filter(key => !(key in params));
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }
}

module.exports = BasePlugin;