# Competence Blueprint for Claude-Conduit
## What Prioritizing Competence Over Complexity Looks Like

**Date:** August 19, 2025  
**Purpose:** Define clear standards for competent architecture vs. overengineering  
**Goal:** Continuous review framework to prevent architectural crimes

---

## 1. COMPETENT ARCHITECTURE: What This Should Actually Be

### Core Purpose (One Sentence)
**HTTP bridge that lets Claude Assistant call MCP server tools via REST API.**

### Actual Architecture (Simple & Direct)
```
index.js (Express server ~200 lines)
├── /routes
│   ├── health.js (~20 lines)
│   ├── execute.js (~50 lines) 
│   └── tools.js (~30 lines)
├── /lib
│   └── mcp-client.js (~150 lines)
├── .env.example
├── package.json
└── README.md
```

**Total:** ~500 lines of actual code
**Dependencies:** 5 (express, cors, dotenv, @modelcontextprotocol/sdk, axios)

### What Each File Does (No BS)
- **index.js**: Express server, routes, error handling
- **mcp-client.js**: Connects to MCP servers, executes tools, returns results
- **routes/**: Simple route handlers, no business logic
- **.env**: API keys for Brave Search and Claude (optional)
- **README.md**: How to start server, what endpoints exist, example curl commands

### Patterns That Make Sense Here
✅ **Simple Express routes** - This is a REST API, not a microservice mesh  
✅ **Direct MCP SDK usage** - No abstraction layers needed  
✅ **Environment variables** - Standard practice for API keys  
✅ **Basic error handling** - Try/catch with meaningful error messages  
✅ **Health checks** - Simple GET /health returning { status: 'ok' }

### Patterns That DON'T Make Sense (Resume Padding)
❌ **Plugin architecture** - You have 3 simple integrations, not 30  
❌ **Abstract base classes** - JavaScript doesn't even have real interfaces  
❌ **Factory patterns** - You're not manufacturing widgets  
❌ **Persona system** - This isn't a role-playing game  
❌ **10 configuration files** - One .env file is enough  
❌ **Event-driven architecture** - You're proxying HTTP calls, not building Kafka

---

## 2. LINES OF CODE REALITY CHECK

### What We Actually Need
```
Core server:           200 lines
MCP client:           150 lines  
Routes:               100 lines
Tests:                300 lines
Configuration:         20 lines
Documentation:        200 lines (README + examples)
----------------------------
TOTAL:                970 lines
```

### What Currently Exists
```
Project JS files:     68,015 lines
Node modules:        290,000+ lines
Documentation:         3,000+ lines of lies
----------------------------
TOTAL:               360,000+ lines
```

**Bloat Factor: 371x**  
**Actual Functionality: 0.27% of codebase**

---

## 3. COMPETENCE SCORECARD

Rate your codebase on these metrics (1-10 scale):

### A. Directness (10 = straight line, 1 = labyrinth)
```
✅ Can a new developer understand the flow in 5 minutes?
✅ Is the path from request to response obvious?
✅ Are there < 3 layers between API and functionality?
Current Score: 2/10 (buried under abstractions)
Target Score: 9/10
```

### B. Honesty (10 = truth, 1 = vaporware)
```
✅ Do all advertised features actually work?
✅ Are limitations clearly documented?
✅ Do tests reflect real functionality?
Current Score: 1/10 (80% fake features)
Target Score: 10/10
```

### C. Proportionality (10 = right-sized, 1 = overengineered)
```
✅ Is the solution complexity proportional to the problem?
✅ Could you explain the architecture in 2 minutes?
✅ Are there < 5 core files?
Current Score: 1/10 (plugin system for 3 plugins)
Target Score: 9/10
```

### D. Maintainability (10 = anyone can fix, 1 = original author required)
```
✅ Can bugs be fixed in < 1 hour?
✅ Can features be added in < 1 day?
✅ Is the test suite comprehensive AND fast?
Current Score: 3/10 (too complex to maintain)
Target Score: 9/10
```

### E. Performance (10 = instant, 1 = sluggish)
```
✅ Does server start in < 1 second?
✅ Do requests complete in < 100ms?
✅ Is memory usage < 100MB?
Current Score: 5/10 (bloated dependencies)
Target Score: 9/10
```

**Overall Competence Score: Current 12/50 → Target 46/50**

---

## 4. RED FLAGS: Early Warning System

### 🚨 CRITICAL RED FLAGS (Stop immediately)
1. **Creating an abstraction for < 3 implementations**
2. **Adding a design pattern from a textbook**
3. **Writing more than 100 lines without working functionality**
4. **Creating a "system" or "manager" or "factory" class**
5. **Implementing features "for the future"**

### ⚠️ WARNING SIGNS (Question necessity)
1. **File longer than 200 lines**
2. **Function longer than 20 lines**
3. **More than 3 levels of indentation**
4. **Configuration file for configuration files**
5. **Dependency that's larger than your entire codebase**

### 🎭 DECEPTION INDICATORS (Honesty check)
1. **Documentation describing non-existent features**
2. **Mock data presented as real results**
3. **"Coming soon" that's been there > 1 month**
4. **Error messages that lie about what went wrong**
5. **Tests that test mocks instead of reality**

---

## 5. CONTINUOUS REVIEW CHECKLIST

### Daily Standup Questions
- [ ] What actual functionality did we add today?
- [ ] Did we add any abstractions? Were they necessary?
- [ ] Can we delete any code and still maintain functionality?
- [ ] Are we solving real problems or imaginary ones?

### Weekly Architecture Review
- [ ] Calculate lines of code vs. actual functionality ratio
- [ ] Count abstraction layers (target: ≤ 2)
- [ ] Review dependency list (can we remove any?)
- [ ] Test the "new developer" experience (5-minute understanding test)
- [ ] Update Competence Scorecard

### Monthly Reality Check
- [ ] Compare documentation claims vs. actual capabilities
- [ ] Audit all endpoints for real vs. mock responses
- [ ] Review issue tracker for "feature creep" symptoms
- [ ] Calculate technical debt (hours to simplify vs. hours to maintain)

---

## 6. THE COMPETENT REWRITE

### Step 1: Nuclear Option (2 hours)
```bash
# Keep only what works
mkdir claude-conduit-clean
cp index.js claude-conduit-clean/
cp lib/mcp-client.js claude-conduit-clean/lib/
cp package.json claude-conduit-clean/
# Write honest README
# Deploy
```

### Step 2: Actual Features Only (1 day)
1. Remove all fake personas
2. Remove plugin system (hardcode the 3 integrations)
3. Remove all FunkBot stubs
4. Remove knowledge graph theater
5. Update docs to reflect reality

### Step 3: Measure Success
- **Before:** 68,000 lines, 80% fake, incomprehensible
- **After:** 500 lines, 100% real, understood in 5 minutes
- **Efficiency Gain:** 136x reduction, 100% honesty increase

---

## 7. ENFORCEMENT RULES

### The Prime Directive
**"Every line of code must provide immediate, tangible value."**

### The Three Laws of Competent Code
1. **It works** (not "will work" or "could work")
2. **It's obvious** (not clever or sophisticated)
3. **It's minimal** (not extensible or future-proof)

### The Simplicity Test
If you can't explain what your code does to a junior developer in 2 minutes, it's too complex.

### The Deletion Game
Every PR must attempt to delete more lines than it adds. Celebrate negative line counts.

---

## CONCLUSION: Choose Competence

This codebase is currently a monument to everything wrong with modern software development:
- **Complexity worship** over problem-solving
- **Architecture astronautics** over shipping features
- **Resume-driven development** over user value
- **Elaborate deception** over honest limitations

The path to competence is simple:
1. **Delete 99% of the code**
2. **Keep the 500 lines that actually work**
3. **Document honestly**
4. **Resist the urge to "architect"**
5. **Ship something real**

Remember: The best code is no code. The second best is simple code. Everything else is vanity.

---

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."* - Antoine de Saint-Exupéry

**Current Status: Architectural Crime Scene**  
**Target Status: Competent Tool**  
**Path Forward: Delete Everything**