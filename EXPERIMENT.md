# 🧪 EXPERIMENTAL: Cloud Knowledge Graph Integration

**⚠️ WARNING: This is experimental code for testing purposes only!**

## Purpose

This experimental branch tests integration with a real cloud-based knowledge graph database for advanced agentic RAG capabilities.

## What's Being Tested

### 🧠 Knowledge Graph Plugin
- Real cloud database connection
- Knowledge storage and retrieval  
- Relationship mapping between concepts
- Semantic search with embeddings
- Agentic RAG (Retrieval Augmented Generation)

### 🔬 Experimental Features
- **Graph Traversal**: Finding connections between concepts
- **Semantic Similarity**: Vector-based knowledge matching
- **Context Synthesis**: Intelligent response generation
- **Source Attribution**: Tracking knowledge provenance

## Setup

1. **Environment Variables** (add to `.env`):
```bash
KNOWLEDGE_GRAPH_ENDPOINT=your-cloud-endpoint
KNOWLEDGE_GRAPH_API_KEY=your-api-key
KNOWLEDGE_GRAPH_USERNAME=your-username
KNOWLEDGE_GRAPH_PASSWORD=your-password
```

2. **Test the Plugin**:
```bash
# Start server
npm start

# Load knowledge-graph persona
curl -X POST http://localhost:3001/profile/knowledge-graph \
  -H "Content-Type: application/json" -d '{}'

# Test knowledge storage
curl -X POST http://localhost:3001/execute/knowledge-graph/storeKnowledge \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Claude Conduit is an HTTP bridge for AI models",
    "type": "concept",
    "tags": ["ai", "bridge", "http"]
  }'

# Test semantic search
curl -X POST http://localhost:3001/execute/knowledge-graph/semanticSearch \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI model integration",
    "limit": 5
  }'

# Test agentic RAG
curl -X POST http://localhost:3001/execute/knowledge-graph/agenticRag \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does Claude Conduit work?",
    "context": "User wants to understand the architecture"
  }'
```

## Expected Outcomes

### ✅ Success Indicators
- [ ] Connection to cloud knowledge graph established
- [ ] Knowledge nodes stored successfully
- [ ] Semantic search returns relevant results
- [ ] Relationships created between concepts
- [ ] Agentic RAG provides contextual responses
- [ ] Source attribution works correctly

### ❌ Failure Modes to Test
- [ ] Network connectivity issues
- [ ] Authentication failures
- [ ] Rate limiting behavior
- [ ] Large dataset performance
- [ ] Memory usage under load

## Performance Metrics

Track these during testing:
- **Connection latency** to cloud database
- **Query response times** for different operations
- **Memory usage** with cached embeddings
- **Accuracy** of semantic search results
- **Quality** of synthesized responses

## Security Considerations

- ✅ No credentials hardcoded
- ✅ Environment variable injection
- ✅ Connection encryption (HTTPS)
- ⚠️ Sensitive data in knowledge graph
- ⚠️ Rate limiting and abuse protection

## Next Steps

Based on experimental results:

1. **If successful**: Clean up code and create proper feature PR
2. **If issues found**: Document problems and iterate
3. **Performance optimization**: Implement caching and batching
4. **Production readiness**: Add monitoring and error recovery

## Notes

- This is a **draft PR for experimentation only**
- Real credentials will be used for testing
- Results will inform production implementation
- Code quality is secondary to functionality validation

---

**Remember**: This is exploratory work. Break things, learn, iterate! 🚀