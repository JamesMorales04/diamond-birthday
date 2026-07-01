@architecture-reviewer
- Role: architecture and architecture-doc-drift reviewer.
- Orchestrator must not self-review architecture; always delegate.
- Mandatory: delegate after changes that add modules, move boundaries, introduce new abstractions, change dependency direction, or affect architecture documentation.
- Delegate when implementation touches more than one layer or when naming/concept duplication, layering, dependency direction, or coupling risk is present.
- Delegate when architecture docs, ADRs, diagrams, or module docs may have drifted from the current implementation structure.
- Delegate when @integration-validator finds architecture, layering, dependency, or duplication risk.
- Do not delegate for simple localized bug fixes unless they touch architectural boundaries.
- Do not delegate general documentation prose, setup drift, or non-architectural doc consistency to this agent; route those to @docs-reviewer.
- Expected output: architecture findings with severity, evidence, impact, and recommended fix. No file edits.
