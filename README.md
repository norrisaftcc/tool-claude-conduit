# Claude Conduit

HTTP bridge connecting Claude Code to MCP servers with plugin ecosystem.

## Current Status

### ✅ Fully Functional
- **Filesystem operations**: Read, write, list directory contents
- **Brave Search integration**: Real web search with API key
- **Health monitoring**: Server status and tool discovery
- **FLOW methodology**: Fortune system with 45+ educational quotes
- **Configuration validation**: Environment and API key checking
- **FunkBot Protocol**: Transparent marking of simulated features

### 🎷🤖 FunkBot Stubs (Simulated)
- **Persona system**: Loads profiles but no functional plugins
- **Planning boost**: Returns mock planning data
- **Memory/knowledge graph**: All memory features are placeholder stubs
- **Advanced MCP servers**: mcp-taskmaster, mcp-scout, memory-rag not implemented
- **Multi-agent workflows**: Claims exist but no actual agents available

**What this means:** Features marked with 🎷🤖 return responses but perform no real work. This is intentional transparency - we never mislead users about functionality.

## Quick Start

```bash
# Start the server
npm start

# Test basic functionality (no API keys needed)
curl http://localhost:3001/health
curl -X POST http://localhost:3001/execute/filesystem/list_directory \
  -H "Content-Type: application/json" \
  -d '{"path": "."}'

# Add API keys for enhanced features (optional)
echo "BRAVE_API_KEY=your-key-here" >> .env
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Complete integration guide for Claude assistants
- **[API Usage Guide](./docs/API_USAGE_GUIDE.md)**: Testing without API keys
- **[Issue #36](https://github.com/norrisaftcc/tool-claude-conduit/issues/36)**: Demo-ware cleanup roadmap

## Philosophy

**VIBE**: Verify, and Inspirational Behaviors Emerge - transparent development teaches  
**FLOW**: Following Logical Work Order for systematic progress  
**FunkBot Protocol**: 🎷🤖 All simulated features clearly marked to prevent user confusion
