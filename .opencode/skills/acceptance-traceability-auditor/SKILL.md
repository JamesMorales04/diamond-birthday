---
name: acceptance-traceability-auditor
description: >
  Build criterion-to-evidence traceability matrices and identify missing
  acceptance proof. Use when verifying that every acceptance criterion maps to
  concrete implementation and test evidence, when audit trails are needed for
  readiness assessment, or when acceptance proof gaps must be surfaced before
  finalization. Triggers on: "acceptance traceability", "criterion evidence
  matrix", "acceptance proof audit", "coverage traceability", "criterion-to-
  implementation mapping", "acceptance criteria audit".
license: MIT

metadata:
  author: project
  version: '1.0'
  generatedBy: '1.3.1'
---

# Acceptance Traceability Auditor

Build criterion-to-evidence traceability matrices and identify missing acceptance proof. This skill focuses on the implementation↔evidence layer.

## When to Use

- After implementation is complete and before final readiness assessment
- When acceptance proof gaps must be surfaced (criteria without code or test evidence)
- When acceptance proof gaps must be surfaced (criteria without code or test evidence)
- When audit trails are needed for readiness sign-off
- When multiple reviewers have run and criterion coverage must be consolidated

## What This Skill Does NOT Do

- Does not replace the integration-validator for cross-cutting review
- Does not run build, test, or lint commands (use @validator)
- Does not edit files or implement fixes

## Traceability Process

### 1. Extract Acceptance Criteria

From the canonical source (user task description or documented requirements), extract every explicit acceptance criterion. Number them sequentially (AC-1, AC-2, ...).

### 2. Map to Implementation Evidence

For each criterion, search the changed files for concrete implementation evidence:

- Code paths that fulfill the criterion
- Configuration or wiring changes that enable the behavior
- File paths and line numbers as evidence

Mark criteria with no implementation evidence as `NOT_COVERED`.

### 3. Map to Test Evidence

For each criterion, search test files for test cases that validate the criterion:

- Test method names that correspond to the criterion
- Assertions that verify the expected behavior
- File paths and line numbers as evidence

Mark criteria with implementation but no test evidence as `NOT_VALIDATED`. Mark criteria with implementation and weak or partial test evidence as `PARTIALLY_COVERED`.

### 4. Detect Drift

Compare the criterion list against the canonical source to detect:

- **Added criteria**: implementation includes behavior not in the canonical source (scope creep)
- **Dropped criteria**: canonical source lists criteria with no corresponding implementation
- **Reordered criteria**: criteria were silently reordered or reworded

### 5. Produce Traceability Matrix

```markdown
## Acceptance Traceability Matrix

**Canonical Source**: Issue #N / Spec / User task
**Reviewed At**: <timestamp>

### Criterion → Evidence Mapping

| #    | Acceptance Criterion | Source        | Implementation Evidence | Test Evidence                     | Status            |
| ---- | -------------------- | ------------- | ----------------------- | --------------------------------- | ----------------- |
| AC-1 | <text>               | Issue #N AC-1 | `path/to/file.cs:42`    | `tests/file_test.cs:18`           | COVERED           |
| AC-2 | <text>               | Issue #N AC-2 | `path/to/file.cs:100`   | —                                 | NOT_VALIDATED     |
| AC-3 | <text>               | Issue #N AC-3 | —                       | —                                 | NOT_COVERED       |
| AC-4 | <text>               | Issue #N AC-4 | `path/to/file.cs:50`    | `tests/file_test.cs:10` (partial) | PARTIALLY_COVERED |

### Status Semantics

- **COVERED**: implementation and test evidence both present.
- **PARTIALLY_COVERED**: implementation exists but test evidence is missing or weak.
- **NOT_COVERED**: no implementation evidence found.
- **NOT_VALIDATED**: implementation exists but no validation/test evidence available.

### Drift Findings

- [Any added, dropped, or reordered criteria]

### Summary

- Total criteria: N
- COVERED: X
- PARTIALLY_COVERED: W
- NOT_VALIDATED: Y
- NOT_COVERED: Z
- Drift items: D
```

## Guardrails

- Every criterion from the canonical source must appear in the matrix — do not skip criteria
- Evidence must be concrete (file paths, line numbers) — no vague claims
- Do not run validation commands — reference existing validation output
- Do not modify implementation or tests — only report traceability gaps
