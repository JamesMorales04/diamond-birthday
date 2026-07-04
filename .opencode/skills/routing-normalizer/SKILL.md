---
name: routing-normalizer
description: >
  Normalize planner output into a consistent 7-item delegation plan shape.
  Use when the planner produces a raw task list, when delegation tasks need
  structural validation, or when the orchestrator needs a clean plan to route.
  Triggers on: "normalize plan", "clean plan", "plan shape check", "validate
  delegation plan", "normalize planner output".
license: MIT

metadata:
  author: project
  version: '1.0'
  generatedBy: '1.3.1'
---

# Routing Normalizer

Normalize a planner's raw output into a consistent, routable delegation plan. This skill ensures every plan has the seven required fields before the orchestrator delegates.

## When to Use

- The planner returns a task list that needs structural normalization
- A delegation plan is missing required fields
- The orchestrator needs to validate plan shape before routing
- Reviewer findings need to be converted into routable tasks

## Required Plan Shape

Every delegation task must contain all seven fields:

| #   | Field          | Description                                       |
| --- | -------------- | ------------------------------------------------- |
| 1   | `id`           | Unique task identifier (e.g., `T1`, `T2`)         |
| 2   | `summary`      | One-sentence description of what needs to happen  |
| 3   | `agent`        | Target agent name (e.g., `@frontend-implementer`) |
| 4   | `scope`        | Files, modules, or areas this task touches        |
| 5   | `dependencies` | Task IDs that must complete first (`[]` if none)  |
| 6   | `acceptance`   | Concrete criteria that prove the task is done     |
| 7   | `risk`         | Risk level: `low`, `medium`, or `high`            |

## Normalization Steps

### 1. Ingest Raw Plan

Read the planner output. Identify tasks as distinct units of work — typically separated by headings, numbered lists, or blank lines.

### 2. Validate Shape

For each task, check that all seven fields are present. If a field is missing:

- `id` — auto-assign sequential IDs (`T1`, `T2`, ...)
- `summary` — extract from surrounding context or heading
- `agent` — infer from scope and description using the routing matrix
- `scope` — extract file paths, module names, or area references
- `dependencies` — default to `[]` unless sequential ordering is explicit
- `acceptance` — derive from the summary as a minimal pass/fail criterion
- `risk` — default to `medium` when unclear

### 3. Detect Conflicts

Flag these issues before outputting the normalized plan:

- Two tasks targeting the same files without sequencing
- A task depending on a non-existent ID
- A task assigned to an agent that does not own the scope (e.g., `@frontend-implementer` assigned ops configuration files)
- Acceptance criteria that are vague or untestable

### 4. Output Normalized Plan

Produce the seven-field plan in a clean table or structured list. Include a brief conflict report if issues were detected.

## Output Format

```markdown
## Normalized Delegation Plan

| ID  | Summary | Agent  | Scope | Dependencies | Acceptance | Risk   |
| --- | ------- | ------ | ----- | ------------ | ---------- | ------ |
| T1  | ...     | @agent | ...   | []           | ...        | low    |
| T2  | ...     | @agent | ...   | [T1]         | ...        | medium |

### Conflicts Detected

- [Any conflicts or "None"]
```

## Guardrails

- Do not invent business logic or scope — only normalize structure
- Do not change agent assignments unless the original is clearly wrong per the routing matrix
- If the planner output is fundamentally broken (no discernible tasks), stop and report the issue instead of guessing
