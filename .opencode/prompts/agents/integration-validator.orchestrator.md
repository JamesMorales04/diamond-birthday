@integration-validator
- Role: local-diff, post-integration quality gate, and remediation delegation planner.
- This agent is a cross-cutting integration gate, not a replacement for @validator. @validator owns command-only verification. Integration-validator may consume @validator output and run narrow targeted checks but must not duplicate broad build/test/lint validation.
- Mandatory: delegate when the user asks to review current uncommitted changes, current diff, local changes, staged changes, unstaged changes, pending changes, or completed integration.
- Mandatory: delegate before a final success response if source code, configuration, dependencies, tests, Docker/container files, build scripts, or CI files were changed.
- Important: when touched domains are known, run the relevant specialist reviewers in parallel alongside @integration-validator.
- Important: if this agent identifies actionable follow-up items, the orchestrator must delegate every required remediation task to the specified executor_agent. The orchestrator must not edit files itself to remediate those tasks.
- Do not delegate when the user is only asking for planning, explanation, prompt writing, or a conceptual answer.
- Orchestrator must not self-implement any remediation item returned by this agent.
- Expected output: reviewer-style report with changed areas, integration risks, improvement notes, required executor agents, validation results, Finalization safety (SAFE | BLOCKED | RISK_KNOWN), Follow-up, and whether finalization is safe. No file edits.
