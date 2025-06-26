# Dashboard Testing Guide

This guide follows the FLOW methodology for systematic testing of the Streamlit Knowledge Graph Dashboard.

## Quick Start

```bash
# Complete setup and test workflow
make setup
make test
make run
```

## Testing Philosophy

Following **FLOW** (Following Logical Work Order):
1. **LEARN** - Understand requirements and dependencies
2. **UNDERSTAND** - Analyze system architecture 
3. **PLAN** - Design comprehensive test strategy
4. **EXECUTE** - Run automated and manual tests
5. **VERIFY** - Validate all functionality works
6. **DOCUMENT** - Record findings and improvements

## Test Categories

### 1. Unit Tests (`make test-unit`)

Tests individual components in isolation:

- **Neo4j Connection**: Database connectivity and query execution
- **Claude Conduit Client**: HTTP API integration and error handling
- **Graph Visualizer**: Chart generation and data processing
- **Streamlit App**: Component initialization and configuration

```bash
# Run unit tests
python test_dashboard.py --verbose

# Or using make
make test-unit
```

### 2. Integration Tests (`make test-integration`)

Tests service integration with real dependencies:

- **End-to-end Neo4j**: Real database operations
- **End-to-end Claude Conduit**: Live API calls
- **Service Health Checks**: Connectivity validation

```bash
# Requires services running
make test-integration

# Or with environment variable
RUN_INTEGRATION_TESTS=1 python test_dashboard.py --integration
```

### 3. Manual Verification (`make test-manual`)

Human-verified functionality checklist:

- [ ] Dashboard loads without errors
- [ ] All navigation pages work
- [ ] Interactive visualizations render
- [ ] MCP tools integration functions
- [ ] Error handling for offline services

```bash
make test-manual
```

## Environment Setup

### Prerequisites

1. **Python 3.8+** with pip
2. **Node.js** for claude-conduit
3. **Neo4j** database (optional for unit tests)

### Installation

```bash
# Automated setup
make setup

# Manual setup
pip install -r requirements.txt
```

### Service Dependencies

```bash
# Start Neo4j
brew services start neo4j
# Or use Neo4j Desktop

# Start claude-conduit
cd .. && npm start
```

## Test Runner Scripts

### Shell Test Runner (`./test-runner.sh`)

Educational shell script with comprehensive features:

```bash
./test-runner.sh setup      # Environment setup
./test-runner.sh check      # Health checks
./test-runner.sh demo       # Seed demo data
./test-runner.sh test       # Full test suite
./test-runner.sh run        # Start dashboard
./test-runner.sh clean      # Cleanup
```

### Python Test Suite (`./test_dashboard.py`)

Comprehensive unit and integration tests:

```bash
python test_dashboard.py --verbose      # Unit tests
python test_dashboard.py --integration  # Integration tests  
python test_dashboard.py --manual       # Verification checklist
```

## Demo Data

The test suite includes demo data seeding for realistic testing:

```bash
# Seed demo data
make demo

# Clean demo data
make clean
```

Demo data includes:
- Sample Pull Requests
- Agent entities
- Task relationships
- Workflow connections

## Continuous Integration

Simulate CI/CD pipeline:

```bash
# CI simulation (no external services)
make ci-test

# Full development workflow
make dev-workflow
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Run `make install` to install dependencies
2. **Service Connection**: Use `make check` to verify services
3. **Port Conflicts**: Use `./test-runner.sh run --port 8502`

### Debug Mode

```bash
# Verbose test output
python test_dashboard.py --verbose

# Shell script with verbose output  
./test-runner.sh test --verbose
```

### Manual Service Checks

```bash
# Check Neo4j
nc -z localhost 7687

# Check claude-conduit
curl http://localhost:3001/health

# Check Streamlit port
lsof -i :8501
```

## Test Coverage

### Unit Test Coverage
- ✅ Neo4j connection handling
- ✅ HTTP client functionality  
- ✅ Data processing logic
- ✅ Error handling
- ✅ Configuration management

### Integration Test Coverage
- ✅ Real database connectivity
- ✅ Live API integration
- ✅ Service health validation
- ✅ End-to-end workflows

### Manual Test Coverage
- ✅ User interface functionality
- ✅ Interactive features
- ✅ Visual rendering
- ✅ Error user experience

## Best Practices

### For Interns

1. **Always run tests before commits**
2. **Use the test runner for consistency**  
3. **Follow FLOW methodology**
4. **Document any new test cases**
5. **Verify manual checklist items**

### For Maintainers

1. **Keep tests updated with features**
2. **Maintain educational value**
3. **Ensure tests are self-documenting**
4. **Provide clear error messages**
5. **Make testing approachable for beginners**

## Educational Resources

- [Streamlit Testing Guide](https://docs.streamlit.io/knowledge-base/tutorials/databases)
- [Neo4j Testing Best Practices](https://neo4j.com/docs/operations-manual/current/testing/)
- [Python Unit Testing](https://docs.python.org/3/library/unittest.html)
- [Integration Testing Patterns](https://martinfowler.com/articles/practical-test-pyramid.html)

Remember: **VIBE** - Verify, and Inspirational Behaviors Emerge. Transparent testing creates learning opportunities!