# API Usage Guide: Testing Claude-Conduit Without API Keys

This guide explains how to test claude-conduit functionality without requiring external API keys.

## Quick Start

### 1. Start the Server
```bash
npm start
```

Server will start on `http://localhost:3001` with warnings about missing API keys (this is expected).

### 2. Test Basic Connectivity
```bash
# Health check
curl http://localhost:3001/health

# Get FLOW wisdom
curl http://localhost:3001/fortune

# List available tools
curl http://localhost:3001/tools
```

### 3. Test Filesystem Operations (No API Keys Required)

#### Read a File
```bash
curl -X POST http://localhost:3001/execute/filesystem/read_file \
  -H "Content-Type: application/json" \
  -d '{"path": "./package.json"}'
```

#### List Directory Contents
```bash
curl -X POST http://localhost:3001/execute/filesystem/list_directory \
  -H "Content-Type: application/json" \
  -d '{"path": "."}'
```

#### Write a File
```bash
curl -X POST http://localhost:3001/execute/filesystem/write_file \
  -H "Content-Type: application/json" \
  -d '{"path": "./test.txt", "content": "Hello from claude-conduit!"}'
```

## Server Modes

### Development Mode (Default)
- **Filesystem tools**: Real operations using Node.js fs module
- **API-dependent tools**: Mock responses (graceful degradation)
- **No API keys required** for basic testing

### Mock Mode (Optional)
```bash
export MCP_MOCK_MODE=true
npm start
```
All tools return mock responses (useful for testing the API structure).

## Expected Responses

### Successful Filesystem Operation
```json
{
  "status": "success",
  "result": {
    "success": true,
    "server": "filesystem",
    "tool": "read_file",
    "args": {"path": "./package.json"},
    "result": {
      "content": "{\n  \"name\": \"claude-conduit\",\n  \"version\": \"2.0.0\",..."
    },
    "timestamp": "2025-06-26T23:46:14.879Z",
    "executionTime": 1
  },
  "server": "filesystem",
  "tool": "read_file",
  "executedVia": "mcp",
  "timestamp": "2025-06-26T23:46:14.880Z"
}
```

### FunkBot Stub Response (Simulated) 🎷🤖
```json
{
  "status": "success",
  "result": {
    "success": true,
    "server": "brave-search",
    "tool": "echo",
    "args": {"query": "test"},
    "result": "Mock result from brave-search/echo",
    "timestamp": "2025-06-26T23:37:53.662Z",
    "executionTime": 234,
    "white_rabbit": {
      "is_simulated": true,
      "reason": "missing_api_key",
      "warning": "🎷🤖 SIMULATED RESULT - This is mock data, not real output",
      "guidance": "Add BRAVE_API_KEY to .env file for real web search"
    }
  },
  "white_rabbit": {
    "is_simulated": true,
    "reason": "missing_api_key",
    "server_status": "degraded"
  },
  "executedVia": "mcp"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Tool list_directory not found on server filesystem"
}
```

## Tools by Server

### Filesystem (✅ Works without API keys)
- `read_file` - Read file contents
- `write_file` - Write file contents  
- `list_directory` - List directory entries

### Brave Search (⚡ Conditional - Requires BRAVE_API_KEY)
- `search`, `web_search` - Real web search with API key
- `echo` - FunkBot stub 🎷🤖 when API key missing

### GitHub (🎷🤖 FunkBot Stub - Not Implemented)
- `echo` - FunkBot stub regardless of API key
- **Status**: GitHub integration not implemented yet

### SQLite (🎷🤖 FunkBot Stub - Not Implemented)
- `echo` - FunkBot stub (should work without APIs but not implemented)
- **Status**: Database operations need implementation

### Memory (🎷🤖 FunkBot Stub - Not Implemented)
- `echo` - FunkBot stub regardless of API keys
- **Status**: Cloud storage integration not implemented

### Advanced MCP Servers (🎷🤖 All FunkBot Stubs)
- `taskmaster-ai` - Project management (not implemented)
- `scout` - Research tools (not implemented)
- All return `echo` responses with FunkBot metadata

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill existing process if needed
pkill -f "node.*index.js"

# Restart
npm start
```

### FunkBot Stubs Instead of Real Data
- **Filesystem tools**: Should return real data (if getting FunkBot stubs, file a bug)
- **API-dependent tools**: Expected to show FunkBot stubs 🎷🤖 without API keys
- **Check FunkBot metadata** in responses for transparency information
- **Check server logs** for configuration issues

### Permission Errors
```bash
# Make sure the path is accessible
ls -la /path/to/file

# Check that claude-conduit process has read permissions
```

## For Developers

### Adding New Tools
1. Identify if the tool requires external API keys
2. Add to `requiresApiKeys()` method if needed
3. Implement real execution in appropriate method
4. Test both with and without API keys
5. Update this documentation

### Testing Your Changes
```bash
# Test basic functionality
curl http://localhost:3001/health

# Test new tool
curl -X POST http://localhost:3001/execute/your-server/your-tool \
  -H "Content-Type: application/json" \
  -d '{"your": "arguments"}'
```

This approach ensures claude-conduit can be developed and tested incrementally, with transparent FunkBot stubs 🎷🤖 for unimplemented features. Users are never misled about functionality.

## FunkBot Protocol 🎷🤖

All simulated features include FunkBot metadata:
- `white_rabbit.is_simulated: true` indicates mock data
- `white_rabbit.reason` explains why it's simulated
- `white_rabbit.guidance` provides setup instructions
- HTTP headers include `X-Claude-Conduit-Mode: simulation`

This transparency ensures users understand what's real vs demo.