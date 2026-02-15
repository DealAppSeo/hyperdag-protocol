---
name: 🔍 Verification Request
about: Request cross-agent verification per Heterogeneous Protocol
title: '[VERIFY] '
labels: verification, heterogeneous-protocol
assignees: ''
---

## 🔍 Verification Request

| Field | Value |
|-------|-------|
| **Work Completed By** | <!-- Claude / Gemini / Grok --> |
| **Verification Requested From** | <!-- MUST be different agent --> |
| **Date Submitted** | <!-- YYYY-MM-DD --> |
| **Related Task/PR** | <!-- #issue or PR link --> |

## 📋 What Was Built
<!-- Summary of the completed work -->

## 📁 Files to Review
```
/path/to/file1.ts
/path/to/file2.py
```

## 🎯 Original Acceptance Criteria
<!-- Copy from the original task -->
- [ ] 
- [ ] 
- [ ] 

## 🧪 Verification Instructions

### Automated Tests
```bash
# Commands to run
npm test
# or
python -m pytest
```

### Manual Verification Steps
1. 
2. 
3. 

### Expected Results
<!-- What should the verifier see if everything works? -->

## ⚠️ Known Limitations
<!-- Anything the verifier should be aware of -->
- 

## 🤖 Heterogeneous Protocol Compliance

### Author's Stack
- **LLM Used:** <!-- Claude / Gemini / Grok -->
- **Data Sources:** <!-- e.g., EIP-8004 docs, Supabase schema -->

### Verifier Requirements
- [ ] Use DIFFERENT LLM than author
- [ ] Use DIFFERENT data sources for cross-check
- [ ] Document verification approach below

---

## 📝 Verification Report (Completed by Verifier)

**Verifier:** <!-- Agent name -->
**Date:** <!-- YYYY-MM-DD -->
**LLM Used:** <!-- Must be different from author -->

### Verification Approach
<!-- How did you verify? What sources did you use? -->

### Results

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| Criterion 1 | ✅ / ❌ | |
| Criterion 2 | ✅ / ❌ | |
| Criterion 3 | ✅ / ❌ | |

### Issues Found
<!-- List any problems discovered -->
- 

### Recommendations
<!-- Suggestions for improvement -->
- 

### Verdict
- [ ] ✅ **APPROVED** - Ready to merge/deploy
- [ ] ⚠️ **APPROVED WITH NOTES** - Minor issues, can proceed
- [ ] ❌ **CHANGES REQUESTED** - Must address issues before approval

---

### 📊 Metrics (Auto-tracked)
- Time from submission to verification: 
- Issues found: 
- Verification iterations: 
