---
name: config-policy-audit
description: >
  Audit prompt policy centralization, artifact role clarity, and terminology
  consistency across the opencode configuration. Detect duplicated policy text
  in prompts that should reference canonical docs instead. Verify that
  generated vs maintained artifact roles are clearly documented. Use when
  auditing prompt maintenance health, reviewing orchestrator policy text, or
  checking that artifact ownership is unambiguous. Triggers on: "audit policy
  centralization", "check artifact roles", "policy text audit", "terminology
  consistency check", "orchestrator policy audit".
license: MIT

metadata:
  author: project
  version: '1.0'
  generatedBy: '1.3.1'
---

# Config Policy Audit

Audit prompt policy centralization, artifact role clarity, and terminology consistency across the opencode configuration. This skill complements `prompt-drift-auditor` (which checks sync/drift) by focusing on whether policy text is properly centralized and whether artifact roles are unambiguous.

## When to Use

- After modifying orchestrator policy text or agent prompts
- When auditing whether policy duplication exists across prompts
- When verifying that generated vs maintained artifact roles are clearly documented
- Periodic maintenance to catch accumulated policy sprawl
- Before adding new agents or skills to verify the policy layering model is followed

## Audit Dimensions

| Dimension                                 | What to Check                                                                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Policy centralization**                 | No two files contain the same policy text verbatim; shared rules live in canonical docs, not duplicated across prompts                                                            |
| **Artifact role clarity**                 | Every opencode artifact (source JSONC, prompt files, runtime JSON, orchestrator_append, routing matrix) has a clear, documented role (generated vs maintained vs source-of-truth) |
| **Terminology consistency**               | "Source of truth", "maintained policy artifact", "canonical source", "routing reference" are used consistently across docs                                                        |
| **Prompt layering compliance**            | Prompts reference canonical docs for shared rules instead of restating them inline                                                                                                |
| **Orchestrator append vs routing matrix** | `orchestrator_append.md` does not duplicate the full routing table from `agent-routing-matrix.md`; it references the matrix and adds orchestrator-specific behavior only          |

## Audit Steps

### 1. Policy Duplication Detection

For each policy topic (quality-implementer/fixer, subagent failure recovery, delegation and routing rules, expected output conventions, source-of-truth gate):

- Identify all files that mention the topic
- Check whether the text is duplicated verbatim or near-verbatim
- Verify that one file is the canonical source and others reference it
- Flag any prompt that restates a global rule verbatim when the prompt-maintenance guide says to reference instead

### 2. Artifact Role Verification

For each opencode artifact, verify its role is clearly documented using the canonical terminology from `agent-prompt-maintenance-guide.md` section 3a:

| Artifact                            | Expected Role                          | Editable?                                             |
| ----------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `oh-my-opencode-slim.source.jsonc`  | Source of truth for agent config       | Yes — edit to add/remove/reconfigure agents           |
| `prompts/agents/*.prompt.md`        | Maintained prompt body                 | Yes — edit to update agent system prompt text         |
| `prompts/agents/*.orchestrator.md`  | Maintained orchestrator routing policy | Yes — edit to update orchestrator delegation rules    |
| `oh-my-opencode-slim.json`          | Generated runtime                      | **No** — rebuild after editing source or prompt files |
| `orchestrator_append.md`            | Maintained policy artifact             | Yes — edit to update orchestration rules              |
| `agent-routing-matrix.md`           | Canonical routing reference            | Yes — edit to update agent ownership/routing          |
| `agent-prompt-maintenance-guide.md` | Maintenance procedures                 | Yes — edit to update maintenance conventions          |

> **Note:** This table is an intentional audit mirror of the agent prompt configuration and should stay synchronized with it. If the canonical table in the README changes, update this table to match.

Check that no documentation file mislabels an artifact's role (e.g., calling a maintained artifact "generated" or vice versa).

### 3. Terminology Consistency Check

Search for these terms across all opencode docs and prompt files:

- "source of truth" / "canonical source" — should be used consistently; "source of truth" for `oh-my-opencode-slim.source.jsonc` agent config, "canonical source" for policy-domain sources
- "maintained prompt body" — should describe `prompts/agents/*.prompt.md`
- "maintained orchestrator routing policy" — should describe `prompts/agents/*.orchestrator.md`
- "maintained policy artifact" — should only describe `orchestrator_append.md`
- "generated runtime" — should only describe `oh-my-opencode-slim.json`
- "canonical routing reference" — should describe `agent-routing-matrix.md`
- "maintenance procedures" — should describe `agent-prompt-maintenance-guide.md`

Flag any inconsistencies in usage. The canonical artifact-role table with editable-status is in `agent-prompt-maintenance-guide.md` section 3a.

### 4. Prompt Layering Compliance

For each agent prompt:

- Verify it references `prompt-execution-context.md` or `AGENTS.md` for global rules
- Verify it does not restate repository-wide anti-patterns, validation rules, or quality gates verbatim
- Verify it states only role-specific rules, ownership, handoff, and expected output
- Flag any prompt that contains more than 3 lines of duplicated global policy

### 5. Orchestrator Append Focus

Specifically check `orchestrator_append.md` for:

- Full routing table duplication with `agent-routing-matrix.md` — should reference the matrix instead
- Full specialist reviewer matrix duplication — should reference the matrix
- Whether orchestrator-specific behavior (planning gate, quality-first remediation, direct execution budget, failure recovery, workflow steps) is preserved without unnecessary duplication

## Output Format

```markdown
## Config Policy Audit Report

### Policy Centralization: PASS | WARNINGS

[Details of any duplicated policy text]

### Artifact Role Clarity: PASS | WARNINGS

[Details of any mislabeled or unclear artifact roles]

### Terminology Consistency: PASS | WARNINGS

[Details of inconsistent terminology usage]

### Prompt Layering Compliance: PASS | WARNINGS

[N prompts with duplicated global rules, details]

### Orchestrator Append Focus: PASS | WARNINGS

[Specific duplication or clarity issues in orchestrator_append.md]

### Summary

- Total checks: N
- Passed: N
- Warnings: N
- Failures: N
```

## Guardrails

- Report only — do not modify files unless explicitly asked to fix
- Distinguish between critical issues (contradictory roles, broken references) and minor issues (formatting inconsistencies, terminology drift)
- When reporting duplication, note whether the duplication is harmful (causes maintenance burden, risks drift) or benign (intentional reinforcement of critical rules)
