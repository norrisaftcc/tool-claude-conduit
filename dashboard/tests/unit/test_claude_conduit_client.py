#!/usr/bin/env python3
"""
Unit tests for Claude Conduit HTTP client
Tests API integration with mocked HTTP responses
"""

import unittest
import sys
import os
from unittest.mock import Mock, patch

# Add dashboard directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from claude_conduit import ClaudeConduitClient
except ImportError as e:
    print(f"Warning: Could not import claude_conduit: {e}")


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
        import requests
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")
        
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


if __name__ == "__main__":
    unittest.main()