# Development Workflow: FLOW Methodology in Practice

This document captures a real-world example of applying FLOW methodology to debug and fix claude-conduit basic functionality issues.

## The Problem Discovery (LEARN Phase)

### Initial Symptoms
- Claude-conduit server started successfully
- Health and fortune endpoints worked
- Tools endpoint showed connected MCP servers
- **BUT**: All tool executions returned "Mock result" instead of real data

### Discovery Process
1. **Server Status Check**: ✅ Running on port 3001
2. **Health Endpoint**: ✅ Responding correctly  
3. **Fortune System**: ✅ FLOW/VIBE wisdom working
4. **Tools Endpoint**: ✅ Shows 5 connected MCP servers
5. **Tool Execution**: ❌ Filesystem tools returning mock data
6. **Other Servers**: ❌ Degraded to "echo" tools due to missing API keys

### Key Debugging Steps
```bash
# Check server process
ps aux | grep "node.*index.js"

# Test basic endpoints
curl http://localhost:3001/health
curl http://localhost:3001/fortune
curl http://localhost:3001/tools

# Test tool execution
curl -X POST http://localhost:3001/execute/filesystem/read_file \
  -H "Content-Type: application/json" \
  -d '{"path": "/path/to/file"}'
```

### Critical Discovery
Found hardcoded mock execution in `lib/mcp-client.js:213`:
```javascript
// Mock execution for now
const result = await this.mockToolExecution(serverName, toolName, args);
```

## Root Cause Analysis (UNDERSTAND Phase)

### The Core Issue
- `executeTool` method was hardcoded to use `mockToolExecution`
- Comment indicated "replace with real MCP calls later"
- No development mode for testing without API keys
- No differentiation between servers that need API keys vs those that don't

### Architecture Understanding
- **Filesystem**: Should work without API keys
- **Brave Search, GitHub, Memory**: Require external API keys
- **SQLite**: Should work without API keys but was using echo tool

### Decision Framework
Create a hybrid approach:
- Real execution for filesystem operations (no API keys needed)
- Mock execution for servers requiring API keys (when keys missing)
- Environment variable control for testing modes

## Implementation Plan (PLAN Phase)

### GitHub Issue Created
- **Repository**: norrisaftcc/tool-claude-conduit
- **Issue #26**: "Enable basic functionality testing without API keys"
- **Priority**: High (blocks development workflow)

### Solution Design
1. **Conditional Execution Logic**: Choose between real and mock execution
2. **API Key Detection**: Identify which servers require external dependencies
3. **Filesystem Implementation**: Direct Node.js fs operations for basic tools
4. **Error Handling**: Graceful degradation and clear error messages
5. **Documentation**: Clear guidance for developers

## Code Implementation (EXECUTE Phase)

### Modified `executeTool` Method
```javascript
// Use real execution if in development mode or for specific servers
const useMock = process.env.MCP_MOCK_MODE === 'true' || 
               (serverName !== 'filesystem' && this.requiresApiKeys(serverName));

const result = useMock 
  ? await this.mockToolExecution(serverName, toolName, args)
  : await this.realToolExecution(serverName, toolName, args);
```

### Added Helper Methods
- `requiresApiKeys(serverName)`: Identifies servers needing external APIs
- `realToolExecution(serverName, toolName, args)`: Routes to actual implementations
- `executeFilesystemTool(toolName, args)`: Direct fs operations

### Filesystem Tool Implementation
- **read_file**: `fs.readFileSync()` with error handling
- **write_file**: `fs.writeFileSync()` with validation
- **list_directory**: `fs.readdirSync()` with file type detection

## Testing and Verification (VERIFY Phase)

### Before Fix
```json
{
  "result": "Mock result from filesystem/read_file",
  "timestamp": "2025-06-26T23:37:53.662Z"
}
```

### After Fix
```json
{
  "result": {
    "content": "{\n  \"name\": \"claude-conduit\",\n  \"version\": \"2.0.0\",..."
  },
  "executionTime": 1
}
```

### Test Cases Verified
- ✅ Filesystem read_file returns actual file content
- ✅ Filesystem list_directory returns real directory entries
- ✅ API-dependent servers still use mock mode gracefully
- ✅ Error handling for invalid paths/arguments
- ✅ Server startup and connectivity unchanged

## Knowledge Capture (DOCUMENT Phase)

### Lessons Learned

#### 1. Multi-Repository Workflow Challenges
- Security boundaries: Claude Code can only access child directories
- Solution: Start from parent directory containing both repos
- Documentation is critical for knowledge transfer

#### 2. FLOW Methodology Application
- **LEARN**: Systematic problem discovery prevented assumptions
- **UNDERSTAND**: Root cause analysis saved time vs trial-and-error
- **PLAN**: GitHub issue provided clear problem statement
- **EXECUTE**: Incremental implementation with testing
- **VERIFY**: Real-world testing confirmed fix
- **DOCUMENT**: This document enables future developers

#### 3. Development Best Practices
- Always test the "happy path" first (basic functionality)
- Mock vs real execution should be configurable
- Clear error messages guide users to solutions
- Documentation should include both what and why

### Future Considerations
- Add environment variable documentation
- Implement SQLite real execution
- Create development setup guide
- Add integration tests for all modes

### Educational Value
This debugging process demonstrates:
- Systematic problem-solving methodology
- Multi-repository coordination
- Graceful degradation patterns
- Documentation-driven development
- Knowledge transfer for AI assistants

## For Teaching Claude to Use Tools

### Key Principles
1. **Start Simple**: Test basic functionality before complex features
2. **Document Process**: Capture both successes and failures
3. **Provide Context**: Include repository structure and dependencies
4. **Clear Examples**: Show both curl commands and expected responses
5. **Iterative Testing**: Build confidence step by step

### Recommended Approach
```bash
# 1. Verify server is running
curl http://localhost:3001/health

# 2. Check available tools
curl http://localhost:3001/tools

# 3. Test basic functionality
curl -X POST http://localhost:3001/execute/filesystem/list_directory \
  -H "Content-Type: application/json" \
  -d '{"path": "."}'

# 4. Test file operations
curl -X POST http://localhost:3001/execute/filesystem/read_file \
  -H "Content-Type: application/json" \
  -d '{"path": "./package.json"}'
```

This workflow ensures Claude can learn to use tools effectively while they're being developed.