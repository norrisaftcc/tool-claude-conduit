import requests
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

class ClaudeConduitClient:
    def __init__(self, base_url: str = "http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def health_check(self) -> Dict[str, Any]:
        try:
            response = self.session.get(f"{self.base_url}/health")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": "unhealthy", "error": str(e)}
    
    def get_fortune(self) -> str:
        try:
            response = self.session.get(f"{self.base_url}/fortune")
            response.raise_for_status()
            return response.json().get("fortune", "No fortune available")
        except:
            return "Fortune service unavailable"
    
    def get_available_tools(self) -> Dict[str, Any]:
        try:
            response = self.session.get(f"{self.base_url}/tools")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "mcp": {}, "plugins": []}
    
    def execute_tool(self, server: str, tool: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = self.session.post(
                f"{self.base_url}/execute/{server}/{tool}",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def get_task_planning(self, task_description: str) -> Dict[str, Any]:
        payload = {
            "task": task_description,
            "methodology": "FLOW",
            "detailed": True
        }
        return self.execute_tool("taskmaster-ai", "plan_task", payload)
    
    def search_codebase(self, query: str, file_pattern: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "query": query,
            "pattern": file_pattern or "*"
        }
        return self.execute_tool("filesystem", "search", payload)
    
    def scout_research(self, topic: str) -> Dict[str, Any]:
        payload = {
            "topic": topic,
            "depth": "detailed"
        }
        return self.execute_tool("scout", "research", payload)
    
    def save_to_cloud_memory(self, key: str, value: Any, category: str = "dashboard") -> Dict[str, Any]:
        payload = {
            "key": f"{category}/{key}",
            "value": value,
            "timestamp": datetime.now().isoformat()
        }
        return self.execute_tool("cloud-memory", "store", payload)
    
    def get_from_cloud_memory(self, key: str, category: str = "dashboard") -> Dict[str, Any]:
        payload = {
            "key": f"{category}/{key}"
        }
        return self.execute_tool("cloud-memory", "retrieve", payload)
    
    def get_planning_boost(self, task: str) -> Dict[str, Any]:
        try:
            response = self.session.post(
                f"{self.base_url}/planning-boost",
                json={"task": task}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def load_profile(self, profile_name: str, config: Optional[Dict] = None) -> Dict[str, Any]:
        try:
            response = self.session.post(
                f"{self.base_url}/profile/{profile_name}",
                json=config or {}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def get_profiles(self) -> Dict[str, Any]:
        try:
            response = self.session.get(f"{self.base_url}/profiles")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "profiles": []}