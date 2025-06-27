#!/bin/bash

# Claude Conduit Test Runner
# Simple script to run all tests

echo "🚀 Claude Conduit Test Suite"
echo "============================"
echo ""

# Check if we're in the tests directory or project root
if [ -f "run-tests.sh" ]; then
    # We're in the tests directory
    cd ..
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "❌ ERROR: No .env file found!"
    echo ""
    echo "Please create a .env file in the project root with:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then add your Neo4j credentials to the .env file."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run each test
echo "Running tests..."
echo ""

# Test 1: Neo4j Connection
echo "1️⃣ Testing Neo4j Database Connection"
echo "-----------------------------------"
node tests/test-neo4j.js
echo ""

# Test 2: Graph Queries
echo "2️⃣ Testing Graph Query Operations"
echo "--------------------------------"
node tests/test-graph-query.js
echo ""

# Test 3: Issue Graph
echo "3️⃣ Testing Issue Graph Integration"
echo "---------------------------------"
node tests/test-issue-graph.js
echo ""

# Test 4: MCP Integration
echo "4️⃣ Testing MCP Server Integration"
echo "--------------------------------"
node tests/test-real-mcp.js
echo ""

echo "✅ All tests completed!"