import networkx as nx
import plotly.graph_objects as go
import plotly.express as px
from pyvis.network import Network
import pandas as pd
from typing import List, Dict, Any, Optional
import json
import tempfile
import os

class GraphVisualizer:
    def __init__(self, neo4j_connection):
        self.neo4j = neo4j_connection
        self.color_map = {
            'PullRequest': '#FF6B6B',
            'Agent': '#4ECDC4',
            'Task': '#45B7D1',
            'Knowledge': '#96CEB4',
            'Memory': '#FFEAA7',
            'Plugin': '#DDA0DD',
            'Tool': '#98D8C8',
            'Workflow': '#F7DC6F'
        }
    
    def get_node_types(self) -> List[str]:
        query = "MATCH (n) RETURN DISTINCT labels(n)[0] as type ORDER BY type"
        results = self.neo4j.execute_query(query)
        return [r['type'] for r in results if r['type']]
    
    def get_relationship_types(self) -> List[str]:
        query = "MATCH ()-[r]->() RETURN DISTINCT type(r) as type ORDER BY type"
        results = self.neo4j.execute_query(query)
        return [r['type'] for r in results if r['type']]
    
    def create_interactive_graph(self, node_types: List[str], relationship_types: List[str], 
                               layout: str = "Force-directed", limit: int = 100, 
                               search_term: str = "") -> str:
        # Build query
        node_filter = " OR ".join([f"n:{nt}" for nt in node_types]) if node_types else "true"
        rel_filter = " OR ".join([f"type(r) = '{rt}'" for rt in relationship_types]) if relationship_types else "true"
        
        search_filter = ""
        if search_term:
            search_filter = f" AND (n.name CONTAINS '{search_term}' OR n.id CONTAINS '{search_term}')"
        
        query = f"""
        MATCH (n)-[r]->(m)
        WHERE ({node_filter}){search_filter}
        AND ({rel_filter})
        WITH n, r, m
        LIMIT {limit}
        RETURN n, r, m
        """
        
        results = self.neo4j.execute_query(query)
        
        # Create PyVis network
        net = Network(height="600px", width="100%", directed=True)
        
        # Configure physics based on layout
        if layout == "Force-directed":
            net.force_atlas_2based()
        elif layout == "Hierarchical":
            net.set_options("""
            var options = {
                "layout": {
                    "hierarchical": {
                        "enabled": true,
                        "direction": "UD",
                        "sortMethod": "directed"
                    }
                }
            }
            """)
        elif layout == "Circular":
            net.set_options("""
            var options = {
                "layout": {
                    "randomSeed": 2,
                    "improvedLayout": true
                },
                "physics": {
                    "enabled": false
                }
            }
            """)
        elif layout == "Random":
            net.set_options("""
            var options = {
                "layout": {
                    "randomSeed": undefined,
                    "improvedLayout": false
                }
            }
            """)
        else:
            # Default fallback for unsupported layouts
            net.force_atlas_2based()
        
        # Add nodes and edges
        nodes_added = set()
        
        for record in results:
            # Add source node
            source = record['n']
            source_id = source.get('id', str(source))
            source_label = list(source.keys())[0] if isinstance(source, dict) else 'Node'
            
            if source_id not in nodes_added:
                net.add_node(
                    source_id,
                    label=source.get('name', source_id),
                    color=self.color_map.get(source_label, '#999999'),
                    title=f"{source_label}: {source.get('description', '')}"
                )
                nodes_added.add(source_id)
            
            # Add target node
            target = record['m']
            target_id = target.get('id', str(target))
            target_label = list(target.keys())[0] if isinstance(target, dict) else 'Node'
            
            if target_id not in nodes_added:
                net.add_node(
                    target_id,
                    label=target.get('name', target_id),
                    color=self.color_map.get(target_label, '#999999'),
                    title=f"{target_label}: {target.get('description', '')}"
                )
                nodes_added.add(target_id)
            
            # Add edge
            rel = record['r']
            rel_type = rel if isinstance(rel, str) else 'RELATED'
            net.add_edge(source_id, target_id, label=rel_type)
        
        # Generate HTML
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
            net.save_graph(f.name)
            with open(f.name, 'r') as html_file:
                html_content = html_file.read()
            os.unlink(f.name)
        
        return html_content
    
    def get_pr_workflow(self) -> pd.DataFrame:
        query = """
        MATCH (pr:PullRequest)-[r]->(s)
        RETURN pr.name as PR, type(r) as Action, labels(s)[0] as Target, count(*) as Count
        ORDER BY PR, Action
        """
        results = self.neo4j.execute_query(query)
        if results:
            return pd.DataFrame(results)
        return pd.DataFrame()
    
    def create_sankey_diagram(self, workflow_data: pd.DataFrame) -> go.Figure:
        if workflow_data.empty:
            return go.Figure().add_annotation(text="No workflow data available")
        
        # Create node labels
        all_nodes = list(set(workflow_data['PR'].tolist() + 
                           workflow_data['Target'].tolist()))
        node_dict = {node: i for i, node in enumerate(all_nodes)}
        
        # Create links
        links = {
            'source': [node_dict[pr] for pr in workflow_data['PR']],
            'target': [node_dict[target] for target in workflow_data['Target']],
            'value': workflow_data['Count'].tolist(),
            'label': workflow_data['Action'].tolist()
        }
        
        fig = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=all_nodes
            ),
            link=links
        )])
        
        fig.update_layout(
            title="PR Workflow Visualization",
            font_size=10,
            height=500
        )
        
        return fig
    
    def get_agent_coordination(self) -> pd.DataFrame:
        query = """
        MATCH (a1:Agent)-[r]->(a2:Agent)
        RETURN a1.name as Source, type(r) as Interaction, a2.name as Target, count(*) as Weight
        ORDER BY Weight DESC
        """
        results = self.neo4j.execute_query(query)
        if results:
            return pd.DataFrame(results)
        return pd.DataFrame()
    
    def create_flow_diagram(self, coord_data: pd.DataFrame) -> go.Figure:
        if coord_data.empty:
            return go.Figure().add_annotation(text="No coordination data available")
        
        # Create network graph
        G = nx.from_pandas_edgelist(
            coord_data,
            source='Source',
            target='Target',
            edge_attr=['Interaction', 'Weight'],
            create_using=nx.DiGraph()
        )
        
        # Calculate layout
        pos = nx.spring_layout(G, k=2, iterations=50)
        
        # Create edge traces
        edge_traces = []
        for edge in G.edges(data=True):
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            
            edge_trace = go.Scatter(
                x=[x0, x1, None],
                y=[y0, y1, None],
                mode='lines',
                line=dict(width=edge[2]['Weight'], color='#888'),
                hoverinfo='text',
                text=f"{edge[2]['Interaction']}: {edge[2]['Weight']}",
                showlegend=False
            )
            edge_traces.append(edge_trace)
        
        # Create node trace
        node_x = [pos[node][0] for node in G.nodes()]
        node_y = [pos[node][1] for node in G.nodes()]
        
        node_trace = go.Scatter(
            x=node_x,
            y=node_y,
            mode='markers+text',
            text=[node for node in G.nodes()],
            textposition="top center",
            marker=dict(
                size=20,
                color='#4ECDC4',
                line=dict(width=2, color='white')
            ),
            hoverinfo='text'
        )
        
        # Create figure
        fig = go.Figure(data=edge_traces + [node_trace])
        
        fig.update_layout(
            title="Agent Coordination Network",
            showlegend=False,
            hovermode='closest',
            margin=dict(b=0, l=0, r=0, t=40),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=500
        )
        
        return fig
    
    def create_metrics_chart(self, metrics: Dict[str, Any]) -> go.Figure:
        categories = list(metrics.keys())
        values = list(metrics.values())
        
        fig = go.Figure(data=[
            go.Bar(x=categories, y=values, marker_color='#4ECDC4')
        ])
        
        fig.update_layout(
            title="Graph Metrics Overview",
            xaxis_title="Metric",
            yaxis_title="Value",
            height=400
        )
        
        return fig