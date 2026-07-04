---
name: code-quality-review-checklist
description: >
  Project-specific code quality review checklist for maintainability, duplication,
  readability, naming, cohesion, function/class size, error handling, edge-case
  coverage, pattern consistency, avoidable complexity, and low-severity quality
  notes. Use when reviewing code changes for clean-code and maintainability
  concerns.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: '1.0'
---

# Code Quality Review Checklist Skill

## When to Use

Trigger this skill when reviewing code changes for quality concerns such as:

- Naming, readability, duplication, or cohesion
- Function/component size, complexity, or single responsibility violations
- Error handling completeness and edge-case coverage
- Pattern consistency and avoidable complexity
- Review findings labeled "improvement", "nit", "low severity", or "maintainability"

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Check directly related files that share patterns or conventions with the changed code
- [ ] Every finding must cite exact file paths, line numbers, or code evidence; no speculative severity claims

## Naming and Readability

- [ ] Names clearly communicate intent (no single-letter variables except loop indices)
- [ ] No misleading or ambiguous names
- [ ] No abbreviations that are not widely understood
- [ ] Boolean names read as predicates (`isOpen`, `hasItems`, `canSubmit`)
- [ ] Function names describe what they do (verb + noun pattern)
- [ ] Component names are descriptive and follow project conventions
- [ ] No commented-out code blocks

## Duplication

- [ ] No duplicated logic across files or components
- [ ] Repeated patterns are extracted into shared utilities or components
- [ ] Duplicated CSS is avoided (shared variables, mixins, or utility classes used)
- [ ] No copy-pasted test setup or assertions

## Cohesion and Size

- [ ] Components/functions have a single responsibility
- [ ] No component exceeds a reasonable size (aim for under 300 lines; split when responsibilities diverge)
- [ ] No function exceeds 50 lines without justification
- [ ] JSX is not deeply nested without extraction of sub-components
- [ ] Files with multiple unrelated exports are split

## Error Handling

- [ ] All error paths are handled (null checks, missing data, failed loads)
- [ ] Error messages are user-friendly where displayed to users
- [ ] Console errors are properly caught, not silently swallowed
- [ ] Async operations have error boundaries or try/catch
- [ ] Fallback UI is provided for error states

## Edge Cases

- [ ] Empty collections/data handled gracefully
- [ ] Boundary values tested (min/max, first/last item)
- [ ] Missing or null data handled with fallbacks
- [ ] Very long text or content does not break layout
- [ ] Rapid repeated interactions do not cause issues (debouncing, state guards)

## Pattern Consistency

- [ ] Code follows existing project patterns (not introducing a new style for the same concern)
- [ ] Import order follows project conventions
- [ ] State management approach is consistent across similar features
- [ ] Event handling follows consistent naming and patterns

## Avoidable Complexity

- [ ] No unnecessary abstractions (interfaces, indirection, or patterns not justified by actual complexity)
- [ ] No deeply nested conditionals — extract early returns or helper functions
- [ ] No overly complex expressions without explanation
- [ ] No unnecessary optional chaining or nullish coalescing where values are guaranteed

## Finding Deduplication

When multiple reviewers return overlapping findings for the same issue:

- Merge them into a single canonical finding
- Preserve the highest severity and most specific location evidence
- Suggest a single executor_agent for the merged finding
- Reference the original findings so the orchestrator can trace merged results

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type                                                     | Route to               |
| ---------------------------------------------------------------- | ---------------------- |
| Architecture (module boundaries, layering, dependency direction) | @architecture-reviewer |
| Frontend component logic or UX behavior                          | @frontend-reviewer     |
| Test coverage and test quality                                   | @test-reviewer         |
| Documentation accuracy and setup                                 | @docs-reviewer         |
| CI/CD, Docker, build pipeline, or deployment                     | @ops-reviewer          |

## Output

Structure the report using the standardized reviewer format:

- **Agent**: `code-quality-reviewer` (with `code-quality-review-checklist`)
- **Verdict**: PASS | FAIL | PASS_WITH_WARNINGS
- **Severity distribution**: count per severity level
- **Scope**: files and modules reviewed
- **Confidence**: HIGH | MEDIUM | LOW
- **Findings table**: columns — Sev, Category, Location (file + line), Evidence, Impact, Recommended fix, Suggested agent
- **Validation**: commands run with exact results, or NOT_AVAILABLE
- **Follow-up**: reviewers to rerun, implementers to delegate, including Low severity and improvement notes when actionable
