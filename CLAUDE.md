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

This project follows professional GitHub flow:
- Issues for feature requests and bug reports
- Pull requests for all changes
- Branch protection on main
- Code review requirements
- Safe rollback capabilities

## Next Steps for Implementation

The current reference implementation needs reconstruction:
1. Recreate main server files (package.json, index.js)
2. Implement Express routes for all endpoints
3. Add MCP client integration using @modelcontextprotocol/sdk
4. Build fortune system with educational content
5. Add proper error handling and logging
6. Implement configuration file reading

The goal is to leverage these enhanced AI capabilities, especially taskmaster-ai project management, to build a superior next iteration of claude-conduit.