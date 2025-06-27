# Claude Conduit Tests

Simple test suite for Claude Conduit's Neo4j integration.

## Quick Start

### 1. Check Your Setup
```bash
./check-setup.sh
```

This will verify:
- Node.js is installed
- Environment file exists
- Dependencies are installed

### 2. Run All Tests
```bash
./run-tests.sh
```

This runs all test suites automatically.

## Manual Test Running

If you prefer to run tests individually:

```bash
# From project root
node tests/test-neo4j.js              # Test Neo4j connection
node tests/test-graph-query.js        # Test graph queries
node tests/test-issue-graph.js        # Test issue integration
node tests/test-real-mcp.js           # Test MCP servers
```

## Setup Requirements

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your Neo4j credentials to .env:**
   - NEO4J_URI (your database URI)
   - NEO4J_USERNAME (usually "neo4j")
   - NEO4J_PASSWORD (your database password)

3. **Install dependencies:**
   ```bash
   npm install
   ```

## What Each Test Does

- **test-neo4j.js**: Verifies database connection and basic operations
- **test-graph-query.js**: Tests knowledge graph query functionality
- **test-issue-graph.js**: Tests GitHub issue to graph conversion
- **test-real-mcp.js**: Tests Model Context Protocol integration

## Troubleshooting

If tests fail:

1. Check your .env file has correct Neo4j credentials
2. Ensure your Neo4j database is running and accessible
3. Run `npm install` to ensure all dependencies are installed
4. Check the error messages for specific issues

## Manual Database Verification

To verify data directly in Neo4j:

1. Go to your Neo4j Browser
2. Use queries from `neo4j-queries.md`
3. Start with simple queries like:
   ```cypher
   MATCH (n:Knowledge) RETURN n LIMIT 25
   ```

See [neo4j-queries.md](./neo4j-queries.md) for a complete list of verification queries.

## Expected Output

Successful tests will show:
- ✅ Green checkmarks for passed tests
- Connection confirmations
- Sample data operations
- "All tests passed!" message

Failed tests will show:
- ❌ Red X marks
- Error messages explaining the issue