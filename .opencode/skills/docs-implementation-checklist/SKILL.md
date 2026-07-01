---
name: docs-implementation-checklist
description: Project-specific docs implementation checklist for Markdown docs, ADRs, setup notes, prompt files, skill files, README skill inventory updates, and terminology alignment. Use when implementing documentation changes, prompt maintenance, source-of-truth mapping, link integrity, or docs/config sync work.
---

# Docs Implementation Checklist

Use this skill when implementing documentation changes. It is an implementation-side checklist, not a review checklist.

## Use when

- Markdown docs, ADRs, setup notes, prompt files, skill files, README skill inventory updates, or terminology alignment change.
- Prompt files, skill files, README skill inventory entries, routing docs, or other opencode-maintenance artifacts change.
- Documentation edits may affect acceptance criteria, ownership, or cross-document consistency.

## Preflight

Before editing:

- Read `AGENTS.md`.
- For prompt/config/routing changes, also read `.opencode/oh-my-opencode-slim/default-preset/orchestrator_append.md`, the affected prompt/config files, and the relevant `.opencode/README.md` skill inventory entry when description or triggers change.
- Confirm the canonical source before editing: task request and canonical docs; if that reveals a requirement/acceptance-criteria change, escalate instead of silently resolving it.

## Implementation checks

- Treat source-of-truth decisions as explicit: do not invent acceptance criteria or product behavior.
- Preserve canonical terminology and avoid unsupported behavior.
- Keep writing clean and consistent with existing architecture.
- Split files when audiences or responsibilities diverge.
- Add or update cross-links when they improve discoverability.
- Verify edited links resolve and new docs have at least one inbound canonical link when practical.
- Keep stable headings unless the structure intentionally changes.
- When prompt or routing files are edited, apply the `prompt-drift-auditor` skill before finalizing prompt files, routing docs, skill references, source JSON, or runtime JSON changes.

## Source-of-truth mapping

- Identify the canonical source before editing: task request or canonical docs.
- Do not resolve requirement drift silently; escalate when the docs reveal acceptance-criteria changes.

## Prompt/config sync checks

- If a skill name, description, or trigger changes, update `.opencode/README.md` skill inventory and any prompt references.
- If agent skill assignments change, update `.opencode/oh-my-opencode-slim.source.jsonc` and rebuild/check the runtime JSON.
- If prompt files change, verify the source config and runtime JSON stay in sync.
- Verify no stale skill references remain in prompts, README inventory, or runtime config.

## Documentation consistency checks

- Verify cross-document links resolve.
- Verify new docs have discoverability/inbound links when practical.
- Verify the changed docs stay consistent with architecture, terminology, and workflows.

## Escalation

- If docs edits reveal acceptance criteria changes or requirement drift, escalate to the orchestrator.
- If ADRs, diagrams, or structure docs about layering or ownership drift, route to `@architecture-reviewer`.
- If non-architectural docs drift from implementation, route to `@docs-reviewer`.

## Expected output

- Files changed
- Assumptions
- Source-of-truth checked
- Prompt/config sync status
- Documentation consistency checklist result
- Link / inbound-link status
- Validation commands for @validator
- Terminology/decision updates
- Cross-links added
- Documentation consistency risks
- Reviewers to re-run
- Follow-up
