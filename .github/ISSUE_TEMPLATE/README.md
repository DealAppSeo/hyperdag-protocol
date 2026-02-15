# GitHub Issue Templates for Trinity Symphony

This folder contains standardized templates for managing work across the Trinity Symphony multi-agent ecosystem.

## 🎯 Template Overview

| Template | Use When | Key Feature |
|----------|----------|-------------|
| 🐛 **Bug Report** | Something is broken | Structured investigation + agent assignment |
| 🔄 **Agent Handoff** | Passing work between Claude/Gemini/Grok | Heterogeneous Protocol compliance |
| ✨ **Feature Request** | Proposing new functionality | Alignment checks (mission, ethics, efficiency) |
| 📌 **Sprint Task** | Individual work items | Progress tracking + verification |
| 🔍 **Verification Request** | Cross-agent code review | Enforces different LLM verification |
| 📐 **Decision Record** | Architectural decisions | Options analysis + rationale |

## 🤖 Heterogeneous Protocol

All templates enforce our core rule:

> **Verifying agent MUST use a different LLM than the authoring agent.**

| If Author Is | Verifier Must Be |
|--------------|------------------|
| Claude | Gemini or Grok |
| Gemini | Claude or Grok |
| Grok | Claude or Gemini |

## 📋 Workflow

### Starting Work
1. Read `AI_CONTEXT.md` in repo root
2. Create appropriate issue from template
3. Assign to agent + verifier

### During Work
1. Update issue with progress
2. Commit code with issue reference (`fixes #123`)
3. Update `AI_CONTEXT.md` session log

### Completing Work
1. Create **Verification Request** issue
2. Different agent reviews
3. Update original issue status
4. Update `AI_CONTEXT.md`

## 🏷️ Labels

Recommended labels for your repository:

```
bug               - Something isn't working
enhancement       - New feature or improvement
handoff           - Cross-agent task transfer
verification      - Needs verification by different agent
sprint-task       - Current sprint work item
decision          - Architectural decision
triage            - Needs initial assessment
blocked           - Cannot proceed
heterogeneous-protocol - Multi-LLM coordination
```

## 📁 File Structure

```
.github/
├── ISSUE_TEMPLATES/
│   ├── config.yml           # Template chooser config
│   ├── bug_report.md        # Bug reports
│   ├── agent_handoff.md     # Cross-agent transfers
│   ├── feature_request.md   # New features
│   ├── sprint_task.md       # Sprint work items
│   ├── verification_request.md  # Code review requests
│   ├── decision_record.md   # ADRs
│   └── README.md            # This file
└── AI_CONTEXT.md            # (in repo root, not here)
```

## ⚠️ Critical Reminders

These rules are embedded in templates but worth repeating:

1. **DO NOT ASSUME** column names or table structures
2. **DO NOT SIMPLIFY** or remove unrelated code
3. **Query actual schema** before writing SQL
4. **Fix only the specific error** being addressed
5. **Verify before claiming done**

---

*Templates created for Trinity Symphony v2.0 - "For the last, the lost, and the least"*
