# Dashboard Test Suite

Comprehensive testing framework for the Streamlit Knowledge Graph Dashboard following FLOW methodology.

## Quick Start

```bash
# From dashboard directory
source venv/bin/activate

# Run all unit tests
python -m pytest tests/unit/ -v

# Run integration tests (requires services)
RUN_INTEGRATION_TESTS=1 python -m pytest tests/integration/ -v

# Run legacy comprehensive test
python test_dashboard.py --verbose
```

## Test Structure

```
tests/
├── README.md              # This file - testing instructions
├── unit/                  # Unit tests (no external dependencies)
│   ├── test_neo4j_connection.py     # Database connection logic
│   ├── test_claude_conduit_client.py # HTTP client functionality
│   └── test_visualizations.py       # Chart and graph generation
└── integration/           # Integration tests (require real services)
    └── test_services.py   # End-to-end service connectivity
```

## Test Categories

### Unit Tests (`tests/unit/`)

**No external dependencies required** - all services are mocked.

- **Neo4j Connection Tests**: Database connectivity, query execution, statistics
- **Claude Conduit Client Tests**: HTTP API calls, error handling, tool execution  
- **Visualizations Tests**: Chart generation, data processing, color mapping

```bash
# Run individual unit test files
python tests/unit/test_neo4j_connection.py
python tests/unit/test_claude_conduit_client.py
python tests/unit/test_visualizations.py

# Run all unit tests with pytest
python -m pytest tests/unit/ -v
```

### Integration Tests (`tests/integration/`)

**Requires actual services running** - tests real connectivity.

- **Service Integration**: Live Neo4j database and claude-conduit server
- **End-to-End Workflows**: Full dashboard functionality with real data

```bash
# Start required services first
brew services start neo4j        # Neo4j database
cd .. && npm start               # claude-conduit server

# Run integration tests
RUN_INTEGRATION_TESTS=1 python tests/integration/test_services.py
RUN_INTEGRATION_TESTS=1 python -m pytest tests/integration/ -v
```

## Prerequisites

### For Unit Tests
- Python virtual environment with dependencies installed
- No external services required

### For Integration Tests
- **Neo4j Database**: `brew services start neo4j`
- **claude-conduit Server**: `cd .. && npm start`
- Environment variable: `RUN_INTEGRATION_TESTS=1`

## Running Tests

### Using pytest (Recommended)
```bash
# Install pytest if not available
pip install pytest

# Run specific test categories
python -m pytest tests/unit/ -v                    # Unit tests only
python -m pytest tests/integration/ -v             # Integration tests only
python -m pytest tests/ -v                         # All tests

# Run with coverage (if pytest-cov installed)
python -m pytest tests/unit/ --cov=. --cov-report=html
```

### Using unittest (Built-in)
```bash
# Run individual test files
python tests/unit/test_neo4j_connection.py
python tests/integration/test_services.py

# Run test discovery
python -m unittest discover tests/unit/ -v
python -m unittest discover tests/integration/ -v
```

### Using test-runner.sh (Legacy)
```bash
# Comprehensive test with setup
./test-runner.sh test

# Unit tests only
./test-runner.sh test --unit-only

# Manual verification checklist
./test-runner.sh test --manual
```

## Test Environment Setup

### Automated Setup
```bash
# Creates virtual environment and installs dependencies
./test-runner.sh setup
```

### Manual Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install test dependencies (optional)
pip install pytest pytest-cov
```

## Writing New Tests

### Unit Test Template
```python
import unittest
import sys
import os
from unittest.mock import Mock, patch

# Add dashboard to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from your_module import YourClass

class TestYourClass(unittest.TestCase):
    def setUp(self):
        self.mock_dependency = Mock()
        self.instance = YourClass(self.mock_dependency)
    
    def test_your_functionality(self):
        # Arrange
        self.mock_dependency.method.return_value = "expected"
        
        # Act
        result = self.instance.your_method()
        
        # Assert
        self.assertEqual(result, "expected")
        self.mock_dependency.method.assert_called_once()

if __name__ == "__main__":
    unittest.main()
```

### Integration Test Template
```python
import unittest
import os

class TestYourIntegration(unittest.TestCase):
    @unittest.skipUnless(os.getenv('RUN_INTEGRATION_TESTS'), "Integration tests disabled")
    def test_real_service(self):
        # Test with real external service
        pass
```

## Continuous Integration

### GitHub Actions (Future)
```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: python -m pytest tests/unit/ -v
  
- name: Run Integration Tests  
  run: RUN_INTEGRATION_TESTS=1 python -m pytest tests/integration/ -v
  env:
    NEO4J_URI: bolt://localhost:7687
```

### Local CI Simulation
```bash
# Simulate CI pipeline
make ci-test

# Or manually
python -m pytest tests/unit/ -v --tb=short
```

## Debugging Tests

### Verbose Output
```bash
python -m pytest tests/unit/ -v -s    # Show print statements
python tests/unit/test_neo4j_connection.py -v
```

### Debug Mode
```bash
# Run single test with pdb
python -m pytest tests/unit/test_neo4j_connection.py::TestNeo4jConnection::test_connection_initialization -v -s --pdb
```

### Mock Debugging
```python
# In test methods
print(f"Mock calls: {self.mock_dependency.method.call_args_list}")
self.mock_dependency.method.assert_called_with(expected_arg)
```

## Test Coverage

### Generate Coverage Report
```bash
# Install coverage tool
pip install pytest-cov

# Run with coverage
python -m pytest tests/unit/ --cov=. --cov-report=html

# View report
open htmlcov/index.html
```

### Coverage Goals
- **Unit Tests**: >90% code coverage
- **Integration Tests**: Critical path coverage
- **Manual Tests**: UI/UX verification

## Educational Philosophy

These tests follow the **FLOW methodology**:

1. **LEARN**: Understanding through reading test specifications
2. **UNDERSTAND**: Analyzing what each test validates  
3. **PLAN**: Designing test cases systematically
4. **EXECUTE**: Running tests and interpreting results
5. **VERIFY**: Confirming all functionality works
6. **DOCUMENT**: Recording findings and improvements

**VIBE**: Verify, and Inspirational Behaviors Emerge - transparent testing creates learning opportunities for interns and team members.

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure virtual environment is activated
2. **Service Unavailable**: Check if Neo4j/claude-conduit are running
3. **Permission Errors**: Use virtual environment, not system Python
4. **Mock Failures**: Check mock setup in setUp() method

### Getting Help

```bash
./test-runner.sh help          # Test runner options
python -m pytest --help       # pytest options  
python -m unittest --help     # unittest options
```