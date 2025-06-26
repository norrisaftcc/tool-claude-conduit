import streamlit as st
import os
from neo4j_connection import Neo4jConnection
from visualizations import GraphVisualizer
from claude_conduit import ClaudeConduitClient
import pandas as pd

st.set_page_config(
    page_title="Tool Claude Conduit - Knowledge Graph Dashboard",
    page_icon="🧠",
    layout="wide"
)

st.title("🧠 Knowledge Graph Dashboard")
st.markdown("Interactive visualization for Tool Claude Conduit's knowledge graph")

@st.cache_resource
def get_neo4j_connection():
    try:
        conn = Neo4jConnection(
            uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            user=os.getenv("NEO4J_USER", "neo4j"),
            password=os.getenv("NEO4J_PASSWORD", "password")
        )
        # Test the connection
        conn.execute_query("RETURN 1 as test")
        return conn
    except Exception:
        return None

@st.cache_resource
def get_conduit_client():
    return ClaudeConduitClient(
        base_url=os.getenv("CONDUIT_URL", "http://localhost:3001")
    )

def main():
    with st.sidebar:
        st.header("Navigation")
        page = st.radio(
            "Select View",
            ["Overview", "Knowledge Graph", "Process Flow", "Analytics", 
             "Query Explorer", "MCP Tools", "Task Planning"]
        )
        
        st.markdown("---")
        st.header("Settings")
        layout_type = st.selectbox(
            "Graph Layout",
            ["Force-directed", "Hierarchical", "Circular", "Random"]
        )
        
        node_limit = st.slider("Max Nodes", 10, 500, 100)
        
        st.markdown("---")
        st.header("Claude Conduit Status")
        conduit = get_conduit_client()
        health = conduit.health_check()
        if health.get("status") == "healthy":
            st.success("🟢 Connected")
            st.caption(f"v{health.get('version', 'unknown')}")
        else:
            st.error("🔴 Disconnected")
            st.caption("Start claude-conduit to enable MCP features")
        
        fortune = conduit.get_fortune()
        if fortune != "Fortune service unavailable":
            st.info(f"💭 {fortune}")
    
    conn = get_neo4j_connection()
    conduit = get_conduit_client()
    
    # Show Neo4j status in sidebar
    if conn is None:
        st.sidebar.warning("🔴 Neo4j Offline")
        st.sidebar.info("Graph features disabled")
    else:
        st.sidebar.success("🟢 Neo4j Connected")
    
    # Initialize visualizer only if Neo4j is available
    visualizer = GraphVisualizer(conn) if conn else None
    
    if page == "Overview":
        show_overview(conn)
    elif page == "Knowledge Graph":
        if conn:
            show_knowledge_graph(visualizer, layout_type, node_limit)
        else:
            show_neo4j_required()
    elif page == "Process Flow":
        if conn:
            show_process_flow(visualizer)
        else:
            show_neo4j_required()
    elif page == "Analytics":
        if conn:
            show_analytics(conn)
        else:
            show_neo4j_required()
    elif page == "Query Explorer":
        if conn:
            show_query_explorer(conn)
        else:
            show_neo4j_required()
    elif page == "MCP Tools":
        show_mcp_tools(conduit)
    elif page == "Task Planning":
        show_task_planning(conduit)

def show_neo4j_required():
    """Show Neo4j required message"""
    st.header("🔗 Neo4j Required")
    st.info("This feature requires a Neo4j database connection.")
    
    st.markdown("### Quick Setup")
    st.code("""
# Install Neo4j
brew install neo4j

# Start Neo4j
brew services start neo4j

# Or use Neo4j Desktop
# Download from: https://neo4j.com/download/
    """, language="bash")
    
    st.markdown("### Alternative: Demo Mode")
    st.markdown("You can still use:")
    st.markdown("- 🛠️ **MCP Tools** - AI capabilities via claude-conduit")
    st.markdown("- 📋 **Task Planning** - FLOW methodology and planning boost")
    
    if st.button("🔄 Retry Connection"):
        st.rerun()

