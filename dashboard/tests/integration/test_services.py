#!/usr/bin/env python3
"""
Integration tests for external services
Tests real connectivity to Neo4j and claude-conduit services
"""

import unittest
import sys
import os

# Add dashboard directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from neo4j_connection import Neo4jConnection
    from claude_conduit import ClaudeConduitClient
except ImportError as e:
    print(f"Warning: Could not import dashboard modules: {e}")


class TestServiceIntegration(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()