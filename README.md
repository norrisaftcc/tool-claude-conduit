# Claude Conduit

**Version 2.0.0 - "The Honest Release"**

A lightweight HTTP-to-MCP bridge that provides Claude Code with filesystem operations and web search capabilities. Simple, focused, and completely transparent about what it actually does.

## What It Actually Does

This is an HTTP server that bridges Claude Code to Model Context Protocol (MCP) servers. Nothing more, nothing less.

### Real Features (Verified Working)
- **Filesystem operations**: Read, write, and list directory contents via MCP
- **Web search**: Brave Search integration when API key is provided
- **Health monitoring**: Simple endpoint to verify server status
- **Tool discovery**: Lists available MCP tools and their capabilities
- **Educational quotes**: FLOW methodology fortune system (45+ quotes)

### What It Doesn't Do
No artificial intelligence, no planning systems, no personas, no memory graphs, no multi-agent orchestration. This is a straightforward HTTP-to-MCP bridge - exactly what it says on the tin.

## Quick Start

```bash
# Install and start
npm install
npm start

# Verify it works (no API keys needed)
curl http://localhost:3001/health
curl -X POST http://localhost:3001/execute/filesystem/list_directory \
  -H "Content-Type: application/json" \
  -d '{"path": "."}'

# Optional: Add Brave Search API key
echo "BRAVE_API_KEY=your-key-here" >> .env
```

## API Endpoints

- `GET /health` - Server status and basic info
- `GET /fortune` - Random educational quote from FLOW methodology
- `GET /tools` - List all available MCP tools
- `POST /execute/{server}/{tool}` - Execute MCP tool with JSON payload

### Example Usage

```bash
# Read a file
curl -X POST http://localhost:3001/execute/filesystem/read_file \
  -H "Content-Type: application/json" \
  -d '{"path": "./package.json"}'

# Search the web (requires BRAVE_API_KEY)
curl -X POST http://localhost:3001/execute/brave-search/search \
  -H "Content-Type: application/json" \
  -d '{"query": "MCP protocol documentation", "count": 3}'
```

## History

This project started as an ambitious multi-agent system with complex persona management, planning algorithms, and various AI integrations. Over time, it accumulated nearly 290,000 lines of aspirational code, most of which was either non-functional demo-ware or overly complex abstractions.

In a comprehensive cleanup effort, we stripped away everything that didn't work or wasn't needed, reducing the codebase from 290k lines to approximately 1,000 lines of honest, functional code. The result is this simple, reliable HTTP-to-MCP bridge that does exactly what it claims to do.

## Requirements

- Node.js 18+
- Optional: Brave Search API key for web search functionality

## Integration

See [CLAUDE.md](./CLAUDE.md) for complete integration guide with Claude Code.

## License

MIT - Use it, modify it, learn from it.
