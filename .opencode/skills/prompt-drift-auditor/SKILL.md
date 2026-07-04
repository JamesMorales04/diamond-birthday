---
name: prompt-drift-auditor
description: >
  Detect prompt, runtime JSON, routing matrix, and stale reference drift across
  the opencode configuration. Use when prompts may be out of sync, when the
  runtime JSON does not match the source, when routing references are stale, or
  when auditing prompt maintenance health. Triggers on: "check prompt drift",
  "audit prompts", "prompt sync check", "stale references", "routing matrix
  drift", "validate opencode config".
license: MIT

metadata:
  author: project
  version: '1.0'
  generatedBy: '1.3.1'
---

# Prompt Drift Auditor

Detect and report drift across prompt files, runtime JSON, routing matrix references, and agent configuration. This skill ensures the opencode configuration remains internally consistent.

## When to Use

- After modifying agent prompts, the routing matrix, or the source JSONC
- Before committing configuration changes
- When agents exhibit unexpected behavior that may stem from stale prompts
- Periodic maintenance to catch accumulated drift

## Drift Dimensions

| Dimension                                | What to Check                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Source → Runtime**                     | `oh-my-opencode-slim.source.jsonc` matches `oh-my-opencode-slim.json`                           |
| **Prompt files → Source**                | All `promptPath` / `orchestratorPromptPath` references resolve to existing files                |
| **Prompt content → Agent role**          | Each prompt's content matches the agent's role in the routing matrix                            |
| **Routing matrix → Agent list**          | Every agent in `agent-routing-matrix.md` exists in the source config and vice versa             |
| **Skill references → Skill dirs**        | Every skill ID referenced in agent configs has a corresponding `.opencode/skills/<id>/SKILL.md` |
| **Orchestrator append → Routing matrix** | `orchestrator_append.md` rules are consistent with `agent-routing-matrix.md`                    |
| **Cross-references**                     | Prompts that reference other agents or docs use correct, current paths                          |

## Audit Steps

### 1. Source → Runtime Check

```bash
pnpm run opencode:check
```

If this fails, the runtime JSON is stale and must be rebuilt before any other check is meaningful.

### 2. Prompt Path Resolution

For every agent in `oh-my-opencode-slim.source.jsonc`:

- Verify `promptPath` points to an existing file
- Verify `orchestratorPromptPath` points to an existing file
- Flag any agent with no prompt files

### 3. Routing Matrix Completeness

Compare agents in `agent-routing-matrix.md` against agents in the source config:

- Agents in matrix but not in config → missing agent definition
- Agents in config but not in matrix → undocumented agent
- Agents with skills referencing non-existent skill directories → broken skill reference

### 4. Stale Reference Detection

Search all prompt files and `orchestrator_append.md` for:

- References to file paths that no longer exist
- Agent names that are not in the current agent list
- Section headings that were renamed or removed
- Documentation paths that have been moved or renamed

### 5. Content Consistency Spot-Check

For each agent, verify that:

- The prompt's stated role matches the routing matrix ownership
- The prompt's "must not do" list is consistent with the agent's scope
- The orchestrator prompt delegates correctly to the agent's capabilities
- No prompt contradicts another prompt on shared rules

## Output Format

```markdown
## Prompt Drift Audit Report

### Source → Runtime: PASS | FAIL

[Details if failed]

### Prompt Path Resolution: N/M resolved

[Missing paths if any]

### Routing Matrix Completeness: N/M agents matched

[Unmatched agents if any]

### Stale References: N found

| File | Stale Reference | Suggested Fix |
| ---- | --------------- | ------------- |
| ...  | ...             | ...           |

### Content Consistency: PASS | WARNINGS

[Contradictions or misalignments if any]

### Summary

- Total checks: N
- Passed: N
- Warnings: N
- Failures: N
```

## Companion Skill

This skill focuses on **sync and drift** (source→runtime, prompt→source, routing completeness, stale references). For **policy centralization** (duplicated policy text, artifact role clarity, terminology consistency), use the companion `config-policy-audit` skill.

## Guardrails

- Report only — do not modify files unless explicitly asked to fix
- Do not rebuild the runtime JSON as part of this audit unless asked
- If drift is found, list the specific files and lines that need updating
- Distinguish between critical drift (broken references, missing agents) and minor drift (formatting inconsistencies)
