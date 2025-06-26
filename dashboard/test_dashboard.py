#!/usr/bin/env python3
"""
Comprehensive test suite for Streamlit Knowledge Graph Dashboard
Following FLOW methodology with automated and manual verification
"""

import unittest
import sys
import os
import tempfile
import json
from unittest.mock import Mock, patch, MagicMock
import pandas as pd

# Add dashboard directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import dashboard components
try:
    from neo4j_connection import Neo4jConnection
    from claude_conduit import ClaudeConduitClient
    from visualizations import GraphVisualizer
    import app
except ImportError as e:
    print(f"Warning: Could not import dashboard modules: {e}")
    print("Make sure all dependencies are installed: pip install -r requirements.txt")


class TestNeo4jConnection(unittest.TestCase):
    """Test Neo4j connection handling"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.mock_driver = Mock()
        self.mock_session = Mock()
        self.mock_driver.session.return_value.__enter__.return_value = self.mock_session
        
    @patch('neo4j_connection.GraphDatabase.driver')
    def test_connection_initialization(self, mock_driver):
        """Test Neo4j connection initialization"""
        mock_driver.return_value = self.mock_driver
        
        conn = Neo4jConnection("bolt://localhost:7687", "neo4j", "password")
        
        mock_driver.assert_called_once_with("bolt://localhost:7687", auth=("neo4j", "password"))
        self.assertIsNotNone(conn)
    
    @patch('neo4j_connection.GraphDatabase.driver')
    def test_execute_query(self, mock_driver):
        """Test query execution"""
        mock_driver.return_value = self.mock_driver
        
        # Mock query result
        mock_result = Mock()
        mock_result.data.return_value = [{"count": 42}]
        self.mock_session.run.return_value = [mock_result]
        
        conn = Neo4jConnection("bolt://localhost:7687", "neo4j", "password")
        result = conn.execute_query("MATCH (n) RETURN count(n) as count")
        
        self.assertEqual(result, [{"count": 42}])
        self.mock_session.run.assert_called_once()
    
    @patch('neo4j_connection.GraphDatabase.driver')
    def test_graph_statistics(self, mock_driver):
        """Test graph statistics calculation"""
        mock_driver.return_value = self.mock_driver
        
        # Mock statistics results
        def mock_execute_query(query, params=None):
            if "count(n)" in query:
                return [{"count": 100}]
            elif "count(r)" in query:
                return [{"count": 50}]
            elif "DISTINCT labels" in query:
                return [{"count": 5}]
            elif "DISTINCT type" in query:
                return [{"count": 3}]
            return [{"count": 0}]
        
        conn = Neo4jConnection("bolt://localhost:7687", "neo4j", "password")
        conn.execute_query = mock_execute_query
        
        stats = conn.get_graph_statistics()
        
        expected_stats = {
            "node_count": 100,
            "relationship_count": 50,
            "label_count": 5,
            "relationship_type_count": 3
        }
        self.assertEqual(stats, expected_stats)


class TestClaudeConduitClient(unittest.TestCase):
    """Test Claude Conduit HTTP client"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.client = ClaudeConduitClient("http://localhost:3001")
        self.mock_response = Mock()
    
    @patch('claude_conduit.requests.Session.get')
    def test_health_check_success(self, mock_get):
        """Test successful health check"""
        self.mock_response.json.return_value = {"status": "healthy", "version": "2.0.0"}
        self.mock_response.raise_for_status.return_value = None
        mock_get.return_value = self.mock_response
        
        result = self.client.health_check()
        
        self.assertEqual(result["status"], "healthy")
        self.assertEqual(result["version"], "2.0.0")
        mock_get.assert_called_once_with("http://localhost:3001/health")
    
    @patch('claude_conduit.requests.Session.get')
    def test_health_check_failure(self, mock_get):
        """Test health check failure handling"""
        mock_get.side_effect = Exception("Connection refused")
        
        result = self.client.health_check()
        
        self.assertEqual(result["status"], "unhealthy")
        self.assertIn("error", result)
    
    @patch('claude_conduit.requests.Session.get')
    def test_get_available_tools(self, mock_get):
        """Test fetching available tools"""
        mock_tools = {
            "mcp": {"servers": {"taskmaster-ai": {"tools": ["plan_task"]}}},
            "plugins": [{"name": "test-plugin"}]
        }
        self.mock_response.json.return_value = mock_tools
        self.mock_response.raise_for_status.return_value = None
        mock_get.return_value = self.mock_response
        
        result = self.client.get_available_tools()
        
        self.assertEqual(result, mock_tools)
        mock_get.assert_called_once_with("http://localhost:3001/tools")
    
    @patch('claude_conduit.requests.Session.post')
    def test_execute_tool(self, mock_post):
        """Test tool execution"""
        mock_result = {"status": "success", "result": {"plan": "test plan"}}
        self.mock_response.json.return_value = mock_result
        self.mock_response.raise_for_status.return_value = None
        mock_post.return_value = self.mock_response
        
        result = self.client.execute_tool("taskmaster-ai", "plan_task", {"task": "test"})
        
        self.assertEqual(result, mock_result)
        mock_post.assert_called_once_with(
            "http://localhost:3001/execute/taskmaster-ai/plan_task",
            json={"task": "test"}
        )