def show_overview(conn):
    st.header("📊 System Overview")
    
    if conn is None:
        st.warning("Neo4j not connected - showing limited overview")
        st.info("Connect Neo4j to see full graph statistics and activity")
        
        # Show basic system info without Neo4j
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Available Features")
            st.success("✅ MCP Tools Integration")
            st.success("✅ Task Planning (FLOW)")
            st.success("✅ Claude Conduit Bridge")
        
        with col2:
            st.subheader("Requires Neo4j")
            st.error("❌ Knowledge Graph Visualization")
            st.error("❌ Process Flow Diagrams") 
            st.error("❌ Graph Analytics")
            st.error("❌ Query Explorer")
        
        return
    
    # Original overview with Neo4j
    col1, col2, col3, col4 = st.columns(4)
    
    stats = conn.get_graph_statistics()
    
    with col1:
        st.metric("Total Nodes", stats.get("node_count", 0))
    with col2:
        st.metric("Total Relationships", stats.get("relationship_count", 0))
    with col3:
        st.metric("Node Types", stats.get("label_count", 0))
    with col4:
        st.metric("Relationship Types", stats.get("relationship_type_count", 0))
    
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Recent Activity")
        activity = conn.get_recent_activity(limit=10)
        if activity is not None and not activity.empty:
            st.dataframe(activity)
        else:
            st.info("No recent activity found")
    
    with col2:
        st.subheader("System Health")
        health = conn.check_health()
        for component, status in health.items():
            if status:
                st.success(f"✅ {component}")
            else:
                st.error(f"❌ {component}")

def show_knowledge_graph(visualizer, layout_type, node_limit):
    st.header("🌐 Knowledge Graph Visualization")
    
    col1, col2 = st.columns([3, 1])
    
    with col2:
        st.subheader("Filters")
        node_types = visualizer.get_node_types()
        selected_types = st.multiselect(
            "Node Types",
            node_types,
            default=node_types[:3] if len(node_types) > 3 else node_types
        )
        
        relationship_types = visualizer.get_relationship_types()
        selected_rels = st.multiselect(
            "Relationship Types",
            relationship_types,
            default=relationship_types[:3] if len(relationship_types) > 3 else relationship_types
        )
        
        search_term = st.text_input("Search nodes", "")
        
    with col1:
        if st.button("Generate Graph"):
            with st.spinner("Loading graph..."):
                graph_html = visualizer.create_interactive_graph(
                    node_types=selected_types,
                    relationship_types=selected_rels,
                    layout=layout_type,
                    limit=node_limit,
                    search_term=search_term
                )
                st.components.v1.html(graph_html, height=600)

def show_process_flow(visualizer):
    st.header("🔄 Process Flow Visualization")
    
    process_type = st.selectbox(
        "Select Process",
        ["PR Workflow", "Agent Coordination", "Task Dependencies", "Data Flow"]
    )
    
    if process_type == "PR Workflow":
        st.subheader("Pull Request Workflow")
        workflow_data = visualizer.get_pr_workflow()
        if workflow_data:
            fig = visualizer.create_sankey_diagram(workflow_data)
            st.plotly_chart(fig, use_container_width=True)
    
    elif process_type == "Agent Coordination":
        st.subheader("Multi-Agent Coordination")
        coord_data = visualizer.get_agent_coordination()
        if coord_data:
            fig = visualizer.create_flow_diagram(coord_data)
            st.plotly_chart(fig, use_container_width=True)

def show_analytics(conn):
    st.header("📈 Analytics Dashboard")
    
    tab1, tab2, tab3 = st.tabs(["Metrics", "Growth", "Patterns"])
    
    with tab1:
        st.subheader("Graph Metrics")
        metrics = conn.calculate_graph_metrics()
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Average Degree", f"{metrics.get('avg_degree', 0):.2f}")
            st.metric("Density", f"{metrics.get('density', 0):.4f}")
        with col2:
            st.metric("Clustering Coefficient", f"{metrics.get('clustering', 0):.4f}")
            st.metric("Components", metrics.get('components', 0))
    
    with tab2:
        st.subheader("Growth Tracking")
        growth_data = conn.get_growth_data()
        if not growth_data.empty:
            st.line_chart(growth_data)
    
    with tab3:
        st.subheader("Usage Patterns")
        patterns = conn.get_usage_patterns()
        if patterns:
            st.bar_chart(patterns)

