# Neo4j Manual Verification Queries

Use these queries in the Neo4j Browser to manually verify the knowledge graph data.

## Basic Queries

### 1. View All Knowledge Nodes
```cypher
MATCH (n:Knowledge)
RETURN n
LIMIT 25
```

### 2. Search for Claude-related Content
```cypher
MATCH (n:Knowledge)
WHERE n.content CONTAINS 'Claude'
RETURN n.id, n.type, n.content, n.createdAt
ORDER BY n.createdAt DESC
```

### 3. View All Relationships
```cypher
MATCH (n1:Knowledge)-[r]->(n2:Knowledge)
RETURN n1, r, n2
LIMIT 50
```

### 4. Find Specific Node Types
```cypher
MATCH (n:Knowledge)
WHERE n.type = 'concept'
RETURN n
LIMIT 25
```

## Advanced Queries

### 5. View Knowledge with Relationships
```cypher
MATCH (n:Knowledge)
OPTIONAL MATCH (n)-[r]-(related:Knowledge)
RETURN n, r, related
```

### 6. Count Nodes by Type
```cypher
MATCH (n:Knowledge)
RETURN n.type as Type, COUNT(n) as Count
ORDER BY Count DESC
```

### 7. Recent Activity (Last 24 Hours)
```cypher
MATCH (n:Knowledge)
WHERE n.createdAt > datetime() - duration('P1D')
RETURN n
ORDER BY n.createdAt DESC
```

### 8. Find Nodes by Session
```cypher
MATCH (n:Knowledge)
WHERE n.sessionId STARTS WITH 'session_'
RETURN n.sessionId, COUNT(n) as NodeCount
ORDER BY NodeCount DESC
```

## Relationship Queries

### 9. View Specific Relationship Types
```cypher
MATCH (n1:Knowledge)-[r:RELATES_TO]->(n2:Knowledge)
RETURN n1.content, type(r), n2.content
```

### 10. Find Connected Components
```cypher
MATCH path = (n:Knowledge)-[*1..3]-(connected:Knowledge)
WHERE n.content CONTAINS 'Claude Code'
RETURN path
LIMIT 25
```

## Data Validation Queries

### 11. Check for Orphaned Nodes
```cypher
MATCH (n:Knowledge)
WHERE NOT (n)-[]-()
RETURN n.id, n.type, n.content
```

### 12. Verify Node Properties
```cypher
MATCH (n:Knowledge)
RETURN DISTINCT keys(n) as Properties
```

### 13. Find Duplicate Content
```cypher
MATCH (n1:Knowledge), (n2:Knowledge)
WHERE n1.content = n2.content AND id(n1) < id(n2)
RETURN n1.content, collect(n1.id), collect(n2.id)
```

## Cleanup Queries (Use with Caution)

### 14. Delete Test Data by Session
```cypher
// First, preview what will be deleted
MATCH (n:Knowledge)
WHERE n.sessionId = 'YOUR_SESSION_ID'
RETURN COUNT(n)

// Then delete if correct
MATCH (n:Knowledge)
WHERE n.sessionId = 'YOUR_SESSION_ID'
DETACH DELETE n
```

### 15. Delete All Test Nodes
```cypher
// WARNING: This deletes ALL Knowledge nodes
MATCH (n:Knowledge)
DETACH DELETE n
```

## Usage Tips

1. **Start with simple queries** (#1-4) to verify basic connectivity
2. **Use LIMIT** to avoid overwhelming results
3. **Check counts** (#6, #8) to understand data distribution
4. **Verify relationships** (#3, #9) are being created properly
5. **Use session IDs** to track test runs

## Expected Results

After running the tests, you should see:
- Multiple Knowledge nodes with type 'concept'
- Nodes containing "Claude Code" in their content
- Recent timestamps in createdAt fields
- Various relationship types between nodes