class TestGraphVisualizer(unittest.TestCase):
    """Test graph visualization components"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.mock_neo4j = Mock()
        self.visualizer = GraphVisualizer(self.mock_neo4j)
    
    def test_get_node_types(self):
        """Test getting node types from database"""
        self.mock_neo4j.execute_query.return_value = [
            {"type": "PullRequest"},
            {"type": "Agent"},
            {"type": "Task"}
        ]
        
        types = self.visualizer.get_node_types()
        
        self.assertEqual(types, ["PullRequest", "Agent", "Task"])
        self.mock_neo4j.execute_query.assert_called_once()
    
    def test_get_relationship_types(self):
        """Test getting relationship types from database"""
        self.mock_neo4j.execute_query.return_value = [
            {"type": "IMPLEMENTS"},
            {"type": "DEPENDS_ON"},
            {"type": "ASSIGNED_TO"}
        ]
        
        types = self.visualizer.get_relationship_types()
        
        self.assertEqual(types, ["IMPLEMENTS", "DEPENDS_ON", "ASSIGNED_TO"])
    
    def test_color_mapping(self):
        """Test node color mapping"""
        self.assertIn("PullRequest", self.visualizer.color_map)
        self.assertIn("Agent", self.visualizer.color_map)
        self.assertIn("Task", self.visualizer.color_map)
    
    def test_pr_workflow_data(self):
        """Test PR workflow data processing"""
        mock_data = [
            {"PR": "PR-001", "Action": "IMPLEMENTS", "Target": "Task", "Count": 1},
            {"PR": "PR-002", "Action": "DEPENDS_ON", "Target": "PR", "Count": 1}
        ]
        self.mock_neo4j.execute_query.return_value = mock_data
        
        result = self.visualizer.get_pr_workflow()
        
        self.assertIsInstance(result, pd.DataFrame)
        if not result.empty:
            self.assertEqual(len(result), 2)


class TestStreamlitApp(unittest.TestCase):
    """Test Streamlit app functions"""
    
    @patch('app.Neo4jConnection')
    @patch('app.ClaudeConduitClient')
    def test_connection_initialization(self, mock_conduit, mock_neo4j):
        """Test connection initialization functions"""
        # Test cached connection functions
        with patch.dict(os.environ, {
            'NEO4J_URI': 'bolt://localhost:7687',
            'NEO4J_USER': 'neo4j',
            'NEO4J_PASSWORD': 'password',
            'CONDUIT_URL': 'http://localhost:3001'
        }):
            # These would normally be cached by Streamlit
            neo4j_conn = app.get_neo4j_connection()
            conduit_client = app.get_conduit_client()
            
            mock_neo4j.assert_called()
            mock_conduit.assert_called()


class TestIntegration(unittest.TestCase):
    """Integration tests requiring actual services"""
    
    def setUp(self):
        """Set up for integration tests"""
        self.neo4j_available = self._check_neo4j()
        self.conduit_available = self._check_conduit()
    
    def _check_neo4j(self):
        """Check if Neo4j is available"""
        try:
            from neo4j import GraphDatabase
            driver = GraphDatabase.driver(
                "bolt://localhost:7687",
                auth=("neo4j", "password")
            )
            driver.verify_connectivity()
            driver.close()
            return True
        except:
            return False
    
    def _check_conduit(self):
        """Check if claude-conduit is available"""
        try:
            import requests
            response = requests.get("http://localhost:3001/health", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    @unittest.skipUnless(os.getenv('RUN_INTEGRATION_TESTS'), "Integration tests disabled")
    def test_end_to_end_neo4j(self):
        """End-to-end test with real Neo4j"""
        if not self.neo4j_available:
            self.skipTest("Neo4j not available")
        
        conn = Neo4jConnection(
            "bolt://localhost:7687",
            "neo4j", 
            "password"
        )
        
        # Test basic connectivity
        result = conn.execute_query("RETURN 1 as test")
        self.assertEqual(result[0]["test"], 1)
        
        # Test statistics
        stats = conn.get_graph_statistics()
        self.assertIsInstance(stats, dict)
        self.assertIn("node_count", stats)
    
    @unittest.skipUnless(os.getenv('RUN_INTEGRATION_TESTS'), "Integration tests disabled")
    def test_end_to_end_conduit(self):
        """End-to-end test with real claude-conduit"""
        if not self.conduit_available:
            self.skipTest("claude-conduit not available")
        
        client = ClaudeConduitClient("http://localhost:3001")
        
        # Test health check
        health = client.health_check()
        self.assertEqual(health["status"], "healthy")
        
        # Test fortune
        fortune = client.get_fortune()
        self.assertIsInstance(fortune, str)
        self.assertNotEqual(fortune, "Fortune service unavailable")


def run_manual_verification():
    """Manual verification checklist"""
    print("\n" + "="*60)
    print("MANUAL VERIFICATION CHECKLIST")
    print("="*60)
    
    checklist = [
        "1. Dashboard loads without errors",
        "2. Navigation sidebar works correctly",
        "3. Overview page shows system statistics",
        "4. Knowledge Graph page renders interactive visualization",
        "5. Process Flow page displays workflow diagrams",
        "6. Analytics page shows metrics and charts",
        "7. Query Explorer executes Cypher queries",
        "8. MCP Tools page shows available servers",
        "9. Task Planning page generates FLOW plans",
        "10. Claude Conduit status indicator works",
        "11. Fortune system displays educational quotes",
        "12. Error handling works for disconnected services"
    ]
    
    print("Please manually verify the following items:")
    for item in checklist:
        print(f"  [ ] {item}")
    
    print("\nTo run manual verification:")
    print("  1. Start Neo4j: brew services start neo4j")
    print("  2. Start claude-conduit: npm start")
    print("  3. Start dashboard: streamlit run app.py")
    print("  4. Navigate to http://localhost:8501")
    print("  5. Check each item in the list above")
    print("="*60)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Dashboard Test Suite")
    parser.add_argument("--integration", action="store_true", 
                       help="Run integration tests (requires services)")
    parser.add_argument("--manual", action="store_true",
                       help="Show manual verification checklist")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Verbose output")
    
    args = parser.parse_args()
    
    if args.manual:
        run_manual_verification()
        sys.exit(0)
    
    # Set environment variable for integration tests
    if args.integration:
        os.environ['RUN_INTEGRATION_TESTS'] = '1'
    
    # Configure test verbosity
    verbosity = 2 if args.verbose else 1
    
    # Run unit tests
    print("Running Dashboard Test Suite...")
    print("="*50)
    
    # Discover and run tests
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    
    runner = unittest.TextTestRunner(verbosity=verbosity, buffer=True)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    
    if result.failures:
        print("\nFAILURES:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback.split(chr(10))[-2]}")
    
    if result.errors:
        print("\nERRORS:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback.split(chr(10))[-2]}")
    
    # Exit with appropriate code
    sys.exit(0 if result.wasSuccessful() else 1)