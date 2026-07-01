---
name: finding-deduper
description: >
  Merge overlapping reviewer findings into canonical remediation targets. Use
  when multiple reviewers report the same or similar issues, when finding lists
  need deduplication before routing, or when remediation tasks need consolidation.
  Triggers on: "dedup findings", "merge findings", "consolidate findings",
  "finding deduplication", "clean up reviewer output", "overlapping findings".
license: MIT
metadata:
  author: project
  version: "1.0"
  generatedBy: "1.3.1"
---

# Finding Deduper

Merge overlapping reviewer findings into a single set of canonical remediation targets. This skill prevents duplicate routing and ensures each real issue gets one actionable task.

## When to Use

- Multiple reviewers have run and their finding lists overlap
- The orchestrator needs a deduplicated task list before routing to implementers
- Reviewer findings reference the same code location from different angles
- The integration-validator is consolidating output from specialist reviewers

## Deduplication Process

### 1. Collect All Findings

Gather findings from every reviewer report. Each finding has:

- Severity (`Critical`, `High`, `Medium`, `Low`)
- Category (`build`, `test`, `architecture`, `frontend`, `docs-drift`, etc.)
- Location (file path and line range)
- Evidence (what was observed)
- Impact (what could go wrong)
- Recommended fix
- Suggested agent

### 2. Group by Location

Group findings that reference the same file and overlapping line ranges. Two findings are candidates for merging if they share:

- The same file path
- Overlapping or adjacent line ranges (within 10 lines)
- Related categories (e.g., `frontend` + `maintainability`, `architecture` + `docs-drift`)

### 3. Apply Merge Rules

When merging findings:

| Rule | Action |
| ------ | -------- |
| **Same location, same issue** | Keep the higher-severity finding; drop the duplicate |
| **Same location, different symptoms** | Merge into one finding; combine evidence and impact |
| **Same issue, different locations** | Keep as separate findings unless the fix is identical |
| **Overlapping categories** | Prefer the more specific category (e.g., `security` over `architecture`) |
| **Conflicting severity** | Keep the higher severity; note the discrepancy |
| **Conflicting agent suggestions** | Prefer the agent that owns the category per routing matrix |

### 4. Produce Canonical Remediation Targets

Output the deduplicated list:

```markdown
## Deduplicated Findings

| # | Severity | Category | Location | Evidence | Impact | Fix | Agent |
| --- | ---------- | ---------- | ---------- | ---------- | -------- | ----- | ------- |
| F1 | High | frontend | `components/gallery.tsx:42-58` | ... | ... | ... | @frontend-reviewer |
| F2 | Medium | maintainability | `src/data/timeline.ts:100-120` | ... | ... | ... | @quality-implementer |

### Merged Duplicates

| Original Findings | Merged Into | Reason |
| ------------------- | ------------- | -------- |
| F3 (from @frontend-reviewer), F5 (from @architecture-reviewer) | F2 | Same file, overlapping scope, frontend owns fix |

### Drop Count

- Total input findings: N
- After dedup: M
- Duplicates merged: X
- Duplicates dropped: Y
```

## Guardrails

- Do not drop findings without documenting the merge reason
- Do not merge findings from unrelated categories unless location overlap is exact
- When in doubt, keep as separate findings rather than risk losing an issue
- Preserve all severity levels — do not downgrade during merge
