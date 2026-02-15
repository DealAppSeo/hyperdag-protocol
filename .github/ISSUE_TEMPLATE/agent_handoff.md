---
name: 🔄 Agent Handoff
about: Transfer a task between AI agents (Claude, Gemini, Grok)
title: '[HANDOFF] [From] → [To]: '
labels: handoff, agent-coordination
assignees: ''
---

## 🔄 Handoff Summary

| Field | Value |
|-------|-------|
| **From Agent** | <!-- Claude / Gemini / Grok --> |
| **To Agent** | <!-- Claude / Gemini / Grok (MUST be different) --> |
| **Date** | <!-- YYYY-MM-DD --> |
| **Sprint** | <!-- Phase 0 Week 1 / etc --> |

## 📋 Task Description
<!-- What needs to be done by the receiving agent -->

## 🎯 Acceptance Criteria
<!-- How do we know this is done? Be specific. -->
- [ ] 
- [ ] 
- [ ] 

## 📁 Files Involved
<!-- List all relevant files the receiving agent needs to know about -->
```
/path/to/file1.ts
/path/to/file2.py
```

## 🔗 Context & Dependencies
<!-- What does the receiving agent need to understand? -->

### Decisions Already Made
<!-- List any architectural or technical decisions -->
- 

### Related Issues/PRs
<!-- Link to related work -->
- 

### Supabase Tables Involved
<!-- If applicable -->
- 

## ⚠️ Blockers & Risks
<!-- What might go wrong? What should the receiving agent watch for? -->
- 

## 📊 Current State
<!-- What's already done? What's the starting point? -->

```
STATUS:
├── ✅ Completed: 
├── 🔄 In Progress: 
└── ⏳ Not Started: 
```

## 🧪 Verification Instructions
<!-- How should the receiving agent verify the work when complete? -->

1. 
2. 
3. 

## 🤖 Heterogeneous Protocol Compliance
- [ ] Receiving agent uses DIFFERENT LLM than sending agent
- [ ] Receiving agent will use DIFFERENT data sources for verification
- [ ] Cross-verification agent identified: <!-- Agent name -->

---

### 📝 Handoff Checklist (Sending Agent)
- [ ] AI_CONTEXT.md updated with current status
- [ ] All relevant code committed and pushed
- [ ] No uncommitted local changes
- [ ] Environment variables documented (not values, just names)
- [ ] Test commands provided

### 📝 Acceptance Checklist (Receiving Agent)
- [ ] Read AI_CONTEXT.md before starting
- [ ] Confirmed understanding of acceptance criteria
- [ ] Identified verification approach
- [ ] Updated this issue with "Accepted" comment
