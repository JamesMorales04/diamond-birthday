---
name: frontend-implementation-checklist
description: >
  Project-specific frontend implementation checklist for React/Vite/TypeScript SPA:
  component patterns, data-driven content, SCSS styling, game state with
  localStorage, required UI states, accessibility basics, and validation
  expectations. Use when implementing frontend changes that need implementation-side
  discipline and structured reporting. Not a reviewer checklist; this skill guides
  the implementer on safe execution and handoff.
license: MIT
compatibility: Works alongside frontend-review-checklist, frontend-storybook-checklist, and frontend-a11y-checklist.
metadata:
  author: ops
  version: '1.0'
---

# Frontend Implementation Checklist Skill

An implementer-focused skill for safe frontend work. Complements `frontend-review-checklist` (reviewer-side) by guiding the implementer through mandatory checks before handoff.

## When to Use

Trigger this skill when **implementing** (not reviewing) changes that involve:

- React/Vite/TypeScript components, pages, or feature modules
- Data-driven content sections (timeline, gallery, letters, shared moments)
- Mini-games or interactive elements
- Animations, transitions, or scroll-triggered effects
- Responsive styling and romantic editorial layout
- localStorage game state or preferences
- A11y improvements, semantic HTML, and keyboard navigation
- Reusable UI components that require Storybook coverage

## Required Context

Before making any edit, confirm these files have been read:

- `AGENTS.md`

## Implementation Discipline

- [ ] Inspect the current implementation and adjacent callers before choosing a pattern
- [ ] Keep the change inside one bounded frontend workstream whenever possible
- [ ] One top-level runtime export per file (components, hooks, utilities)
- [ ] Barrel export (`index.ts`) for any new or modified shared module surface
- [ ] Prefer existing patterns, components, and conventions over introducing a new abstraction
- [ ] Avoid unrelated refactors, broad renames, or opportunistic cleanup outside the task
- [ ] Keep acceptance criteria visible while implementing; do not silently drop or reorder behavior

## Data-Driven Content

This project uses centralized data files for all editorial content (timeline entries, gallery items, letters, mini-game data).

- [ ] Content data is read from data files (TypeScript/JSON modules under `src/data/` or equivalent), never hardcoded in components
- [ ] Each content type has a clear TypeScript interface/type definition
- [ ] Data files are structured, typed, and documented
- [ ] Missing or malformed data handled gracefully (empty state, fallback UI)
- [ ] Content additions follow the established data schema

## localStorage Game State

Mini-game progress and user preferences use localStorage for persistence.

- [ ] localStorage reads have fallback defaults (never assume a key exists)
- [ ] localStorage writes are wrapped in try/catch (private browsing may block writes)
- [ ] Game state schema is typed and versioned
- [ ] No sensitive or large data stored in localStorage
- [ ] State is initialized on first visit (default values when nothing stored)

## Styling (SCSS / No Inline Styles)

- [ ] SCSS used for all styling; no Tailwind CSS, Material UI, Bootstrap, or similar frameworks
- [ ] Design tokens from shared variables file used where applicable
- [ ] BEM or project-chosen naming convention followed consistently
- [ ] No inline `style={{}}` props on JSX elements
- [ ] Component-specific styles use CSS Modules or co-located SCSS
- [ ] Responsive behavior handled via SCSS mixins or media queries
- [ ] Animations use CSS transitions/animations or lightweight libraries; avoid heavy animation frameworks

## Required UI States

Every feature page or route must implement, at minimum:

- [ ] Loading state (`<LoadingState />` or inline spinner/skeleton)
- [ ] Empty state (`<EmptyState title={...} description={...} />`)
- [ ] Error state (`<ErrorState onRetry={...} />` or inline error display)
- [ ] Not-found state considered for content-driven sections ("This letter doesn't exist" etc.)

## Storybook Coverage (Reusable Components)

For new or modified reusable UI components:

- [ ] Storybook stories added or updated in the same task
- [ ] Stories cover default render, all visual variants, and behavior states (disabled, loading, active, error) where applicable
- [ ] `pnpm build-storybook` passes (if Storybook is configured)

## Accessibility Basics

- [ ] Semantic HTML elements used (`<nav>`, `<main>`, `<header>`, `<section>`, `<button>`, `<article>`)
- [ ] `aria-label` on icon-only buttons and inputs without visible labels
- [ ] `htmlFor` + `id` association on all `<label>` + `<input>` pairs
- [ ] Error messages have `role="alert"` or `aria-live="polite"`
- [ ] Focus visible styles preserved (no `outline: none` without replacement)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Modal/dialog overlays have accessible title and description; close via Escape; focus trapped

## Validation Expectations

Before handoff, confirm results for:

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run format:check`

Do not claim validation passed unless commands actually ran.

## Escalation Triggers

Flag these explicitly so the orchestrator routes the correct reviewer:

| Change type                                          | Route to          |
| ---------------------------------------------------- | ----------------- |
| Documentation sync (behavior, setup, routes changed) | @docs-implementer |
| Test gaps or missing coverage                        | @test-implementer |

## Validation Handoff

- Prepare exact validation commands for `@validator`; do not claim validation you did not run
- List the specialist reviewers that should re-check the change
- Include docs follow-up if the implementation changes behavior or setup

## Output Shape

Return work in a compact implementation summary with:

- **Files changed**
- **UI behavior**
- **Required state coverage**
- **Assumptions**
- **Decisions made**
- **Risks**
- **Validation commands for @validator**
- **Reviewers to re-run**
- **Follow-up**
