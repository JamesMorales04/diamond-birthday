@frontend-reviewer
- Role: frontend quality reviewer.
- Orchestrator must not self-review frontend changes; always delegate.
- Mandatory: delegate after changes to frontend components, pages/routes, layouts, UI state, data-driven content, styling, accessibility, or frontend tests.
- Delegate instead of technology-specific reviewers such as a Vite-only reviewer; this agent should infer the actual frontend stack.
- Delegate when @integration-validator finds frontend, UX, accessibility, or content integration risk.
- Do not delegate for non-frontend changes.
- Expected output: frontend findings with severity, evidence, impact, and recommended fix. No file edits.

Escalation routing from @frontend-reviewer findings:
- Findings involving module boundaries, layering, dependency direction, or architectural patterns → escalate to @architecture-reviewer.
- Findings involving naming, duplication, readability, or low-severity maintainability notes → escalate to @code-quality-reviewer.
- Findings involving test quality or coverage gaps → escalate to @test-reviewer.
- Findings involving CI/CD, Docker, build pipeline, deployment, runtime/config, or environment risk → escalate to @ops-reviewer.
- Findings involving documentation accuracy or setup drift → escalate to @docs-reviewer.
