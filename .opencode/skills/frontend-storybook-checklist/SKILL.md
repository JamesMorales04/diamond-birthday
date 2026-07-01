---
name: frontend-storybook-checklist
description: >
  Project-specific Storybook coverage review checklist for reusable UI components,
  story completeness, variant/state coverage, and static build validation. Use as
  an optional deep-dive skill when the frontend-review-checklist surfaces Storybook
  coverage concerns or when a thorough Storybook audit is requested.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: "1.0"
---

# Frontend Storybook Checklist Skill

## When to Use

Trigger this skill as an optional deep-dive when:
- The main `frontend-review-checklist` surfaces Storybook coverage concerns
- New or modified reusable UI components need story coverage verification
- A thorough Storybook audit is requested for design-system or shared component changes
- Storybook build failures need investigation

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Every finding must cite exact file paths, line numbers, or code evidence; no speculative severity claims

## Coverage Completeness

- [ ] Every new or modified reusable UI component has a corresponding Storybook story file
- [ ] Story file is colocated with the component (same directory) or follows the established story file convention
- [ ] Storybook static build passes (`pnpm build-storybook`)
- [ ] No placeholder-only stories (stories must reflect realistic usage)

## Story States and Variants

- [ ] Default story present for every component
- [ ] All visual variants have dedicated stories (size, color, shape, type)
- [ ] Interactive state stories present where applicable:
  - disabled state
  - loading state
  - active/selected state
  - error state
  - empty state
- [ ] Edge cases covered (long text, no data, max items)
- [ ] Stories demonstrate expected composition (component used within a realistic layout)

## Story Quality

- [ ] Story names are descriptive and follow naming convention
- [ ] Stories use realistic data (not `foo`, `bar`, `Lorem ipsum` unless testing long text)
- [ ] Stories demonstrate accessibility attributes in use (aria labels, roles, states)
- [ ] Stories render at reasonable viewport sizes
- [ ] Interactive stories (args/play) test user interactions where meaningful

## Provider Configuration

- [ ] Storybook preview provides required context providers (Theme, etc.)
- [ ] No global Storybook config overrides that break other stories

## Build and Validation

- [ ] `pnpm build-storybook` completes without errors
- [ ] No console errors or warnings in Storybook output
- [ ] Storybook static output is clean (no broken stories, missing components)

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type | Route to |
|---|---|
| General frontend correctness (beyond Storybook) | @frontend-reviewer with `frontend-review-checklist` |
| Component architecture or module boundaries | @architecture-reviewer |
| Test coverage for component behavior (beyond stories) | @test-reviewer |
| Code-level quality (naming, duplication, readability) | @code-quality-reviewer |

## Output

Structure the report using the standardized reviewer format:

- **Agent**: `frontend-reviewer` (with `frontend-storybook-checklist`)
- **Verdict**: PASS | FAIL | PASS_WITH_WARNINGS
- **Severity distribution**: count per severity level
- **Scope**: files and components reviewed
- **Confidence**: HIGH | MEDIUM | LOW
- **Findings table**: columns — Sev, Category, Location (file + line), Evidence, Impact, Recommended fix, Suggested agent
- **Validation**: commands run with exact results, or NOT_AVAILABLE
- **Follow-up**: reviewers to rerun, implementers to delegate
