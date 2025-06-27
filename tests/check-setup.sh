#!/bin/bash

# Simple setup checker for Claude Conduit

echo "🔍 Checking Claude Conduit Setup"
echo "================================"
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js is installed ($(node --version))"
else
    echo "   ❌ Node.js is NOT installed"
    echo "      Please install from: https://nodejs.org/"
fi
echo ""

# Check .env file
echo "2. Checking environment file..."
if [ -f "../.env" ]; then
    echo "   ✅ .env file exists"
    
    # Check for Neo4j vars
    if grep -q "NEO4J_URI=" ../. env 2>/dev/null; then
        echo "   ✅ Neo4j URI is configured"
    else
        echo "   ❌ NEO4J_URI is missing"
    fi
    
    if grep -q "NEO4J_PASSWORD=" ../.env 2>/dev/null; then
        echo "   ✅ Neo4j password is configured"
    else
        echo "   ❌ NEO4J_PASSWORD is missing"
    fi
else
    echo "   ❌ No .env file found!"
    echo "      Run: cp .env.example .env"
    echo "      Then add your Neo4j credentials"
fi
echo ""

# Check dependencies
echo "3. Checking dependencies..."
if [ -d "../node_modules" ]; then
    echo "   ✅ Dependencies are installed"
else
    echo "   ❌ Dependencies NOT installed"
    echo "      Run: npm install (from project root)"
fi
echo ""

echo "================================"
echo "To run tests: ./run-tests.sh"