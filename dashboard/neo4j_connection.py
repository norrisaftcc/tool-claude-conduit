from neo4j import GraphDatabase
import pandas as pd
from datetime import datetime, timedelta

class Neo4jConnection:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        self.driver.close()
    
    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]
    
    def get_graph_statistics(self):
        queries = {
            "node_count": "MATCH (n) RETURN count(n) as count",
            "relationship_count": "MATCH ()-[r]->() RETURN count(r) as count",
            "label_count": "MATCH (n) RETURN count(DISTINCT labels(n)) as count",
            "relationship_type_count": "MATCH ()-[r]->() RETURN count(DISTINCT type(r)) as count"
        }
        
        stats = {}
        for key, query in queries.items():
            result = self.execute_query(query)
            stats[key] = result[0]["count"] if result else 0
        
        return stats
    
    def get_recent_activity(self, limit=10):
        query = """
        MATCH (n)
        WHERE n.created_at IS NOT NULL
        RETURN labels(n)[0] as type, n.name as name, n.created_at as created_at
        ORDER BY n.created_at DESC
        LIMIT $limit
        """
        
        results = self.execute_query(query, {"limit": limit})
        if results:
            return pd.DataFrame(results)
        return None
    
    def check_health(self):
        health = {
            "Neo4j Connection": False,
            "Database Access": False,
            "Schema Present": False
        }
        
        try:
            self.driver.verify_connectivity()
            health["Neo4j Connection"] = True
            
            result = self.execute_query("RETURN 1 as test")
            health["Database Access"] = result[0]["test"] == 1
            
            labels = self.execute_query("CALL db.labels()")
            health["Schema Present"] = len(labels) > 0
            
        except Exception:
            pass
        
        return health
    
    def calculate_graph_metrics(self):
        metrics = {}
        
        try:
            degree_query = """
            MATCH (n)
            RETURN avg(size((n)-->())) as avg_out_degree,
                   avg(size((n)<--())) as avg_in_degree
            """
            result = self.execute_query(degree_query)
            if result:
                metrics["avg_degree"] = (result[0]["avg_out_degree"] or 0) + (result[0]["avg_in_degree"] or 0)
            
            density_query = """
            MATCH (n)
            WITH count(n) as node_count
            MATCH ()-[r]->()
            WITH count(r) as edge_count, node_count
            RETURN toFloat(edge_count) / (node_count * (node_count - 1)) as density
            """
            result = self.execute_query(density_query)
            if result:
                metrics["density"] = result[0]["density"] or 0
            
            metrics["clustering"] = 0.0
            metrics["components"] = 1
            
        except Exception:
            pass
        
        return metrics
    
    def get_growth_data(self):
        query = """
        MATCH (n)
        WHERE n.created_at IS NOT NULL
        WITH date(n.created_at) as day, count(n) as count
        ORDER BY day
        RETURN day, sum(count) OVER (ORDER BY day) as cumulative_count
        """
        
        results = self.execute_query(query)
        if results:
            df = pd.DataFrame(results)
            df['day'] = pd.to_datetime(df['day'])
            return df.set_index('day')
        return pd.DataFrame()
    
    def get_usage_patterns(self):
        query = """
        MATCH (n)
        RETURN labels(n)[0] as type, count(*) as count
        ORDER BY count DESC
        """
        
        results = self.execute_query(query)
        if results:
            df = pd.DataFrame(results)
            return df.set_index('type')['count']
        return None