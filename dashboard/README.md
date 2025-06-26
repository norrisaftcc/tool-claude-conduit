# Streamlit Knowledge Graph Dashboard

Interactive visualization dashboard for Tool Claude Conduit's knowledge graph, integrating with both Neo4j and claude-conduit's MCP capabilities.

## Features

### Core Visualizations
- **Knowledge Graph Explorer**: Interactive network visualization with filtering and search
- **Process Flow Diagrams**: Sankey diagrams for PR workflows and agent coordination
- **Analytics Dashboard**: Graph metrics, growth tracking, and usage patterns
- **Query Explorer**: Execute custom Cypher queries with predefined templates

### MCP Integration (via claude-conduit)
- **MCP Tools Explorer**: Browse and execute available MCP server tools
- **Task Planning**: FLOW methodology implementation with taskmaster-ai
- **Cloud Memory**: Persistent storage for plans and insights
- **Live Status**: Real-time claude-conduit connection monitoring

## Prerequisites

1. **Neo4j Database** running on localhost:7687
2. **claude-conduit** server running on localhost:3001
3. **Python 3.8+** with pip

## Installation

```bash
cd dashboard
pip install -r requirements.txt
```

## Configuration

Set environment variables (optional):
```bash
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="password"
export CONDUIT_URL="http://localhost:3001"
```

## Running the Dashboard

```bash
streamlit run app.py
```

The dashboard will open at http://localhost:8501

## Usage Guide

### Knowledge Graph Visualization
1. Select node and relationship types to display
2. Adjust layout (Force-directed, Hierarchical, etc.)
3. Use search to find specific nodes
4. Click nodes for details

### MCP Tools
1. Ensure claude-conduit is running
2. Navigate to "MCP Tools" page
3. Browse available servers and tools
4. Execute tools with JSON payloads

### Task Planning
1. Navigate to "Task Planning" page
2. Enter task description
3. Generate FLOW plan or get planning boost
4. Save plans to cloud memory

## Architecture

- **app.py**: Main Streamlit application
- **neo4j_connection.py**: Neo4j database interface
- **visualizations.py**: Graph visualization components
- **claude_conduit.py**: HTTP client for claude-conduit integration

## Demo Use Cases

As specified in issue #20:
- PR Workflow tracking
- Project Dependencies visualization
- Knowledge Discovery
- Multi-Agent Coordination

## Development

To extend the dashboard:
1. Add new visualization types in `visualizations.py`
2. Add new pages in `app.py`
3. Extend claude-conduit integration for new MCP servers