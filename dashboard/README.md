# Knowledge Graph Dashboard

A simple, interactive web dashboard for visualizing and exploring the Tool Claude Conduit knowledge graph.

## Quick Start

```bash
# 1. Automated setup (recommended)
./test-runner.sh setup

# 2. Start the dashboard
./test-runner.sh run
```

The dashboard opens at http://localhost:8501

## What You Can Do

- **📊 Explore Knowledge Graphs**: Interactive network visualizations
- **🔄 View Process Flows**: PR workflows and agent coordination
- **📈 Check Analytics**: System metrics and growth tracking  
- **🔍 Run Queries**: Execute custom database queries
- **🛠️ Use MCP Tools**: Access advanced AI capabilities
- **📋 Plan Tasks**: FLOW methodology with AI assistance

## Requirements

- **Python 3.8+**
- **Optional**: Neo4j database (for graph features)
- **Optional**: claude-conduit server (for MCP features)

## Installation

### Easy Way (Uses Virtual Environment)
```bash
./test-runner.sh setup
```

### Manual Way
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running

### Easy Way
```bash
./test-runner.sh run
```

### Manual Way
```bash
source venv/bin/activate
streamlit run app.py
```

## Testing

```bash
# Run all tests
./test-runner.sh test

# Just check if everything works
./test-runner.sh check

# See what you should test manually
./test-runner.sh test --manual
```

## Optional Services

The dashboard works standalone, but features improve with services:

**Neo4j Database** (for graph features):
```bash
brew install neo4j
brew services start neo4j
```

**claude-conduit Server** (for AI features):
```bash
cd .. && npm start
```

## Configuration

Set these if using non-default values:
```bash
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j" 
export NEO4J_PASSWORD="password"
export CONDUIT_URL="http://localhost:3001"
```

## Help

```bash
./test-runner.sh help    # See all options
make help                # See make targets
```

## Files

- `app.py` - Main dashboard application
- `test-runner.sh` - Setup, testing, and run script
- `requirements.txt` - Python dependencies
- `venv/` - Virtual environment (auto-created, not in git)

## Educational Philosophy

This dashboard follows the **FLOW methodology** (Following Logical Work Order) and **VIBE system** (Verify, and Inspirational Behaviors Emerge) - making development transparent and teachable.