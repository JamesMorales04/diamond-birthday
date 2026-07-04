---
name: frontend-review-checklist
description: >
  Project-specific frontend review checklist for component correctness, page/layout
  structure, data-driven content, state management, styling, accessibility,
  performance, testing, and maintainability. Use when reviewing frontend code
  changes that touch components, pages, routes, state, styling, or content
  integration. Does not replace test-coverage or architecture specialist ownership.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: '1.0'
---

# Frontend Review Checklist Skill

## When to Use

Trigger this skill when reviewing frontend code changes that involve:

- React components, pages, routes, or layouts
- Data-driven content sections (timeline, gallery, letters)
- Mini-games or interactive features
- localStorage state management
- Accessibility, keyboard navigation, focus management, or semantic markup
- Styling, design tokens, or responsive behavior
- Error handling in content or data display
- Bundle/performance regressions or unnecessary rerenders
- Test coverage for key UI states and user flows
- Storybook coverage for reusable UI components

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target (PR branch, commit range, or working directory) before drawing conclusions
- [ ] Check directly related files that the changed code depends on or references (hooks, data files, types, styles)
- [ ] Every finding must cite exact file paths, line numbers, or code evidence; no speculative severity claims

## Architecture Checks

- [ ] One top-level runtime export (component/hook/service/store) per file
- [ ] Barrel export (`index.ts`) for public module surface
- [ ] No direct deep imports across modules (import from barrel)
- [ ] File split when multiple unrelated reasons to change exist
- [ ] Cohesive orchestrators allowed when they coordinate a single bounded frontend responsibility

## States (Loading / Empty / Error)

- [ ] Loading state implemented (`<LoadingState />` or inline)
- [ ] Empty state implemented (`<EmptyState title={...} description={...} />`)
- [ ] Error state implemented (`<ErrorState onRetry={...} />` or inline)
- [ ] Not-found state considered for content-driven sections

## Data-Driven Content Checks

- [ ] Content data is loaded from data files, not hardcoded in components
- [ ] Each content type has typed interfaces
- [ ] Missing or malformed data handled gracefully (fallback display)
- [ ] Content additions follow existing data schema
- [ ] No magic strings or hardcoded content IDs in component logic

## localStorage State Checks

- [ ] localStorage reads have fallback defaults
- [ ] localStorage writes wrapped in try/catch
- [ ] Game state schema is typed and versioned
- [ ] State initialized with default values on first visit
- [ ] No server-dependent or sensitive data stored in localStorage

## Styling Checks

- [ ] SCSS used; no Tailwind CSS, Material UI, Bootstrap, or Ant Design
- [ ] Project design tokens used where applicable
- [ ] BEM or project naming convention followed
- [ ] No inline `style={{}}` props (use SCSS classes)
- [ ] Responsive behavior handled via mixins or media queries
- [ ] Component-specific styles use CSS Modules or co-located SCSS
- [ ] Animations are smooth, accessible (prefers-reduced-motion respected)

## Accessibility (a11y) Checks

- [ ] Semantic HTML elements used (`<nav>`, `<main>`, `<header>`, `<section>`, `<button>`)
- [ ] `aria-label` on icon-only buttons and inputs without visible labels
- [ ] `htmlFor` + `id` association on all `<label>` + `<input>` pairs
- [ ] Error messages have `role="alert"` or `aria-live="polite"`
- [ ] Focus visible styles preserved (no `outline: none` without replacement)
- [ ] Color not the only indicator of state (icons + text + color)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Modal dialogs have accessible title and description
- [ ] Focus is trapped inside open modals and restored on close
- [ ] Target WCAG 2.1 Level AA compliance
- [ ] Touch targets at least 44x44 CSS pixels
- [ ] `prefers-reduced-motion` respected for animations

## State Management Checks

- [ ] Game/preference state uses localStorage (not Redux, not global state library)
- [ ] Component state uses React hooks (`useState`, `useReducer`, `useContext`)
- [ ] URL state uses React Router (if routing is used)
- [ ] No server-state caching patterns applied to static SPA data

## Testing Checks

- [ ] Unit tests for utilities and hooks
- [ ] Component tests for reusable UI primitives
- [ ] All tests pass (`pnpm test`)
- [ ] E2E tests added for critical user flows (if Playwright configured)

## Storybook Checks (minimal gate — see `frontend-storybook-checklist` for deep-dive)

- [ ] New or modified reusable UI components include Storybook stories in the same task
- [ ] Stories cover default and relevant variants/states
- [ ] Storybook static build passes (`pnpm build-storybook`)

## Performance Checks

- [ ] Images use modern formats and proper sizing
- [ ] Large lists consider virtualization
- [ ] No unnecessary re-renders (memoization where beneficial)
- [ ] Bundle size considered (no unnecessary dependencies)
- [ ] Lazy loading for heavy components or sections

## Code Quality Checks

- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run lint` passes
- [ ] `pnpm run build` passes
- [ ] `pnpm run format:check` passes
- [ ] TypeScript strict mode respected (no `any`)
- [ ] No console logs or debug statements left in production code

## Documentation Checks

- [ ] Complex logic has inline comments explaining "why", not "what"
- [ ] Public hooks/components have JSDoc comments
- [ ] New dependencies documented in PR description

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type                                                     | Route to                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| Architecture (module boundaries, layering, dependency direction) | @architecture-reviewer                                   |
| Test coverage and test quality                                   | @test-reviewer                                           |
| Code-level quality (naming, duplication, readability)            | @code-quality-reviewer                                   |
| CI/CD, Docker, build pipeline, or deployment changes             | @ops-reviewer                                            |
| Documentation accuracy and setup                                 | @docs-reviewer                                           |
| Detailed a11y audit beyond basic checklist                       | Invoke the `frontend-a11y-checklist` skill directly      |
| Storybook coverage audit beyond basic checklist                  | Invoke the `frontend-storybook-checklist` skill directly |

## Output

Structure the report using the standardized reviewer format:

- **Agent**: `frontend-reviewer` (with `frontend-review-checklist`)
- **Verdict**: PASS | FAIL | PASS_WITH_WARNINGS
- **Severity distribution**: count per severity level
- **Scope**: files and modules reviewed
- **Confidence**: HIGH | MEDIUM | LOW
- **Findings table**: columns — Sev, Category, Location (file + line), Evidence, Impact, Recommended fix, Suggested agent
- **Validation**: commands run with exact results, or NOT_AVAILABLE
- **Follow-up**: reviewers to rerun, implementers to delegate
