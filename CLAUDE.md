# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository aims to build the next iteration of claude-conduit, an HTTP bridge that connects Claude Code to Model Context Protocol (MCP) servers. The project enhances AI capabilities through persistent, cross-session tooling integrations.

## Reference Implementation

The `reference_implementation/` directory contains:
- **claude-conduit/**: Node.js HTTP bridge server (currently only node_modules present - main files need to be recreated)
- **guidance.md**: Comprehensive documentation of the claude-conduit system architecture and capabilities

## Architecture Overview

### Core System Components

**claude-conduit HTTP Bridge**
- Express.js server running on `localhost:3001`
- Routes: `/health`, `/tools`, `/execute/{server}/{tool}`, `/fortune`
- Integrates with MCP servers via @modelcontextprotocol/sdk
- Reads MCP configuration from `~/.config/claude/claude_desktop_config.json`

**Supported MCP Servers**
- **taskmaster-ai**: Advanced task planning and project management
- **filesystem**: Enhanced file operations and codebase analysis
- **scout**: Advanced search and research capabilities  
- **cloud-memory**: Persistent project context via Railway app (https://csi-prism-remote-mcp-production.up.railway.app/)

### Educational Framework Integration

The system implements **FLOW Methodology** (Following Logical Work Order):
1. **LEARN** - Research through scout
2. **UNDERSTAND** - Devil's advocate analysis via taskmaster-ai
3. **PLAN** - Structured breakdowns via taskmaster-ai
4. **EXECUTE** - Implementation with enhanced tools
5. **VERIFY** - Multi-agent validation
6. **DOCUMENT** - Knowledge capture to cloud-memory

**VIBE System** (Verify, and Inspirational Behaviors Emerge):
- Fortune system with 45+ educational quotes covering FLOW, SAFE framework, SOLID principles
- Transparent processes become teaching moments
- Accessible via `GET /fortune` endpoint

## Development Commands

### Starting claude-conduit Reference Implementation
```bash
cd reference_implementation/claude-conduit
npm install
npm start
```

### Health Checks
```bash
# Test claude-conduit connectivity
curl http://localhost:3001/health

# Check available MCP tools
curl http://localhost:3001/tools

# Verify cloud memory access
curl https://csi-prism-remote-mcp-production.up.railway.app/health
```

## Required Environment Variables

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
export MCP_CONFIG_PATH="~/.config/claude/claude_desktop_config.json"
export CONDUIT_PORT="3001"  # Optional
export LOG_LEVEL="info"     # Optional
```

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