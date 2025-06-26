#!/bin/bash

# Streamlit Dashboard Test Runner
# Educational tool for interns to easily test the knowledge graph dashboard
# Following FLOW methodology: Learn, Understand, Plan, Execute, Verify, Document

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DASHBOARD_DIR="$SCRIPT_DIR"
CONDUIT_URL="http://localhost:3001"
NEO4J_URL="bolt://localhost:7687"
STREAMLIT_PORT="8501"

# Educational banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║          Streamlit Dashboard Test Runner v1.0               ║"
    echo "║                                                              ║"
    echo "║  FLOW Methodology: Following Logical Work Order              ║"
    echo "║  VIBE: Verify, and Inspirational Behaviors Emerge           ║"
    echo "║                                                              ║"
    echo "║  This tool helps interns test the knowledge graph dashboard ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

# Help function
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup        Set up environment and dependencies"
    echo "  check        Check system requirements and service health"
    echo "  demo         Seed demo data for testing"
    echo "  run          Start the dashboard (default)"
    echo "  test         Run comprehensive tests"
    echo "  clean        Clean up demo data and reset environment"
    echo "  help         Show this help message"
    echo ""
    echo "Options:"
    echo "  --no-deps    Skip dependency installation"
    echo "  --port PORT  Set Streamlit port (default: 8501)"
    echo "  --verbose    Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 setup              # First-time setup"
    echo "  $0 check              # Health check"
    echo "  $0 run --port 8502    # Run on different port"
    echo "  $0 test --verbose     # Full test with verbose output"
}

# Environment validation
check_python() {
    log_step "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        log_success "Python $PYTHON_VERSION found"
        return 0
    else
        log_error "Python 3 not found. Please install Python 3.8+"
        return 1
    fi
}

check_pip() {
    log_step "Checking pip installation..."
    if command -v pip3 &> /dev/null; then
        log_success "pip3 found"
        return 0
    elif command -v pip &> /dev/null; then
        log_success "pip found"
        return 0
    else
        log_error "pip not found. Please install pip"
        return 1
    fi
}

check_node() {
    log_step "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js $NODE_VERSION found"
        return 0
    else
        log_warning "Node.js not found. claude-conduit requires Node.js"
        return 1
    fi
}

# Service health checks
check_neo4j() {
    log_step "Checking Neo4j connection..."
    if command -v nc &> /dev/null; then
        if nc -z localhost 7687 2>/dev/null; then
            log_success "Neo4j is running on port 7687"
            return 0
        else
            log_warning "Neo4j not detected on port 7687"
            log_info "  → Start Neo4j with: brew services start neo4j"
            log_info "  → Or use Neo4j Desktop"
            return 1
        fi
    else
        log_warning "Cannot check Neo4j (nc command not available)"
        return 1
    fi
}

