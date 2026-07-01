---
name: architecture-review-checklist
description: >
  Project-specific architecture review checklist for module/layer boundary
  correctness, dependency direction, architecture-doc drift, shared abstraction
  justification, concept duplication, and explicit handoff boundaries to
  specialist reviewers. Use when reviewing structural and architectural code
  changes.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: "1.0"
---

# Architecture Review Checklist Skill

## When to Use

Trigger this skill when reviewing structural code changes that involve:
- Module boundaries, folder structure, or dependency direction
- New modules, services, or shared abstractions
- Architectural documentation, ADRs, or diagrams
- Cross-component or cross-module contracts
- Naming or concept duplication across architectural boundaries
- Framework or library selections with structural impact

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Check directly related modules and dependencies to understand the full picture
- [ ] Every finding must cite exact file paths, module boundaries, or dependency evidence; no speculative severity claims

## Module Boundary Checks

- [ ] Each module has a clear, documented responsibility
- [ ] Dependency direction follows established conventions (no circular dependencies)
- [ ] No module depends on implementation details of another module
- [ ] Shared abstractions are justified (not premature or speculative)
- [ ] Public exports from each module are explicit and minimal
- [ ] Barrel exports (`index.ts`) used for module public surfaces
- [ ] No deep imports across module boundaries

## Architectural Consistency

- [ ] The change follows the existing architectural pattern (or intentionally diverges with justification)
- [ ] Naming conventions are consistent across modules
- [ ] No duplicate concepts represented differently across modules
- [ ] The change does not introduce a new pattern when the existing pattern would work
- [ ] Abstraction level is appropriate (not over-engineered, not too leaky)

## Separation of Concerns

- [ ] Components, data, utilities, and content are in appropriate locations
- [ ] No mixing of concerns in a single file or module
- [ ] Data files are separate from component logic
- [ ] Utilities are generic and reusable where appropriate
- [ ] Game state logic is separated from presentational components

## Documentation and ADR Consistency

- [ ] Architectural docs, ADRs, and diagrams reflect current module structure
- [ ] If implementation contradicts an existing ADR, flag the mismatch
- [ ] New architectural decisions have corresponding documentation
- [ ] No architecture docs contradicting current implementation

## Performance-Related Architecture

- [ ] Lazy loading or code splitting considered for heavy modules
- [ ] Asset loading strategy is appropriate (preload, lazy, async)
- [ ] Build output structure is considered for deployment

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type | Route to |
|---|---|
| Frontend component correctness or UX | @frontend-reviewer |
| Code-level quality (naming, duplication, readability) | @code-quality-reviewer |
| Test coverage and test quality | @test-reviewer |
| CI/CD, Docker, build pipeline, or deployment | @ops-reviewer |
| Documentation accuracy and setup | @docs-reviewer |

## Output

Structure the report using the standardized reviewer format:

- **Agent**: `architecture-reviewer` (with `architecture-review-checklist`)
- **Verdict**: PASS | FAIL | PASS_WITH_WARNINGS
- **Severity distribution**: count per severity level
- **Scope**: files and modules reviewed
- **Confidence**: HIGH | MEDIUM | LOW
- **Findings table**: columns — Sev, Category, Location (file + line), Evidence, Impact, Recommended fix, Suggested agent
- **Validation**: commands run with exact results, or NOT_AVAILABLE
- **Follow-up**: reviewers to rerun, implementers to delegate
