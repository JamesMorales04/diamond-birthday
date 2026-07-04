---
name: test-review-checklist
description: >
  Project-specific test review checklist for acceptance coverage, edge cases,
  failure paths, regression proof, weak assertions, flaky tests, fixture
  quality, order dependence, environment coupling, and validation evidence
  quality. Use when reviewing test code changes that touch unit, component,
  or end-to-end tests. Does not replace architecture or code-quality specialist
  ownership.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: project
  version: '1.0'
---

# Test Review Checklist Skill

## When to Use

Trigger this skill when reviewing test code changes that involve:

- Unit, component, or end-to-end tests
- Test fixtures, mocks, stubs, or test data setup
- Coverage additions or modifications for new behavior
- Flaky or environment-sensitive tests
- Acceptance-criteria test evidence mapping

## Review Discipline

- [ ] Inspect the **full changed test file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Check directly related test files, fixtures, and production code the tests depend on
- [ ] Every finding must cite exact file paths, line numbers, or test evidence; no speculative severity claims

## Acceptance Coverage

- [ ] Every new behavior or changed behavior has corresponding test(s)
- [ ] Tests cover the acceptance criteria stated in the task or issue
- [ ] Tests cover both happy-path and sad-path scenarios
- [ ] Edge cases are explicitly tested (boundary values, empty collections, max lengths, zero values)
- [ ] Integration boundaries (cross-component, cross-module) are tested where applicable

## Failure Paths and Error Handling

- [ ] Tests verify behavior on expected failure paths (invalid input, missing data, timeouts)
- [ ] Error messages and error shapes are validated, not just that an error occurred
- [ ] Graceful degradation under partial failure is tested where applicable

## Regression Proof

- [ ] Tests assert behavior, not implementation details
- [ ] Tests would catch the original bug if the fix were reverted
- [ ] No tests that pass regardless of the implementation (tautological tests)

## Weak Assertions

- [ ] No assertions that only check for non-null or truthiness without verifying the actual value
- [ ] No empty test bodies or tests with no assertions
- [ ] Assertions verify the complete expected outcome, not just a partial match
- [ ] Async operations are properly awaited before assertions

## Flaky Tests

- [ ] No time-dependent tests without fixed timestamps or deterministic time sources
- [ ] No tests that depend on specific execution order unless order is part of the contract
- [ ] No tests that depend on external network or filesystem availability
- [ ] No tests that depend on non-deterministic data (random values without fixed seeds)
- [ ] No tests with race conditions in concurrent or parallel execution

## Fixture Quality

- [ ] Test data setup is explicit and readable
- [ ] Fixtures are isolated — one test's setup does not affect another test's assertions
- [ ] Shared fixtures are minimal and scoped to what the tests actually need
- [ ] Factories or builders are consistent with the domain model

## Order Dependence

- [ ] Tests do not depend on global mutable state that another test may modify
- [ ] Each test is self-contained: setup → act → assert → teardown

## Environment Coupling

- [ ] Tests do not depend on specific environment variables unless they set their own defaults
- [ ] Tests do not depend on specific ports, file paths, or OS-specific behavior
- [ ] Tests do not depend on external service availability

## Validation Evidence Quality

- [ ] Test names clearly describe what behavior is being verified
- [ ] Test structure follows Arrange-Act-Assert or equivalent clear pattern
- [ ] Comments explain non-obvious test setup or complex assertions
- [ ] Test coverage is adequate for the risk level of the changed behavior

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type                                    | Route to               |
| ----------------------------------------------- | ---------------------- |
| Architecture (module boundaries, layering)      | @architecture-reviewer |
| Code quality (naming, duplication, readability) | @code-quality-reviewer |
| Frontend component behavior or UI correctness   | @frontend-reviewer     |
| Documentation accuracy or setup drift           | @docs-reviewer         |
