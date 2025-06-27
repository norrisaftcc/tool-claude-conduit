# Feature Matrix

Complete breakdown of what actually works vs what's simulated in claude-conduit.

## Legend
- ✅ **Working**: Fully functional, tested
- ⚡ **Conditional**: Works with proper API keys/config
- 🎷🤖 **FunkBot**: Simulated response, no real functionality
- ❌ **Broken**: Claimed but not working
- 📋 **Planned**: On roadmap for future implementation

## Core Infrastructure

| Feature | Status | Description | Requirements |
|---------|--------|-------------|--------------|
| Express Server | ✅ | HTTP API with all routes | None |
| Health Checks | ✅ | Server status monitoring | None |
| Fortune System | ✅ | 45+ FLOW/VIBE educational quotes | None |
| Configuration Loading | ✅ | .env and MCP config validation | None |
| Error Handling | ✅ | Graceful degradation patterns | None |
| FunkBot Protocol | ✅ | Transparency markers for simulated features | None |

## MCP Servers

| Server | Status | Tools | Requirements |
|--------|--------|-------|--------------|
| filesystem | ✅ | read_file, write_file, list_directory | None |
| brave-search | ⚡ | search, web_search | BRAVE_API_KEY |
| github | 🎷🤖 | echo (real tools not implemented) | GITHUB_PERSONAL_ACCESS_TOKEN |
| memory | 🎷🤖 | echo (cloud storage not implemented) | CLOUD_MEMORY_URL, CLOUD_MEMORY_API_KEY |
| sqlite | 🎷🤖 | echo (database tools not implemented) | None (should work) |
| taskmaster-ai | 🎷🤖 | echo (project management not implemented) | None |
| scout | 🎷🤖 | echo (research tools not implemented) | None |

## API Endpoints

| Endpoint | Status | Functionality | Notes |
|----------|--------|---------------|-------|
| `GET /health` | ✅ | Server health and status | Always works |
| `GET /fortune` | ✅ | Educational FLOW/VIBE quotes | Random selection from 45+ quotes |
| `GET /tools` | ✅ | List available MCP servers | Shows real vs mock status |
| `GET /profiles` | 🎷🤖 | Lists persona profiles | Profiles exist but no functional plugins |
| `POST /profile/:name` | 🎷🤖 | Loads persona profile | Returns success but loads no real plugins |
| `POST /planning-boost` | 🎷🤖 | Planning assistance | Returns mock planning data |
| `POST /execute/:server/:tool` | ✅/🎷🤖 | Tool execution | Mixed: filesystem works, others simulated |

## Persona System

| Profile | Status | Claimed Plugins | Reality |
|---------|--------|-----------------|---------|
| senior-developer | 🎷🤖 | mcp-taskmaster, mcp-filesystem, mcp-scout, memory-rag, memory-graph, architecture-advisor | Only filesystem actually works |
| friday | 🎷🤖 | mcp-scout, research-summarizer, memory-rag, explanation-engine, topic-analyzer | All FunkBot stubs |
| vita | 🎷🤖 | socratic-questioner, learning-flow, memory-rag, gentle-guide, student-progress-tracker | All FunkBot stubs |
| planning-boost | 🎷🤖 | mcp-taskmaster, planning-flow | All FunkBot stubs |
| soft-skills | 🎷🤖 | mcp-taskmaster, planning-flow, memory-rag, communication-flow | All FunkBot stubs |
| python-debugging | 🎷🤖 | mcp-filesystem, python-debugger, memory-graph, stack-trace-analyzer | Only filesystem works |
| task+research | 🎷🤖 | mcp-taskmaster, mcp-scout, planning-flow, memory-rag | All FunkBot stubs |
| memory-only | 🎷🤖 | memory-rag, memory-graph | All FunkBot stubs |
| knowledge-graph | 🎷🤖 | knowledge-graph, memory-rag, claude-client | All FunkBot stubs |
| full-stack | 🎷🤖 | All available plugins | Only filesystem/brave-search work |

## Plugins (Physical Files)

| Plugin | Status | Location | Functionality |
|--------|--------|----------|---------------|
| claude-client | ✅ | /plugins/claude-client/ | Basic Claude API wrapper |
| grab-the-baton | ✅ | /plugins/grab-the-baton/ | Task handoff utility |
| knowledge-graph | ✅ | /plugins/knowledge-graph/ | Basic graph structure |
| All others | ❌ | Not implemented | Referenced in profiles but don't exist |

## Advanced Features

| Feature | Status | Description | Issue |
|---------|--------|-------------|-------|
| Multi-agent workflows | 🎷🤖 | Claims about agent coordination | No actual agents exist |
| Persistent memory | 🎷🤖 | Cloud storage and knowledge graphs | No cloud integration |
| Planning assistance | 🎷🤖 | Structured task planning | No planning logic implemented |
| Code analysis | 🎷🤖 | Advanced debugging and review | No analysis tools |
| Research capabilities | 🎷🤖 | Web research and summarization | Only basic brave-search works |

## Configuration Requirements

| Feature | Required Environment Variables | Optional |
|---------|-------------------------------|----------|
| Basic functionality | None | All core features work |
| Web search | BRAVE_API_KEY | For real search results |
| Claude API | ANTHROPIC_API_KEY | For AI features (not used yet) |
| GitHub integration | GITHUB_PERSONAL_ACCESS_TOKEN | For repo operations |
| Cloud memory | CLOUD_MEMORY_URL, CLOUD_MEMORY_API_KEY | For persistent storage |
| Neo4j | NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD | For knowledge graphs |

## Testing Matrix

| Component | No API Keys | With API Keys | Notes |
|-----------|-------------|---------------|-------|
| Filesystem | ✅ Works | ✅ Works | Always functional |
| Web search | 🎷🤖 Mock | ✅ Real results | Degrades gracefully |
| GitHub | 🎷🤖 Mock | 🎷🤖 Mock | Not implemented |
| Memory | 🎷🤖 Mock | 🎷🤖 Mock | Not implemented |
| Personas | 🎷🤖 Mock | 🎷🤖 Mock | Load but no functionality |

## Roadmap Priority

### Phase 1: Documentation (Current)
- ✅ Honest feature documentation
- ✅ FunkBot protocol implementation
- ✅ Transparent API responses

### Phase 2: Strategic Decisions
- 📋 Audit all FunkBot stubs
- 📋 Decide: Remove vs Keep-as-demo vs Implement
- 📋 Replace persona system with agent-ready foundation

### Phase 3: Implementation
- 📋 Remove non-viable features
- 📋 Implement high-value features
- 📋 Enhance demo features to be educational

### Phase 4: Quality Assurance
- 📋 FunkBot compliance tests
- 📋 End-to-end functionality tests
- 📋 Anti-FunkBot prevention framework

## Success Metrics

- **Zero misleading responses**: No user confusion about functionality
- **Transparent degradation**: Clear indicators when features are simulated
- **Maintainable architecture**: Clean separation of working vs demo code
- **Educational value**: Demo features teach rather than mislead

---

*This matrix is updated as part of Issue #36 demo-ware cleanup initiative.*