def show_query_explorer(conn):
    st.header("🔍 Query Explorer")
    
    st.markdown("Execute custom Cypher queries on the knowledge graph")
    
    predefined_queries = {
        "Show all nodes": "MATCH (n) RETURN n LIMIT 25",
        "Count by label": "MATCH (n) RETURN labels(n)[0] as label, count(*) as count",
        "Recent PRs": "MATCH (pr:PullRequest) RETURN pr ORDER BY pr.created_at DESC LIMIT 10",
        "Agent interactions": "MATCH (a1:Agent)-[r]->(a2:Agent) RETURN a1, r, a2 LIMIT 25"
    }
    
    query_type = st.radio("Query Type", ["Predefined", "Custom"])
    
    if query_type == "Predefined":
        selected_query = st.selectbox("Select Query", list(predefined_queries.keys()))
        query = predefined_queries[selected_query]
        st.code(query, language="cypher")
    else:
        query = st.text_area("Enter Cypher Query", height=100)
    
    if st.button("Execute Query"):
        if query:
            with st.spinner("Executing query..."):
                try:
                    results = conn.execute_query(query)
                    if results:
                        st.success(f"Found {len(results)} results")
                        st.dataframe(results)
                    else:
                        st.info("Query returned no results")
                except Exception as e:
                    st.error(f"Query error: {str(e)}")

def show_mcp_tools(conduit):
    st.header("🛠️ MCP Tools Explorer")
    
    tools_data = conduit.get_available_tools()
    
    if "error" in tools_data:
        st.error(f"Failed to fetch tools: {tools_data['error']}")
        return
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("MCP Servers")
        mcp_servers = tools_data.get("mcp", {}).get("servers", {})
        if mcp_servers:
            for server, info in mcp_servers.items():
                with st.expander(f"📦 {server}"):
                    st.json(info)
        else:
            st.info("No MCP servers available")
    
    with col2:
        st.subheader("Plugins")
        plugins = tools_data.get("plugins", [])
        if plugins:
            for plugin in plugins:
                with st.expander(f"🔌 {plugin.get('name', 'Unknown')}"):
                    st.json(plugin)
        else:
            st.info("No plugins loaded")
    
    st.markdown("---")
    st.subheader("Execute Tool")
    
    server = st.text_input("Server Name")
    tool = st.text_input("Tool Name")
    payload = st.text_area("Payload (JSON)", "{}")
    
    if st.button("Execute"):
        try:
            import json
            payload_dict = json.loads(payload)
            result = conduit.execute_tool(server, tool, payload_dict)
            st.json(result)
        except Exception as e:
            st.error(f"Execution failed: {str(e)}")

def show_task_planning(conduit):
    st.header("📋 Task Planning with FLOW")
    
    st.markdown("""
    Use the FLOW methodology (Following Logical Work Order) to plan tasks:
    1. **LEARN** - Research through scout
    2. **UNDERSTAND** - Devil's advocate analysis
    3. **PLAN** - Structured breakdowns
    4. **EXECUTE** - Implementation
    5. **VERIFY** - Validation
    6. **DOCUMENT** - Knowledge capture
    """)
    
    task_description = st.text_area(
        "Describe your task",
        placeholder="Enter a detailed description of what you want to accomplish..."
    )
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("Generate Plan"):
            if task_description:
                with st.spinner("Generating FLOW plan..."):
                    result = conduit.get_task_planning(task_description)
                    if "error" not in result:
                        st.session_state['task_plan'] = result
                        st.success("Plan generated!")
                    else:
                        st.error(f"Planning failed: {result.get('error')}")
    
    with col2:
        if st.button("Get Planning Boost"):
            if task_description:
                with st.spinner("Getting planning boost..."):
                    result = conduit.get_planning_boost(task_description)
                    if "error" not in result:
                        st.session_state['planning_boost'] = result
                        st.success("Boost received!")
                    else:
                        st.error(f"Boost failed: {result.get('error')}")
    
    if 'task_plan' in st.session_state:
        st.markdown("---")
        st.subheader("Generated Plan")
        st.json(st.session_state['task_plan'])
    
    if 'planning_boost' in st.session_state:
        st.markdown("---")
        st.subheader("Planning Boost")
        st.json(st.session_state['planning_boost'])
    
    st.markdown("---")
    st.subheader("Save to Cloud Memory")
    
    if st.button("Save Current Plan"):
        if 'task_plan' in st.session_state:
            result = conduit.save_to_cloud_memory(
                f"task_plan_{task_description[:30]}",
                st.session_state['task_plan'],
                "planning"
            )
            if "error" not in result:
                st.success("Plan saved to cloud memory!")
            else:
                st.error(f"Save failed: {result.get('error')}")

if __name__ == "__main__":
    main()