check_conduit() {
    log_step "Checking claude-conduit service..."
    if curl -s "$CONDUIT_URL/health" &> /dev/null; then
        CONDUIT_STATUS=$(curl -s "$CONDUIT_URL/health" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        if [ "$CONDUIT_STATUS" = "healthy" ]; then
            log_success "claude-conduit is running and healthy"
            return 0
        else
            log_warning "claude-conduit is running but status: $CONDUIT_STATUS"
            return 1
        fi
    else
        log_warning "claude-conduit not detected on $CONDUIT_URL"
        log_info "  → Start with: cd $PROJECT_ROOT && npm start"
        return 1
    fi
}

# Dependency management
install_dependencies() {
    log_step "Installing Python dependencies..."
    cd "$DASHBOARD_DIR"
    
    if [ -f "requirements.txt" ]; then
        # Check if we're in a virtual environment
        if [[ "$VIRTUAL_ENV" != "" ]]; then
            log_info "Installing in virtual environment: $VIRTUAL_ENV"
            pip install -r requirements.txt
        else
            # Try to create and use a virtual environment
            if [ ! -d "venv" ]; then
                log_info "Creating virtual environment..."
                python3 -m venv venv
            fi
            
            log_info "Activating virtual environment..."
            source venv/bin/activate
            pip install -r requirements.txt
            log_info "Virtual environment created at: $DASHBOARD_DIR/venv"
            log_info "To activate manually: source $DASHBOARD_DIR/venv/bin/activate"
        fi
        log_success "Dependencies installed"
    else
        log_error "requirements.txt not found"
        return 1
    fi
}

# Demo data seeding
seed_demo_data() {
    log_step "Seeding demo data..."
    
    # Create a simple demo data script
    cat > "$DASHBOARD_DIR/seed_demo.py" << 'EOF'
#!/usr/bin/env python3
import os
import sys
from neo4j import GraphDatabase

def seed_demo_data():
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        with driver.session() as session:
            # Clear existing demo data
            session.run("MATCH (n:Demo) DETACH DELETE n")
            
            # Create demo nodes and relationships
            queries = [
                "CREATE (pr1:Demo:PullRequest {name: 'Dashboard Implementation', id: 'pr-001', created_at: datetime()})",
                "CREATE (pr2:Demo:PullRequest {name: 'MCP Integration', id: 'pr-002', created_at: datetime()})",
                "CREATE (agent1:Demo:Agent {name: 'TaskMaster AI', id: 'agent-001', created_at: datetime()})",
                "CREATE (agent2:Demo:Agent {name: 'Scout', id: 'agent-002', created_at: datetime()})",
                "CREATE (task1:Demo:Task {name: 'Build Dashboard', id: 'task-001', created_at: datetime()})",
                "CREATE (task2:Demo:Task {name: 'Test Integration', id: 'task-002', created_at: datetime()})",
                "MATCH (pr1:Demo:PullRequest {id: 'pr-001'}), (task1:Demo:Task {id: 'task-001'}) CREATE (pr1)-[:IMPLEMENTS]->(task1)",
                "MATCH (agent1:Demo:Agent {id: 'agent-001'}), (task1:Demo:Task {id: 'task-001'}) CREATE (agent1)-[:ASSIGNED_TO]->(task1)",
                "MATCH (pr1:Demo:PullRequest {id: 'pr-001'}), (pr2:Demo:PullRequest {id: 'pr-002'}) CREATE (pr1)-[:DEPENDS_ON]->(pr2)"
            ]
            
            for query in queries:
                session.run(query)
            
            print("✅ Demo data seeded successfully")
            
            # Verify data
            result = session.run("MATCH (n:Demo) RETURN count(n) as count")
            count = result.single()["count"]
            print(f"📊 Created {count} demo nodes")
            
        driver.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to seed demo data: {e}")
        return False

if __name__ == "__main__":
    seed_demo_data()
EOF

    chmod +x "$DASHBOARD_DIR/seed_demo.py"
    
    if python3 "$DASHBOARD_DIR/seed_demo.py"; then
        log_success "Demo data seeded"
        return 0
    else
        log_error "Failed to seed demo data"
        return 1
    fi
}

# Test runner
run_tests() {
    log_step "Running comprehensive tests..."
    
    local verbose=${1:-false}
    local test_results=()
    
    # Test 1: Environment check
    log_info "Test 1: Environment validation"
    if check_python && check_pip; then
        test_results+=("✅ Environment: PASS")
    else
        test_results+=("❌ Environment: FAIL") 
    fi
    
    # Test 2: Dependencies
    log_info "Test 2: Dependency check"
    cd "$DASHBOARD_DIR"
    if python3 -c "import streamlit, neo4j, plotly, networkx, pandas; print('All imports successful')" 2>/dev/null; then
        test_results+=("✅ Dependencies: PASS")
    else
        test_results+=("❌ Dependencies: FAIL")
    fi
    
    # Test 3: Service connectivity
    log_info "Test 3: Service connectivity"
    local services_ok=true
    if ! check_neo4j; then
        services_ok=false
    fi
    if ! check_conduit; then
        services_ok=false
    fi
    
    if [ "$services_ok" = true ]; then
        test_results+=("✅ Services: PASS")
    else
        test_results+=("⚠️  Services: PARTIAL (some services unavailable)")
    fi
    
    # Test 4: Dashboard startup test
    log_info "Test 4: Dashboard startup test"
    if timeout 10s python3 -c "
import streamlit
from app import get_neo4j_connection, get_conduit_client
try:
    # Test imports and basic initialization
    conn = get_neo4j_connection()
    conduit = get_conduit_client()
    print('Dashboard components initialized successfully')
except Exception as e:
    print(f'Dashboard test failed: {e}')
    exit(1)
" 2>/dev/null; then
        test_results+=("✅ Dashboard: PASS")
    else
        test_results+=("❌ Dashboard: FAIL")
    fi
    
    # Print results
    echo ""
    log_info "=== TEST RESULTS ==="
    for result in "${test_results[@]}"; do
        echo "  $result"
    done
    echo ""
    
    # Count failures
    local failures=$(printf '%s\n' "${test_results[@]}" | grep -c "❌" || true)
    if [ "$failures" -eq 0 ]; then
        log_success "All tests passed! Dashboard is ready for demo."
        return 0
    else
        log_warning "$failures test(s) failed. Check the issues above."
        return 1
    fi
}

# Main dashboard runner
run_dashboard() {
    local port=${1:-$STREAMLIT_PORT}
    
    log_step "Starting Streamlit dashboard on port $port..."
    cd "$DASHBOARD_DIR"
    
    # Activate virtual environment if it exists
    if [ -d "venv" ] && [[ "$VIRTUAL_ENV" == "" ]]; then
        log_info "Activating virtual environment..."
        source venv/bin/activate
    fi
    
    log_info "Dashboard will be available at: http://localhost:$port"
    log_info "Press Ctrl+C to stop the dashboard"
    echo ""
    
    # Set environment variables if not set
    export NEO4J_URI=${NEO4J_URI:-"bolt://localhost:7687"}
    export NEO4J_USER=${NEO4J_USER:-"neo4j"}
    export NEO4J_PASSWORD=${NEO4J_PASSWORD:-"password"}
    export CONDUIT_URL=${CONDUIT_URL:-"http://localhost:3001"}
    
    streamlit run app.py --server.port "$port" --server.headless true
}

# Cleanup function
cleanup_demo() {
    log_step "Cleaning up demo data..."
    
    if [ -f "$DASHBOARD_DIR/seed_demo.py" ]; then
        python3 -c "
from neo4j import GraphDatabase
import os

uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
user = os.getenv('NEO4J_USER', 'neo4j')
password = os.getenv('NEO4J_PASSWORD', 'password')

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = session.run('MATCH (n:Demo) DETACH DELETE n RETURN count(n) as deleted')
        count = result.single()['deleted'] if result.single() else 0
        print(f'Deleted {count} demo nodes')
    driver.close()
    print('✅ Cleanup completed')
except Exception as e:
    print(f'❌ Cleanup failed: {e}')
"
    fi
    
    # Remove temporary files
    rm -f "$DASHBOARD_DIR/seed_demo.py"
    log_success "Cleanup completed"
}

# Setup function
setup_environment() {
    local skip_deps=${1:-false}
    
    log_step "Setting up dashboard environment..."
    
    # Check prerequisites
    check_python || exit 1
    check_pip || exit 1
    
    # Install dependencies unless skipped
    if [ "$skip_deps" != true ]; then
        install_dependencies || exit 1
    fi
    
    # Check services (non-blocking)
    check_node
    check_neo4j
    check_conduit
    
    log_success "Setup completed! Use '$0 run' to start the dashboard."
}

# Main command handler
main() {
    local command=${1:-"run"}
    local verbose=false
    local skip_deps=false
    local port=$STREAMLIT_PORT
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose)
                verbose=true
                shift
                ;;
            --no-deps)
                skip_deps=true
                shift
                ;;
            --port)
                port="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                if [ -z "$command" ] || [ "$command" = "run" ]; then
                    command="$1"
                fi
                shift
                ;;
        esac
    done
    
    print_banner
    
    case $command in
        setup)
            setup_environment $skip_deps
            ;;
        check)
            log_step "Running system health check..."
            check_python && check_pip && check_node && check_neo4j && check_conduit
            ;;
        demo)
            seed_demo_data
            ;;
        test)
            run_tests $verbose
            ;;
        run)
            run_dashboard $port
            ;;
        clean)
            cleanup_demo
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"