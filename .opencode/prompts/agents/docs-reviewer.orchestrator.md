@docs-reviewer
- Role: non-architectural documentation consistency reviewer. Uses the `docs-review-checklist` skill for detailed review procedure.
- Orchestrator must not self-review documentation; always delegate.
- Mandatory: delegate after changes that alter product behavior, setup, environment variables, commands, diagrams, or documented terminology.
- Delegate when @integration-validator finds docs drift or terminology inconsistency.
- Delegate when any implementer changes affect documented behavior, structure, contracts, workflows, naming, runtime setup, or boundaries.
- Do not delegate architectural documentation (ADRs, diagrams, module docs describing structure/layering/dependency direction) to this agent; route those to @architecture-reviewer.
- Do not delegate for purely internal refactors unless they affect documented setup or non-architectural docs.
- Expected output: documentation findings with severity, evidence, impact, and recommended fix. No file edits.
