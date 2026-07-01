---
name: recovery-classifier
description: >
  Classify agent failures into canonical recovery types before retry routing.
  Use when an agent fails, times out, or produces invalid output, and the
  orchestrator needs to decide the correct recovery path. Triggers on: "agent
  failed", "classify failure", "recovery type", "retry routing", "agent error",
  "failure classification".
license: MIT

metadata:
  author: project
  version: "1.0"
  generatedBy: "1.3.1"
---

# Recovery Classifier

Classify agent failures into canonical recovery types so the orchestrator routes recovery to the correct path. This skill prevents blind retries and ensures each failure type gets the right response.

> **Scope note**: The types below are the canonical recovery types owned by the orchestrator's retry-routing policy (`orchestrator_append.md`). This skill classifies agent failures into exactly these types so the orchestrator can route recovery without ambiguity.

## When to Use

- An agent returns an error, times out, or produces unusable output
- The orchestrator needs to decide whether to retry, reroute, or escalate
- Multiple failures have occurred and patterns need identification
- The planner is generating recovery tasks after agent failure

## Canonical Recovery Types

These are the **same canonical types the orchestrator uses for retry routing** (`orchestrator_append.md`). Every classification must use one of these exact type names — do not invent new labels.

| Type | Signal | Description |
| --- | --- | --- |
| **PATCH_CONTEXT_MISMATCH** | Expected lines, hunks, or file context were not found during a patch/edit operation. | The agent's patch targeted outdated or missing file context. |
| **TOOL_FAILURE** | Shell, patch, file read, write, or environment tool returned an error. | Includes network timeouts, API rate limits, 503/429 responses, and transient resource errors. |
| **MISSING_CONTEXT** | The agent did not inspect enough repository context before acting. | Output addresses wrong files, references nonexistent modules, or misreads existing patterns. |
| **WRONG_AGENT** | The task was routed to an agent with the wrong domain or capability. | Agent lacks ownership of the work it was given. |
| **VALIDATION_FAILURE** | Build, test, lint, typecheck, migration, Docker, or CI-equivalent command failed. | The code change passed the agent's internal logic but broke a quality gate. |
| **REVIEW_FAILURE** | Reviewer found blocking issues in the agent's output. | Includes both code-review and integration-review failures. |
| **AMBIGUOUS_OUTPUT** | Agent response is incomplete, unclear, or does not prove completion. | Output is partial, contains placeholders, or omits required evidence. |
| **CONFLICTING_RESULTS** | Two agents disagree or produce incompatible recommendations. | Includes contradictory file changes, incompatible architecture suggestions, or conflicting test outcomes. |

## Classification Steps

### 1. Capture Failure Evidence

For the failed agent run, collect:

- Agent name and task ID
- Error message or timeout signal
- Last 20 lines of agent output
- Input that was provided to the agent
- How many times this agent has been retried on this task

### 2. Match Against Type Signals

Check the evidence against each canonical type:

1. **PATCH_CONTEXT_MISMATCH** — The agent tried to patch/edit but the expected lines or file context were not found. Look for "file content changed", "context does not match", or hunk failure messages.
2. **TOOL_FAILURE** — A tool call failed. Look for timeout, rate limit, ECONNRESET, 503, 429, or "command exited with code".
3. **MISSING_CONTEXT** — The agent skipped essential context gathering. Output references wrong files, misses existing patterns, or says "I didn't see that".
4. **WRONG_AGENT** — The agent attempted work outside its domain. Output addresses modules it does not own.
5. **VALIDATION_FAILURE** — The code change broke a quality gate. Look for build errors, test failures, lint warnings, typecheck errors, or migration issues.
6. **REVIEW_FAILURE** — A reviewer flagged blocking issues. Look for review comments requesting changes.
7. **AMBIGUOUS_OUTPUT** — The agent's response is incomplete or unclear. Look for placeholders, missing proof of completion, or partial output.
8. **CONFLICTING_RESULTS** — Two agents produced incompatible work. Look for contradictory file edits, architecture disagreements, or conflicting test outcomes.

### 3. Check Retry History

Before classifying, check how many times this agent has been retried:

- **First failure** — Most types allow one retry
- **Second failure on same task** — Escalate to `@oracle` unless the recovery path was not previously tried
- **Third failure** — Always stop and report the blocker; do not retry

### 4. Output Classification

```markdown
## Failure Classification

**Agent**: `@<agent-name>`
**Task**: `<task-id>`
**Retry count**: N

### Evidence

- Error: `<error message or signal>`
- Output summary: `<what the agent produced>`
- Retry history: `<previous attempts>`

### Classification: `<TYPE>`

### Recommended Recovery Path

1. **Action**: `<retry same agent / fix input / reroute to @X / escalate>`
2. **Changes needed**: `<what must change before retry>`
3. **Escalation**: `<@oracle / user / wait>`
```

## Guardrails

- Never retry more than twice on the same task without escalation
- Never reroute to an agent that has already failed on the same task
- Always document the classification rationale — do not route on intuition
- If the failure type is unclear, classify as `WRONG_AGENT` (safest default) and route to the nearest domain specialist
