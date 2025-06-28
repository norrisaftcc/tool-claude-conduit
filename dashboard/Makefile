# Streamlit Dashboard Makefile
# Educational tool for interns following FLOW methodology

.PHONY: help setup test test-unit test-integration test-manual demo run clean check install

# Default target
help:
	@echo "Streamlit Dashboard - Available Commands"
	@echo "========================================"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup          - First-time environment setup"
	@echo "  make install        - Install Python dependencies"
	@echo "  make check          - Check system requirements"
	@echo ""
	@echo "Testing Commands:"
	@echo "  make test           - Run all tests (unit + integration)"
	@echo "  make test-unit      - Run unit tests only"
	@echo "  make test-integration - Run integration tests (requires services)"
	@echo "  make test-manual    - Show manual verification checklist"
	@echo ""
	@echo "Demo Commands:"
	@echo "  make demo           - Seed demo data"
	@echo "  make run            - Start dashboard server"
	@echo "  make clean          - Clean up demo data"
	@echo ""
	@echo "FLOW Methodology: Learn → Understand → Plan → Execute → Verify → Document"
	@echo "VIBE: Verify, and Inspirational Behaviors Emerge"

# Setup and installation
setup:
	@echo "🚀 Setting up dashboard environment..."
	./test-runner.sh setup

install:
	@echo "📦 Installing dependencies..."
	pip install -r requirements.txt

check:
	@echo "🔍 Checking system requirements..."
	./test-runner.sh check

# Testing targets
test: test-unit test-integration
	@echo "✅ All tests completed"

test-unit:
	@echo "🧪 Running unit tests..."
	python test_dashboard.py --verbose

test-integration:
	@echo "🔗 Running integration tests..."
	python test_dashboard.py --integration --verbose

test-manual:
	@echo "📋 Manual verification checklist..."
	python test_dashboard.py --manual

# Demo and runtime
demo:
	@echo "🎭 Seeding demo data..."
	./test-runner.sh demo

run:
	@echo "🚀 Starting dashboard..."
	./test-runner.sh run

clean:
	@echo "🧹 Cleaning up..."
	./test-runner.sh clean

# Development workflow
dev-workflow: setup demo test run
	@echo "🎯 Complete development workflow executed"

# CI/CD simulation
ci-test: install test-unit
	@echo "🏗️  CI/CD simulation complete"

# Educational targets
learn:
	@echo "📚 Learning Resources:"
	@echo "  - Streamlit: https://docs.streamlit.io/"
	@echo "  - Neo4j: https://neo4j.com/docs/"
	@echo "  - Plotly: https://plotly.com/python/"
	@echo "  - NetworkX: https://networkx.org/documentation/"

flow:
	@echo "🌊 FLOW Methodology Implementation:"
	@echo "  1. LEARN    - Research requirements (make learn)"
	@echo "  2. UNDERSTAND - Analyze codebase (make check)"
	@echo "  3. PLAN     - Design tests (make test-manual)"
	@echo "  4. EXECUTE  - Build features (make setup)"
	@echo "  5. VERIFY   - Test thoroughly (make test)"
	@echo "  6. DOCUMENT - Share knowledge (make help)"