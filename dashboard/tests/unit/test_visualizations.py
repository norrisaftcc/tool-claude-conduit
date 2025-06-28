#!/usr/bin/env python3
"""
Unit tests for graph visualization components
Tests chart generation and data processing with mocked dependencies
"""

import unittest
import sys
import os
from unittest.mock import Mock
import pandas as pd

# Add dashboard directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from visualizations import GraphVisualizer
except ImportError as e:
    print(f"Warning: Could not import visualizations: {e}")


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


if __name__ == "__main__":
    unittest.main()