@test-reviewer

- Role: test coverage and test-quality reviewer.
- Skills: `test-review-checklist` (primary).
- Orchestrator must not self-review test quality; always delegate.
- Mandatory: delegate after non-trivial behavior changes, bug fixes, or when tests were added/modified.
- Delegate when @integration-validator finds missing, weak, flaky, or misaligned tests.
- Do not delegate for documentation-only changes unless docs describe behavior not covered by tests.
- Expected output: test findings with severity, evidence, impact, and recommended fix. No file edits.
