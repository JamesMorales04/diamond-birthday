---
name: docs-review-checklist
description: >
  Project-specific documentation review checklist for docs/code/config drift,
  setup/run/test instruction accuracy, terminology consistency, link/reference
  integrity, and materiality filtering. Use when reviewing documentation changes
  or when code changes may have caused documentation drift.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: "1.0"
---

# Docs Review Checklist Skill

## When to Use

Trigger this skill when reviewing:
- Documentation-only changes (Markdown, ADRs, setup docs, diagrams, prompt files)
- Code or config changes that may have caused documentation drift
- Terminology, naming, or concept consistency across documentation
- Link and reference integrity across the documentation set
- Setup, run, or test instruction accuracy after workflow changes

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Check directly related files that the changed documentation depends on or references
- [ ] Every finding must cite exact file paths, line numbers, or document references; no speculative severity claims

## Docs / Code / Config Drift

- [ ] Documentation reflects the current implementation state, not a previous or planned state
- [ ] Configuration documentation matches actual configuration keys, defaults, and environment variables
- [ ] Module or feature documentation matches actual module structure and responsibilities
- [ ] Diagrams reflect current component relationships and flows

## Setup / Run / Test Instructions

- [ ] Setup instructions produce a working development environment when followed literally
- [ ] Run commands are correct and include required working directory or context
- [ ] Test commands and test-running instructions are current and complete
- [ ] Environment variable documentation covers all required and optional variables

## Terminology Consistency

- [ ] Domain terms are used consistently across all documentation (no synonym drift)
- [ ] Module and component names match canonical naming in the codebase
- [ ] No contradictory definitions of the same concept across different documents

## Link / Reference Integrity

- [ ] All internal links resolve to existing files (no dead links)
- [ ] Cross-references between documents are bidirectional where appropriate
- [ ] External links are current and still valid
- [ ] No duplicated index entries or orphaned cross-references
- [ ] New documentation files have at least one inbound link from an existing canonical doc

## Materiality Filtering

Not every documentation inconsistency requires a finding. Apply materiality thresholds:

- **Critical**: Documentation that, if followed, would cause a build failure, data loss, or broken onboarding path
- **High**: Documentation that contradicts current implementation and would mislead a developer or reviewer
- **Medium**: Documentation that is outdated or incomplete but does not block correctness
- **Low**: Stylistic inconsistency, minor terminology drift, or formatting issues that do not affect comprehension

Do not report findings for:
- Intentionally aspirational or future-state documentation (clearly marked as such)
- Minor formatting differences that do not affect readability or searchability
- Documentation for deprecated features that is clearly marked as deprecated

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type | Route to |
|---|---|
| Architectural documentation (ADRs, diagrams describing structure/layering/dependency direction) | @architecture-reviewer |
| CI/CD, Docker, build pipeline, or deployment documentation | @ops-reviewer |
| Frontend implementation docs describing component behavior or UI patterns | @frontend-reviewer |

## Output

Structure the report using the standardized reviewer format:

- **Agent**: `docs-reviewer` (with `docs-review-checklist`)
- **Verdict**: PASS | FAIL | PASS_WITH_WARNINGS
- **Severity distribution**: count per severity level
- **Scope**: files and documentation areas reviewed
- **Confidence**: HIGH | MEDIUM | LOW
- **Findings table**: columns — Sev, Category, Location (file + line), Evidence, Impact, Recommended fix, Suggested agent
- **Validation**: commands run with exact results, or NOT_AVAILABLE
- **Follow-up**: reviewers to rerun, implementers to delegate

When no issues: Agent, Verdict PASS, Scope, "No findings.", "No follow-up required."
