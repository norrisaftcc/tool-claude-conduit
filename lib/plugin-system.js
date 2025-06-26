const fs = require('fs');
const path = require('path');

class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.profiles = new Map();
    this.loadProfiles();
  }

  loadProfiles() {
    this.profiles.set('task+research', {
      plugins: ['mcp-taskmaster', 'mcp-scout', 'planning-flow', 'memory-rag'],
      description: 'Full task planning and research capabilities'
    });
    
    this.profiles.set('memory-only', {
      plugins: ['memory-rag', 'memory-graph'],
      description: 'Persistent memory and knowledge graph storage'
    });
    
    this.profiles.set('planning-boost', {
      plugins: ['mcp-taskmaster', 'planning-flow'],
      description: 'Planning assistance for non-reasoning agents'
    });
    
    this.profiles.set('soft-skills', {
      plugins: ['mcp-taskmaster', 'planning-flow', 'memory-rag', 'communication-flow'],
      description: 'Communication, planning, and people management focus'
    });
    
    this.profiles.set('python-debugging', {
      plugins: ['mcp-filesystem', 'python-debugger', 'memory-graph', 'stack-trace-analyzer'],
      description: 'Specialized Python debugging and analysis tools'
    });
    
    this.profiles.set('senior-developer', {
      plugins: ['mcp-taskmaster', 'mcp-filesystem', 'mcp-scout', 'memory-rag', 'memory-graph', 'architecture-advisor'],
      description: 'Advanced development tools for experienced developers - architecture, research, and complex project management'
    });
    
    this.profiles.set('friday', {
      plugins: ['mcp-scout', 'research-summarizer', 'memory-rag', 'explanation-engine', 'topic-analyzer'],
      description: 'Research specialist - looks up topics, analyzes information, and provides intelligent, easy-to-understand summaries (named in honor of our lab tech who doesn\'t work Fridays)'
    });
    
    this.profiles.set('vita', {
      plugins: ['socratic-questioner', 'learning-flow', 'memory-rag', 'gentle-guide', 'student-progress-tracker'],
      description: 'Gentle Socratic reasoning - guides students to discover answers themselves through thoughtful questioning and patient guidance'
    });
    
    this.profiles.set('full-stack', {
      plugins: ['mcp-taskmaster', 'mcp-filesystem', 'mcp-scout', 'memory-rag', 'memory-graph', 'planning-flow'],
      description: 'All available capabilities'
    });
  }

  async loadPlugin(pluginName, config = {}) {
    try {
      const pluginPath = path.join(__dirname, '..', 'plugins', pluginName);
      
      if (!fs.existsSync(pluginPath)) {
        throw new Error(`Plugin ${pluginName} not found at ${pluginPath}`);
      }
      
      const PluginClass = require(pluginPath);
      const plugin = new PluginClass(config);
      
      if (typeof plugin.init === 'function') {
        await plugin.init();
      }
      
      this.plugins.set(pluginName, plugin);
      console.log(`Plugin ${pluginName} loaded successfully`);
      
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginName}:`, error.message);
      throw error;
    }
  }

  async loadProfile(profileName, config = {}) {
    const profile = this.profiles.get(profileName);
    if (!profile) {
      throw new Error(`Profile ${profileName} not found`);
    }
    
    const loadedPlugins = [];
    for (const pluginName of profile.plugins) {
      try {
        await this.loadPlugin(pluginName, config[pluginName] || {});
        loadedPlugins.push(pluginName);
      } catch (error) {
        console.warn(`Skipping plugin ${pluginName} in profile ${profileName}:`, error.message);
      }
    }
    
    return { profile: profileName, loadedPlugins, description: profile.description };
  }

  getPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }

  async executePlugin(pluginName, method, params = {}) {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not loaded`);
    }
    
    if (typeof plugin[method] !== 'function') {
      throw new Error(`Method ${method} not found in plugin ${pluginName}`);
    }
    
    return await plugin[method](params);
  }

  async handlePlanningBoost(request) {
    const taskmaster = this.getPlugin('mcp-taskmaster');
    const planningFlow = this.getPlugin('planning-flow');
    
    if (!taskmaster && !planningFlow) {
      throw new Error('No planning plugins available for boost');
    }
    
    // Use taskmaster for complex planning, planning-flow for methodology
    const planner = taskmaster || planningFlow;
    
    return await planner.createPlan({
      task: request.task,
      context: request.context,
      agentCapabilities: request.agentCapabilities || 'basic',
      boostLevel: request.boostLevel || 'full'
    });
  }

  getAvailableProfiles() {
    return Array.from(this.profiles.entries()).map(([name, profile]) => ({
      name,
      plugins: profile.plugins,
      description: profile.description
    }));
  }

  getLoadedPlugins() {
    return Array.from(this.plugins.keys());
  }

  async shutdown() {
    for (const [name, plugin] of this.plugins) {
      if (typeof plugin.cleanup === 'function') {
        try {
          await plugin.cleanup();
          console.log(`Plugin ${name} cleaned up successfully`);
        } catch (error) {
          console.error(`Error cleaning up plugin ${name}:`, error.message);
        }
      }
    }
    this.plugins.clear();
  }
}

module.exports = PluginSystem;