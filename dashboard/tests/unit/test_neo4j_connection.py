#!/usr/bin/env python3
"""
Unit tests for Neo4j connection handling
Tests database connectivity and query execution with mocked dependencies
"""

import unittest
import sys
import os
from unittest.mock import Mock, patch, MagicMock

# Add dashboard directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from neo4j_connection import Neo4jConnection
except ImportError as e:
    print(f"Warning: Could not import neo4j_connection: {e}")


class TestNeo4jConnection(unittest.TestCase):
    """Test Neo4j connection handling"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.mock_driver = Mock()
        self.mock_session = Mock()
        # Properly mock context manager for Neo4j session
        self.mock_driver.session.return_value = MagicMock()
        self.mock_driver.session.return_value.__enter__ = Mock(return_value=self.mock_session)
        self.mock_driver.session.return_value.__exit__ = Mock(return_value=None)
        
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
        
        # Mock query result - return list of records, each with .data() method
        mock_record = Mock()
        mock_record.data.return_value = {"count": 42}
        self.mock_session.run.return_value = [mock_record]
        
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


if __name__ == "__main__":
    unittest.main()