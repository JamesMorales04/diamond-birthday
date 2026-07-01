---
name: test-implementation-checklist
description: Project-specific implementation-side checklist for writing, updating, and structuring tests. Covers test-type selection, framework awareness, fixture isolation, assertion quality, and minimal testability changes. Use when implementing tests for acceptance criteria, bug fixes, behavioral coverage, or reviewer-reported gaps.
license: MIT
metadata:
  author: ops
  version: "1.0"
---

# Test Implementation Checklist Skill

## When to Use

Trigger this skill when **implementing** (not reviewing) tests that involve:
- New or updated tests for acceptance criteria, bug fixes, or behavioral coverage
- Tests for frontend components, content integration, game state logic, or utility functions
- Missing coverage identified by `@test-reviewer` or `@integration-validator`
- Testability-only production-code changes to enable testing

## Required Context

Before writing tests, confirm the agent has applied:
- `AGENTS.md`

## 1. Test Type Selection

Choose the lightest test type that proves the required behavior:

| Test Type | Use When | Avoid When |
|-----------|----------|------------|
| **Unit** | Pure logic, utility functions, game state calculations, data transformations, parsers | Behavior depends on DOM, browser APIs, or complex component interactions |
| **Component** | React component rendering, user interactions, state changes, a11y behavior | Simple pure functions with no UI (use unit test instead) |
| **E2E** | Critical user journeys, content rendering flows, mini-game completion flows, multi-step workflows | Individual component behavior (use component tests instead) |

**Rule**: Prefer unit tests by default. Only escalate to component or E2E tests when the behavior genuinely requires browser or user interaction.

## 2. Framework Awareness

### Frontend (React/TypeScript with Vite)
- **Vitest** + **React Testing Library** for component and hook tests
- Use `@testing-library/user-event` for interaction simulation
- Test accessible role and visible text, not internal component state
- Prefer `screen.getByRole` / `screen.getByText` over `getByTestId`
- Co-locate tests next to source files or under `__tests__/` per existing convention
- For E2E tests, use Playwright (if configured for the project)

## 3. Fixture Isolation and Determinism

- [ ] Each test is independent; no test depends on another test's state or execution order
- [ ] Test data is created within the test or per-test setup; no shared mutable state across tests
- [ ] Time-dependent tests use fixed timestamps or mocked clocks; no reliance on `Date.now`
- [ ] Random or non-deterministic inputs are seeded or fixed; tests produce the same result on every run
- [ ] Cleanup is explicit rather than relying on process teardown

## 4. Assertion Quality

- [ ] Assertions verify behavior, not implementation details (test what, not how)
- [ ] No tautological tests: every assertion must fail if the behavior is wrong
- [ ] Assert on meaningful outcomes: return values, rendered content, state changes
- [ ] Each test has a clear Arrange/Act/Assert structure with exactly one logical assertion per behavior
- [ ] Error-path assertions verify error messages and boundary conditions

## 5. Minimal Testability-Only Production Code Changes

Production code changes for testability must be **tiny, explicitly scoped, and justified**:

- [ ] Accept dependency injection over making static methods testable via wrappers
- [ ] Do not change behavior or business rules for testability
- [ ] Document the testability change in the "Testability assumptions" output field
- [ ] Verify the testability change does not alter the public API surface

## 6. Validation Handoff

- [ ] Prepare exact validation commands for `@validator`; do not claim validation you did not run
- [ ] List the specialist reviewers that should re-check the change
- [ ] Include test-output or coverage follow-up if the tests reveal broader gaps

## Output Shape

Return work in a compact implementation summary with:
- Files changed
- Coverage added (acceptance criteria and behaviors now covered)
- Gaps remaining (scenarios not covered, deferred items)
- Testability assumptions (production-code changes made for testability)
- Assumptions (test framework or infrastructure constraints)
- Validation commands for @validator
- Reviewers to re-run
