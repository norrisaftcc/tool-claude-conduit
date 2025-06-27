# Claude Integration Guide

This document explains how to use claude-conduit as a Claude assistant and provides the essential workflow for getting started.

## Quick Activation

### 1. Start Claude-Conduit
```bash
cd tool-claude-conduit
npm start
```

Server starts on `http://localhost:3001`

### 2. Verify Everything Works
```bash
# Health check
curl http://localhost:3001/health

# Test basic functionality (no API keys needed)
curl -X POST http://localhost:3001/execute/filesystem/list_directory \
  -H "Content-Type: application/json" \
  -d '{"path": "."}'
```

### 3. Add API Keys (Optional)
```bash
# Add to .env file (never commit this!)
echo "BRAVE_API_KEY=your-key-here" >> .env
echo "ANTHROPIC_API_KEY=sk-ant-api03-your-key" >> .env
```

## What Claude Can Do

### ✅ Works Without API Keys
- **Filesystem operations**: Read, write, list directory contents
- **Server management**: Health checks, tool discovery
- **Basic testing**: Verify claude-conduit functionality

### ⚡ Enhanced With API Keys
- **Web search**: Real Brave Search results
- **Claude API**: Advanced reasoning capabilities
- **Full tool suite**: All MCP servers operational

## Workflow for Claude Assistants

### When Checking In With Claude-Conduit

1. **Always verify server status first**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test basic functionality**:
   ```bash
   curl http://localhost:3001/tools
   ```

3. **Use real examples** for testing:
   ```bash
   # Test filesystem
   curl -X POST http://localhost:3001/execute/filesystem/read_file \
     -H "Content-Type: application/json" \
     -d '{"path": "./package.json"}'
   
   # Test web search (if API key available)
   curl -X POST http://localhost:3001/execute/brave-search/search \
     -H "Content-Type: application/json" \
     -d '{"query": "your search terms", "count": 3}'
   ```

## Development Status

### ✅ Fully Functional
- Filesystem tools (read_file, write_file, list_directory)
- Brave Search integration
- Health monitoring
- FLOW methodology fortune system

### 🐰 SIMULATED (Demo-ware)
- Persona system (all plugins are placeholders)
- Memory/knowledge graph features
- Advanced planning tools

See Issues #30-32 for cleanup roadmap.

## Common Issues

### Server Won't Start
```bash
# Kill existing process
pkill -f "node.*index.js"

# Restart
npm start
```

### Getting Mock Results
- **Expected**: For tools requiring API keys when keys are missing
- **Problem**: If filesystem tools return mocks (file a bug)

### Permission Errors
- Ensure claude-conduit has read/write access to target paths
- Check file permissions: `ls -la /path/to/file`

## Architecture

```
Claude Assistant → HTTP API → MCP Client → MCP Servers → Real Tools
                            └─ Graceful → Mock Tools (when needed)
```

### Educational Framework Integration

The system implements **FLOW Methodology** (Following Logical Work Order):
1. **LEARN** - Research and discovery
2. **UNDERSTAND** - Analysis and planning
3. **PLAN** - Structured task breakdown
4. **EXECUTE** - Implementation with testing
5. **VERIFY** - Validation and review
6. **DOCUMENT** - Knowledge capture

**VIBE System** (Verify, and Inspirational Behaviors Emerge):
- Fortune system with 45+ educational quotes covering FLOW, SAFE framework, SOLID principles
- Transparent processes become teaching moments
- Accessible via `GET /fortune` endpoint

## For Human Developers

This is the same system your Claude assistant uses. The workflow is designed to be:
- **Consistent**: Same commands work for humans and AI
- **Transparent**: Clear distinction between real and simulated features
- **Incremental**: Works without all dependencies configured

## References

- **API Usage Guide**: `docs/API_USAGE_GUIDE.md`
- **Development Workflow**: `docs/DEVELOPMENT_WORKFLOW.md`
- **Issues**: See GitHub Issues for known limitations
- **White Rabbit Protocol**: 🐰 emoji marks all simulated features

---

*This guide ensures consistent claude-conduit usage across all Claude instances and human developers.*

## Key Implementation Patterns

### MCP Server Execution
POST requests to `/execute/{server}/{tool}` with JSON payloads enable tool execution across different MCP servers.

### Persistent Context
The cloud-memory server maintains hierarchical project data, learning objectives, and methodology progress across sessions.

### Multi-Agent Workflows
- Devil's advocate analysis for assumption validation
- Enhanced code review with security and educational assessment  
- FLOW methodology automation across all development phases

## Development Workflow

This project follows professional GitHub flow with **FLOW Methodology** integration:

### **GitHub Flow Process**
- Issues for feature requests and bug reports
- Feature branches for all changes (`feature/issue-name`)
- Pull requests with comprehensive testing
- Code review requirements and feedback iteration
- Branch protection on main with safe rollback capabilities

### **FLOW Methodology Implementation**

**Following Logical Work Order** - systematic approach to all development:

1. **LEARN** 📚
   - Research issue requirements thoroughly
   - Use `Task` tool for codebase exploration
   - Check existing patterns and conventions
   - Review related issues and documentation

2. **UNDERSTAND** 🧠  
   - Analyze integration points with existing code
   - Identify dependencies and potential conflicts
   - Plan architecture and component interactions
   - Consider graceful degradation patterns

3. **PLAN** 📋
   - Create comprehensive TodoWrite breakdown
   - Design test strategy (unit + integration + manual)
   - Plan incremental implementation approach
   - Consider security and production readiness

4. **EXECUTE** ⚡
   - Implement features incrementally with testing
   - Follow established code conventions and patterns
   - Commit frequently with meaningful messages
   - Address code review feedback iteratively

5. **VERIFY** ✅
   - Comprehensive test coverage (unit + integration)
   - Manual testing with real dependencies
   - Security review (secrets, environments, permissions)
   - Performance and error handling validation

6. **DOCUMENT** 📚
   - Update README and inline documentation
   - Capture lessons learned and future work
   - Create educational content following VIBE principles
   - Ensure intern-friendly onboarding materials

### **Tool Integration Best Practices**

**TodoWrite/TodoRead Usage:**
- Start every significant task with TodoWrite planning
- Update todo status in real-time as work progresses
- Mark tasks completed immediately upon finishing
- Only have ONE task in_progress at any time

**Testing Framework:**
- Unit tests with proper mocking for isolated testing
- Integration tests for service connectivity
- Manual verification checklists for user experience
- Test-driven development when possible

**Code Review Workflow:**
- Address all review feedback systematically
- Test fixes thoroughly before marking resolved
- Commit improvements with clear explanations
- Maintain respectful, educational dialogue

**Security and Production Readiness:**
- Comprehensive .gitignore for secrets and environments
- Graceful degradation for optional dependencies
- Clear error messages and helpful guidance
- Performance considerations and resource management

## Next Steps for Implementation

The current reference implementation needs reconstruction:
1. Recreate main server files (package.json, index.js)
2. Implement Express routes for all endpoints
3. Add MCP client integration using @modelcontextprotocol/sdk
4. Build fortune system with educational content
5. Add proper error handling and logging
6. Implement configuration file reading

The goal is to leverage these enhanced AI capabilities, especially taskmaster-ai project management, to build a superior next iteration of claude-conduit.